import type { ReactNode } from 'react';
import type { VaultSummary } from '@/types';

export { OnlineFlow } from './components/OnlineFlow';
export { PasswordsContent } from './layout/PasswordsContent';
export { VaultSelector } from './components/VaultSelector';
export { VaultCard } from './components/VaultCard';
export { CreateVaultForm } from './components/CreateVaultForm';
export { UnlockVaultForm } from './components/UnlockVaultForm';
export { DeleteVaultDialog } from './components/DeleteVaultDialog';

/** Selector de bóvedas: crear, entrar o eliminar. */
export interface VaultSelectorProps {
  onCreate: () => void;
  onEnter: (vault: VaultSummary) => void;
  onLogout: () => void;
}

/** Tarjeta resumen de una bóveda en el selector. */
export interface VaultCardProps {
  vault: VaultSummary;
  onEnter: (vault: VaultSummary) => void;
  onDelete: (vault: VaultSummary) => void;
}

/** Formulario de creación de una bóveda nueva. */
export interface CreateVaultFormProps {
  onBack: () => void;
  onCreated: (vault: VaultSummary) => void;
  onLogout: () => void;
}

/** Formulario de desbloqueo de una bóveda existente. */
export interface UnlockVaultFormProps {
  vault: VaultSummary;
  onBack: () => void;
  onUnlocked: () => void;
  onLogout: () => void;
}

/** Diálogo de confirmación de borrado por nombre. */
export interface DeleteVaultDialogProps {
  vault: VaultSummary;
  busy: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Tarjeta informativa con icono, título y descripción. */
export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

/** Contenedor con el estilo `vault-panel` de la bóveda. */
export interface VaultPanelProps {
  children: ReactNode;
  className?: string;
}

/** Lista de recomendaciones con viñetas. */
export interface TipListProps {
  items: ReactNode[];
}
