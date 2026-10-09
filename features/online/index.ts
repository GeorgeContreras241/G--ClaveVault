import type { Dispatch, SetStateAction } from 'react';

export { OnlineProvider } from './components/OnlineProvider';
export { MasterKeyForm } from './components/MasterKeyForm';
export { PasswordsContent } from './PasswordsContent';

/** Controla el desbloqueo de la bóveda online: formulario → Manager. */
export interface MasterKeyFormProps {
  setLook: Dispatch<SetStateAction<boolean>>;
}
