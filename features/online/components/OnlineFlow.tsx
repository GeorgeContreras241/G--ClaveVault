'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/commons/lib/apiFetch';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { Manager } from '@/features/vault-management/Manager';
import { useAutoLock } from '@/features/vault-management/hooks/useAutoLock';
import { CreateVaultForm } from './CreateVaultForm';
import { UnlockVaultForm } from './UnlockVaultForm';
import { VaultSelector } from './VaultSelector';
import type { VaultSummary } from '@/types';

type View = 'select' | 'create' | 'unlock' | 'manager';

/**
 * Flujo online: selector de bóvedas → desbloqueo → gestor.
 *
 * La lista de bóvedas se consulta nada más montar el selector, que es lo
 * primero que ve el usuario después del login WebAuthn.
 */
export const OnlineFlow = () => {
  const router = useRouter();
  const [view, setView] = useState<View>('select');
  const [selectedVault, setSelectedVault] = useState<VaultSummary | null>(null);

  const activeVaultId = useStoragePass((state) => state.activeVaultId);
  const handleReset = useStoragePass((state) => state.handleReset);
  const resetSession = useStoragePass((state) => state.resetSession);
  const isUnlocked = view === 'manager' && Boolean(activeVaultId);

  const lock = useCallback(() => {
    void handleReset();
    setSelectedVault(null);
    setView('select');
  }, [handleReset]);

  useAutoLock(lock, isUnlocked);

  const handleLogout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/login/logout', { method: 'POST' });
    } catch {
      // Aunque falle la red, la sesión local se limpia igualmente.
    }
    await resetSession();
    router.push('/online');
  }, [resetSession, router]);

  if (isUnlocked) {
    return <Manager onLock={lock} />;
  }

  if (view === 'create') {
    return (
      <CreateVaultForm
        onBack={() => setView('select')}
        onCreated={(vault) => {
          setSelectedVault(vault);
          setView('manager');
        }}
        onLogout={handleLogout}
      />
    );
  }

  if (view === 'unlock' && selectedVault) {
    return (
      <UnlockVaultForm
        vault={selectedVault}
        onBack={() => {
          setSelectedVault(null);
          setView('select');
        }}
        onUnlocked={() => setView('manager')}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <VaultSelector
      onCreate={() => setView('create')}
      onEnter={(vault) => {
        setSelectedVault(vault);
        setView('unlock');
      }}
      onLogout={handleLogout}
    />
  );
};
