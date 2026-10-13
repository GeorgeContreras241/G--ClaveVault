import type { Dispatch, ReactNode, SetStateAction } from 'react';

export { OnlineProvider } from './components/OnlineProvider';
export { MasterKeyForm } from './components/MasterKeyForm';
export { PasswordsContent } from './Layout/LayoutProvider';

/** Controla el desbloqueo de la bóveda online: formulario → Manager. */
export interface MasterKeyFormProps {
  setLook: Dispatch<SetStateAction<boolean>>;
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
