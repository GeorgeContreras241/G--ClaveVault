import type { PasswordEntry } from '@/features/vault-management';

/** Form state shared by AddPasswords / EditPassword (includes legacy `application` field). */
export interface PasswordFormKeys {
  id: string;
  title: string;
  application: string;
  username: string;
  password: string;
  url: string;
  category: string;
  favorite: boolean;
}

/** Metadatos de una bóveda que se pueden mostrar antes de desbloquear. */
export interface VaultSummary {
  id: string;
  name: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type VaultCipherPayload = {
  iv: Uint8Array | number[];
  data: Uint8Array | number[];
};

export type EncryptResult = {
  iv: number[];
  data: number[];
};

type DecryptSuccess = {
  status: true;
  data: PasswordEntry[];
};

type DecryptFailure = {
  status: false;
  message: ToastMessage;
};

export type DecryptResult = DecryptSuccess | DecryptFailure;

export interface ToastMessage {
  title: string;
  description?: string;
  duration?: number;
  fill?: string;
  styles?: {
    title?: string;
    description?: string;
  };
}

export type ImportResult = {
  state: boolean;
  message?: ToastMessage;
  decryptedData?: PasswordEntry[];
  salt?: Uint8Array;
  drcKey?: CryptoKey | null;
};

export type ExportResult = (entries: PasswordEntry[]) => Promise<void>;

export type PassStorage = {
  salt: Uint8Array | null;
  derivedKey: CryptoKey | null;
  dataPassword: PasswordEntry[];
  isUnlocked: boolean;
  version: number;
  vaults: VaultSummary[];
  activeVaultId: string | null;
  activeVaultName: string | null;
  setDataPasswordInit: (data: PasswordEntry[]) => void;
  setDataPasswordUpdate: (data: PasswordEntry) => void;
  setDataPasswordEdit: (data: PasswordEntry) => void;
  setDataPasswordFavorite: (id: string) => void;
  setDataPasswordDelete: (id: string) => void;
  setDerivedKey: (key: CryptoKey) => void;
  setSalt: (salt: Uint8Array) => void;
  setIsUnlocked: (value: boolean) => void;
  setVersion: (version: number) => void;
  setVaults: (vaults: VaultSummary[]) => void;
  setActiveVault: (vault: VaultSummary | null) => void;
  clearActiveVault: () => void;
  handleExport: ExportResult;
  handleImport: (file: File, password: string) => Promise<ImportResult>;
  handleReset: () => Promise<void>;
  resetSession: () => Promise<void>;
};

// cookies.ts

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  maxAge?: number;
};

export interface CookieJar {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
}
