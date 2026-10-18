'use client';
import { create } from 'zustand';
import { encrypt } from '@/commons/lib/crypto/encryptData';
import { buildVaultFile } from '@/commons/lib/vault/saveVault';
import { deriveKey } from '@/commons/lib/crypto/kdfKey';
import { loadVault } from '@/commons/lib/vault/loadVault';
import { decrypt } from '@/commons/lib/crypto/decryptData';
import { sileo } from 'sileo';
import type { PassStorage, ImportResult } from '@/types';
import type { PasswordEntry } from '@/features/vault-management';

export const useStoragePass = create<PassStorage>((set, get) => ({
  salt: null,
  derivedKey: null,
  dataPassword: [],
  isUnlocked: false,
  version: 1,

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
  setDataPasswordDelete: (id) =>
    set((state) => ({
      dataPassword: state.dataPassword.filter((item) => item.id !== id),
    })),
  setDerivedKey: (key) => set({ derivedKey: key }),
  setSalt: (salt) => set({ salt }),
  setIsUnlocked: (value) => set({ isUnlocked: value }),
  setVersion: (version) => set({ version }),

  handleExport: async (dataPassword) => {
    const { derivedKey, salt } = get();

    try {
      if (!derivedKey) {
        sileo.error({
          title: 'Error al exportar los datos',
          description: 'No se pudo derivar la clave',
          duration: 5000,
          styles: { title: 'text-white!' },
        });
        return;
      }

      if (!salt) {
        sileo.error({
          title: 'Error al exportar',
          description: 'Salt no disponible',
          duration: 5000,
          styles: { title: 'text-white!' },
        });
        return;
      }

      const encrypted = await encrypt(derivedKey, dataPassword);
      const { iv, data } = encrypted;

      if (!iv || !data) {
        sileo.error({
          title: 'Error al encriptar',
          description: 'No se pudo encriptar los datos',
          duration: 5000,
          styles: { title: 'text-white!' },
        });
        return;
      }

      const vaultFile = buildVaultFile(
        salt,
        new Uint8Array(iv),
        new Uint8Array(data)
      );
      if (!vaultFile) {
        sileo.error({
          title: 'Error al exportar',
          description: 'La bóveda tiene un formato inválido',
          duration: 5000,
          styles: { title: 'text-white!' },
        });
        return;
      }

      const blob = new Blob([vaultFile.slice()], {
        type: 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pass.enc';
      a.click();
      URL.revokeObjectURL(url);

      sileo.success({
        title: 'Bóveda exportada correctamente.',
        duration: 1000,
      });
    } catch {
      sileo.error({
        title: 'Error al exportar los datos',
        description: 'No se pudo generar el archivo',
        duration: 5000,
        styles: { title: 'text-white!' },
      });
    }
  },

  handleImport: async (file: File, password: string): Promise<ImportResult> => {
    try {
      const vaultData = await loadVault({ file });

      if (!vaultData.state) {
        return {
          state: false,
          message: {
            title: 'Error al cargar',
            description: 'No se pudo leer el archivo',
            duration: 5000,
            styles: { title: 'text-white!' },
          },
        };
      }

      const { salt, iv, data } = vaultData;

      if (salt.length !== 16 || iv.length !== 12 || data.length < 16) {
        return {
          state: false,
          message: {
            title: 'Archivo inválido',
            description: 'El archivo no tiene el formato de bóveda esperado',
            duration: 5000,
            styles: { title: 'text-white!' },
          },
        };
      }

      let drvKey: CryptoKey;
      try {
        drvKey = await deriveKey(password, salt);
      } catch {
        return {
          state: false,
          message: {
            title: 'Error al derivar la clave',
            duration: 5000,
            styles: { title: 'text-white!' },
          },
        };
      }

      const decryptedData = await decrypt(drvKey, { iv, data });

      if (!decryptedData.status) {
        return { state: false, message: decryptedData.message };
      }

      // Solo se persiste la salt tras validar contraseña y descifrar.
      localStorage.setItem('salt', JSON.stringify(Array.from(salt)));
      set({ salt, derivedKey: drvKey });

      return {
        state: true,
        decryptedData: decryptedData.data,
        salt,
        drcKey: drvKey,
      };
    } catch {
      return {
        state: false,
        message: {
          title: 'Error al procesar el archivo',
          duration: 5000,
          styles: { title: 'text-white!' },
        },
      };
    }
  },

  handleReset: async () => {
    set({ isUnlocked: false });
    localStorage.removeItem('salt');
    set({ salt: null, derivedKey: null, dataPassword: [], version: 1 });
  },
}));
