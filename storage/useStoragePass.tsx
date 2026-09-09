import { create } from "zustand";
import { encrypt } from "@/lib/crypto/encryptData";
import { buildVaultFile } from "@/lib/vault/saveVault";
import { deriveKey } from "@/lib/crypto/kdfKey";
import { loadVault } from "@/lib/vault/loadVault";
import { decrypt } from "@/lib/crypto/decryptData";
import { sileo } from "sileo";
import type { PasswordEntry , PassStorage, ImportResult, ExportResult, ToogleDeriveKey } from "@/types";


export const useStoragePass = create<PassStorage>((set, get) => ({
  salt: null,
  derivedKey: null,
  loading: false,
  dataPassword: [],
  isUnLocked: false,
  isResetting: false,

  setDataPassword: () => set({ dataPassword: [] }),
  setDataPasswordInit: (data: PasswordEntry[]) => set({ dataPassword: data }),
  setDataPasswordUpdate: (data) =>
    set((state) => ({ dataPassword: [...state.dataPassword, data] })),
  setDataPasswordEdit: (data) =>
    set((state) => ({
      dataPassword: state.dataPassword.map((item) =>
        item.id === data.id ? data : item
      ),
    })),
  setDataPasswordFavorite: (id) =>
    set((state) => ({
      dataPassword: state.dataPassword.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      ),
    })),
  setDataPasswordDelate: (id) =>
    set((state) => ({
      dataPassword: state.dataPassword.filter((item) => item.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
  setDerivedKey: (key) => set({ derivedKey: key }),
  setSalt: (salt) => set({ salt }),
  setIsUnLocked: (value) => set({ isUnLocked: value }),

  toogleDeriveKey: async (password: string) => {
    const saltSave = JSON.parse(localStorage.getItem("salt") || "null");
    if (!saltSave) {
      console.log("No existe salt");
      return;
    }
    const salt = new Uint8Array(saltSave);
    try {
      const drvKey = await deriveKey(password, salt);
      set({ salt, derivedKey: drvKey });
    } catch (error) {
      console.error("Error derivando key", error);
      set({ derivedKey: null });
    }
  },

  handleExport: async (dataPassword) => {
    const { derivedKey, salt } = get();

    if (!derivedKey) {
      sileo.error({
        title: "Error al exportar los datos",
        description: "No se pudo derivar la clave",
        duration: 5000,
        styles: { title: "text-white!" },
      });
      return;
    }

    const encrypted = await encrypt(derivedKey, dataPassword);
    const { iv, data } = encrypted;

    if (!iv || !data) {
      sileo.error({
        title: "Error al encriptar",
        description: "No se pudo encriptar los datos",
        duration: 5000,
        styles: { title: "text-white!" },
      });
      return;
    }

    const ivArray = new Uint8Array(iv);
    const dataArray = new Uint8Array(data);

    if (!salt) {
      sileo.error({
        title: "Error al exportar",
        description: "Salt no disponible",
        duration: 5000,
        styles: { title: "text-white!" },
      });
      return;
    }

    const vaultFile = buildVaultFile(salt, ivArray, dataArray);
    if (!vaultFile) return;

    const blob = new Blob([vaultFile.slice()], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pass.enc";
    a.click();
    URL.revokeObjectURL(url);
  },

  handleImport: async (file: File, password: string): Promise<ImportResult> => {
    const vaultData = await loadVault({ file });

    if (!vaultData.state) {
      return {
        state: false,
        message: {
          title: "Error Fatal",
          description: "No se pudo cargar el archivo",
          duration: 5000,
          styles: { title: "text-white!" },
        },
      };
    }

    const { salt, iv, data } = vaultData;

    if (!salt || !iv || !data) {
      return {
        state: false,
        message: {
          title: "Error Fatal",
          description: "No se pudo cargar el archivo",
          duration: 5000,
          styles: { title: "text-white!" },
        },
      };
    }

    localStorage.setItem("salt", JSON.stringify(Array.from(salt)));
    await get().toogleDeriveKey(password);

    const key = get().derivedKey;

    if (!key) {
      return {
        state: false,
        message: {
          title: "Error Fatal",
          description: "No se pudo derivar la clave",
          duration: 5000,
          styles: { title: "text-black!" },
        },
      };
    }

    const decryptedData = await decrypt(key, { iv, data });

    if (!decryptedData.status) {
      return {
        state: false,
        message: decryptedData.message,
      };
    }

    return {
      state: true,
      decryptedData: decryptedData.data,
      salt,
      drcKey: key,
    };
  },

  handleReset: async () => {
    set({ isResetting: true, isUnLocked: false });
    localStorage.removeItem("salt");
    set({ salt: null, derivedKey: null, dataPassword: [] });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ isResetting: false });
  },
}));
