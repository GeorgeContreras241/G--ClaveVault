export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  favorite: boolean;
  url: string;
  category: string;
}

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

export interface EditPasswordProps {
  password: PasswordEntry;
  onClose: () => void;
}

export interface PasswordCardProps {
  password: PasswordEntry;
  showPasswords: { [key: string]: boolean };
  onTogglePasswordVisibility: (id: string) => void;
  onCopyToClipboard: (text: string) => void;
  onEditPassword: (password: PasswordEntry) => void;
  onDeletePassword: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  getCategoryIcon: (category: string) => React.ReactNode;
}

export interface OfflineUnlockProps {
  onSuccess: (value: boolean) => void;
}

export interface HeaderManagerProps {
  setSearchTerm: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  selectedCategory: string;
  searchTerm: string;
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

export type ToogleDeriveKey = (password: string) => Promise<void>;

export interface FormErrors {
  title?: string;
  username?: string;
  password?: string;
  url?: string;
}

export type PassStorage = {
  salt: Uint8Array | null;
  derivedKey: CryptoKey | null;
  loading: boolean;
  dataPassword: PasswordEntry[];
  isUnLocked: boolean;
  isResetting: boolean;
  version: number;
  setDataPassword: () => void;
  setDataPasswordInit: (data: PasswordEntry[]) => void;
  setDataPasswordUpdate: (data: PasswordEntry) => void;
  setDataPasswordEdit: (data: PasswordEntry) => void;
  setDataPasswordFavorite: (id: string) => void;
  setDataPasswordDelate: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setDerivedKey: (key: CryptoKey) => void;
  setSalt: (salt: Uint8Array) => void;
  setIsUnLocked: (value: boolean) => void;
  setVersion: (version: number) => void;
  toogleDeriveKey: ToogleDeriveKey;
  handleExport: ExportResult;
  handleImport: (file: File, password: string) => Promise<ImportResult>;
  handleReset: () => Promise<void>;
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
