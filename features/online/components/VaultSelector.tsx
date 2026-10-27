'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, LogOut, Plus } from 'lucide-react';
import { sileo } from 'sileo';
import { Button } from '@/commons/components/ui/button';
import { Loading } from '@/commons/components/shared/Loading';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { deleteVault, listVaults } from '@/commons/lib/vault/vaultsApi';
import { MAX_VAULTS_PER_USER } from '@/commons/constants/vault';
import { VaultCard } from './VaultCard';
import { DeleteVaultDialog } from './DeleteVaultDialog';
import type { VaultSelectorProps } from '@/features/online';
import type { VaultSummary } from '@/types';

export function VaultSelector({
  onCreate,
  onEnter,
  onLogout,
}: VaultSelectorProps) {
  const vaults = useStoragePass((state) => state.vaults);
  const setVaults = useStoragePass((state) => state.setVaults);
  const activeVaultId = useStoragePass((state) => state.activeVaultId);
  const handleReset = useStoragePass((state) => state.handleReset);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<VaultSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const maxReached = vaults.length >= MAX_VAULTS_PER_USER;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      const result = await listVaults();

      if (cancelled) {
        return;
      }

      if (result.ok) {
        setVaults(result.vaults);
      } else if (result.status === 401) {
        onLogout();
        return;
      } else {
        setError(result.error);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [onLogout, setVaults, reloadKey]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    const result = await deleteVault(deleteTarget.id);

    if (result.ok || result.status === 404) {
      setVaults(vaults.filter((vault) => vault.id !== deleteTarget.id));
      if (activeVaultId === deleteTarget.id) {
        await handleReset();
      }
      sileo.success({
        title: 'Bóveda eliminada.',
        description: `«${deleteTarget.name}» se borró correctamente.`,
        duration: 2000,
      });
      setDeleteTarget(null);
    } else if (result.status === 401) {
      onLogout();
    } else {
      setDeleteError(result.error);
    }

    setIsDeleting(false);
  }, [
    activeVaultId,
    deleteTarget,
    handleReset,
    isDeleting,
    onLogout,
    setVaults,
    vaults,
  ]);

  return (
    <section className="flex w-full flex-col gap-4 md:gap-6">
      <header className="vault-panel rounded-xl p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-display-md md:text-display-lg font-semibold leading-heading md:leading-display tracking-heading md:tracking-display">
              Tus bóvedas
            </h1>
            <p className="mt-1 text-body leading-body text-muted-foreground">
              Elige una bóveda para desbloquearla o crea una nueva.
            </p>
            {maxReached && (
              <p className="mt-2 text-caption leading-ui text-vault-amber">
                Has alcanzado el límite de {MAX_VAULTS_PER_USER} bóvedas.
                Elimina una para crear otra.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={onCreate}
              disabled={maxReached}
              title={
                maxReached
                  ? `Límite de ${MAX_VAULTS_PER_USER} bóvedas alcanzado`
                  : undefined
              }
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nueva bóveda
            </Button>
            <Button type="button" variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="vault-panel rounded-xl p-10">
          <Loading size="lg" text="Cargando bóvedas..." />
        </div>
      ) : error ? (
        <div className="vault-panel rounded-xl p-8 text-center">
          <p role="alert" className="text-body leading-body text-destructive">
            {error}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Reintentar
          </Button>
        </div>
      ) : vaults.length === 0 ? (
        <div className="vault-panel flex flex-col items-center justify-center rounded-xl p-10 text-center">
          <div className="vault-icon-frame mb-4 flex h-12 w-12 items-center justify-center">
            <KeyRound className="h-6 w-6 text-vault-amber" aria-hidden="true" />
          </div>
          <h2 className="mb-2 font-display text-heading font-semibold leading-heading tracking-heading">
            Aún no tienes bóvedas
          </h2>
          <p className="mb-5 max-w-sm text-body leading-body text-muted-foreground">
            Crea tu primera bóveda con una master key que nunca olvides. El
            servidor solo guardará el contenido cifrado.
          </p>
          <Button type="button" onClick={onCreate}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Crear mi primera bóveda
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 md:gap-4">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onEnter={onEnter}
              onDelete={(target) => {
                setDeleteError('');
                setDeleteTarget(target);
              }}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteVaultDialog
          vault={deleteTarget}
          busy={isDeleting}
          error={deleteError}
          onCancel={() => {
            if (!isDeleting) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </section>
  );
}
