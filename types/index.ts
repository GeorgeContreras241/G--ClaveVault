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

export interface LocalContextValue {
  saltRef: React.MutableRefObject<Uint8Array | null>;
  drcKey: React.MutableRefObject<CryptoKey | null>;
  handleExport: ExportResult;
  handleImport: (file: File, password: string) => Promise<ImportResult>;
  handleReset: () => Promise<void>;
  toogleDeriveKey: ToogleDeriveKey;
  isUnLocked: boolean;
  setIsUnLocked: React.Dispatch<React.SetStateAction<boolean>>;
  isResetting: boolean;
}

/** @deprecated Use `LocalContextValue` */
export type ContextType = LocalContextValue;

export interface ImportResultAlert {
  state: boolean;
  message?: ToastMessage;
  decryptedData?: PasswordEntry[];
  salt?: Uint8Array;
  drcKey?: CryptoKey | null;
}

export interface VaultData {
  state: boolean;
  salt?: Uint8Array;
  iv?: Uint8Array;
  data?: Uint8Array;
}

export interface ActionSubmitProps {
  onSuccess: (value: boolean) => void;
}

export interface HeaderGestorProps {
  setSearchTerm: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  selectedCategory: string;
  searchTerm: string;
}

export interface AddPasswordsProps {
  onSuccess?: () => void;
}

export type PassStorage = {
  salt: Uint8Array | null;
  derivedKey: CryptoKey | null;
  loading: boolean;
  dataPassword: PasswordEntry[];
  setDataPassword: () => void;
  setDataPasswordInit: (data: PasswordEntry[]) => void;
  setDataPasswordUpdate: (data: PasswordEntry) => void;
  setDataPasswordEdit: (data: PasswordEntry) => void;
  setDataPasswordFavorite: (id: string) => void;
  setDataPasswordDelate: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setDerivedKey: (key: CryptoKey) => void;
  setSalt: (salt: Uint8Array) => void;
};

export interface FormState {
  title: string;
  application: string;
  username: string;
  password: string;
  url: string;
  category: string;
  favorite: boolean;
}

export interface PasswordValidationResult {
  success: boolean;
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ThemeToggleProps {
  className?: string;
}

export type VaultCipherPayload = {
  iv: Uint8Array | number[];
  data: Uint8Array | number[];
};

export type EncryptResult = {
  iv: number[];
  data: number[];
};

export type DecryptSuccess = {
  status: true;
  data: PasswordEntry[];
};

export type DecryptFailure = {
  status: false;
  message: ToastMessage;
};

export type DecryptResult = DecryptSuccess | DecryptFailure;

export interface EncryptedData {
  iv: Uint8Array;
  data: Uint8Array;
}

export interface SaltGenerationResult {
  salt: Uint8Array;
  success: boolean;
}

export type CategoryType = "all" | "favorites" | "web" | "app" | "card";

export interface CategoryButton {
  id: CategoryType;
  label: string;
  icon: React.ReactNode;
}

export type PasswordVisibilityHandler = (id: string) => void;
export type CopyHandler = (text: string) => void;
export type EditHandler = (password: PasswordEntry) => void;
export type DeleteHandler = (id: string) => void;
export type FavoriteHandler = (id: string) => void;
export type CategoryHandler = (category: CategoryType) => void;
export type SearchHandler = (term: string) => void;

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

export interface LoadingState {
  isLoading: boolean;
  message?: string;
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
