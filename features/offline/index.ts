import type { ReactNode } from 'react';

export { AuthGuard } from './components/AuthGuard';
export { OfflineShell } from './layout/OfflineShell';
export { OfflineUnlock } from './components/OfflineUnlock';

/** Desbloqueo offline: notifica al guardia cuando la bóveda se abre. */
export interface OfflineUnlockProps {
  onSuccess: (value: boolean) => void;
}

export interface AuthGuardProps {
  children: ReactNode;
}

export interface OfflineShellProps {
  children: ReactNode;
}
