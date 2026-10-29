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

/** Nombre de archivo seguro y reconocible para la bóveda exportada. */
function toFileSlug(name: string | null): string {
  const slug = (name ?? 'clavevault')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'clavevault';
}

export const useStoragePass = create<PassStorage>((set, get) => ({
  salt: null,
  derivedKey: null,
  dataPassword: [],
  isUnlocked: false,
  version: 1,
  vaults: [],
  activeVaultId: null,
  activeVaultName: null,

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
  setVaults: (vaults) => set({ vaults }),
  setActiveVault: (vault) =>
    set({
      activeVaultId: vault?.id ?? null,
      activeVaultName: vault?.name ?? null,
    }),
  clearActiveVault: () => set({ activeVaultId: null, activeVaultName: null }),

  handleExport: async (dataPassword) => {
    const { derivedKey, salt, activeVaultName } = get();

    try {
      if (!derivedKey) {
        sileo.error({
          title: 'Error al exportar los datos',
          description: 'No se pudo derivar la clave',
          duration: 5000,
        });

        return;
      }

      if (!salt) {
        sileo.error({
          title: 'Error al exportar',
          description: 'Salt no disponible',
          duration: 5000,
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
        });
        return;
      }

      const blob = new Blob([vaultFile.slice()], {
        type: 'application/octet-stream',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${toFileSlug(activeVaultName)}.enc`;
      // Algunos navegadores ignoran el click si el ancla no está en el DOM,
      // y revocar el object URL de inmediato cancela la descarga.
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      sileo.success({
        title: 'Bóveda exportada correctamente.',
        duration: 1000,
      });
    } catch {
      sileo.error({
        title: 'Error al exportar los datos',
        description: 'No se pudo generar el archivo',
        duration: 5000,
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
        },
      };
    }
  },

  handleReset: async () => {
    // Bloquea la bóveda activa pero conserva la lista para el selector.
    localStorage.removeItem('salt');
    set({
      isUnlocked: false,
      salt: null,
      derivedKey: null,
      dataPassword: [],
      version: 1,
      activeVaultId: null,
      activeVaultName: null,
    });
  },

  resetSession: async () => {
    // Cierre de sesión: además de la bóveda, olvida la lista de metadatos.
    localStorage.removeItem('salt');
    set({
      isUnlocked: false,
      salt: null,
      derivedKey: null,
      dataPassword: [],
      version: 1,
      activeVaultId: null,
      activeVaultName: null,
      vaults: [],
    });
  },
}));
