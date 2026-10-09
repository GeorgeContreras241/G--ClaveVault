import type { ReactNode } from 'react';

export type {
  IconButtonProps,
  ChevronButtonProps,
} from './components/ui/Button';

/** Entrada de una contraseña dentro de la bóveda. */
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  favorite: boolean;
  url: string;
  category: string;
}

/** Estado de visibilidad de las contraseñas: id -> visible. */
export type ShowPasswords = {
  [id: string]: boolean;
};

export interface PasswordActionsProps {
  showPassword: boolean;
  onGenerate: () => void;
  onToggleVisibility: () => void;
  onCopy: () => void;
}

export interface EditPasswordProps {
  password: PasswordEntry;
  onClose: () => void;
}

export interface PasswordCardProps {
  password: PasswordEntry;
  showPasswords: ShowPasswords;
  onTogglePasswordVisibility: (id: string) => void;
  onCopyToClipboard: (text: string) => void;
  onEditPassword: (password: PasswordEntry) => void;
  onDeletePassword: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  getCategoryIcon: (category: string) => ReactNode;
}

export interface HeaderManagerProps {
  setSearchTerm: (value: string) => void;
  setSelectedCategory: (value: string) => void;
  selectedCategory: string;
  searchTerm: string;
}

export interface FormErrors {
  title?: string;
  username?: string;
  password?: string;
  url?: string;
}
