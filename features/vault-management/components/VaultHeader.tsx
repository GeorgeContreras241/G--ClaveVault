'use client';
import { useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { Export } from '@/features/vault-management/components/icons/Export';
import { Search } from '@/features/vault-management/components/icons/Search';
import { Button } from '@/commons/components/ui/button';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { ThemeToggle } from '@/commons/components/shared/ThemeToggle';
import { CATEGORY_BUTTONS } from '@/commons/constants/categoryButtons';
import { VaultHeaderProps } from '@/features/vault-management';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/commons/lib/apiFetch';
import { useMode } from '@/features/vault-management/hooks/useMode';

export const VaultHeader = ({
  setSearchTerm,
  setSelectedCategory,
  selectedCategory,
  searchTerm,
  onLock,
}: VaultHeaderProps) => {
  const router = useRouter();
  const mode = useMode();
  const handleExport = useStoragePass((state) => state.handleExport);
  const handleReset = useStoragePass((state) => state.handleReset);
  const resetSession = useStoragePass((state) => state.resetSession);
  const dataPassword = useStoragePass((state) => state.dataPassword);
  const activeVaultName = useStoragePass((state) => state.activeVaultName);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      if (mode === 'online') {
        try {
          // Sin esto la cookie seguiría viva hasta 30 minutos.
          await apiFetch('/api/auth/login/logout', { method: 'POST' });
        } catch {
          // La sesión local se limpia igualmente.
        }
        await resetSession();
        router.push('/online');
      } else {
        await handleReset();
        router.push('/offline');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="vault-panel rounded-xl p-4 md:p-6">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="font-display text-display-md md:text-display-lg font-semibold leading-heading md:leading-display tracking-heading md:tracking-display">
          {activeVaultName ?? 'Clave vault'}
        </h1>
        <article className="flex flex-wrap items-center justify-end gap-2">
          <ThemeToggle className="h-5 w-5" />
          {mode === 'online' && onLock && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLock}
              aria-label="Cambiar bóveda"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cambiar bóveda</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleExport(dataPassword)}
            aria-label="Exportar bóveda"
          >
            <span aria-hidden="true">
              <Export />
            </span>
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            aria-label={mode === 'online' ? 'Cerrar sesión' : 'Salir'}
          >
            {isLoggingOut ? (
              <div
                className="h-4 w-4 border-b-2 rounded-full border-current animate-spin"
                aria-hidden="true"
              />
            ) : (
              <>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {mode === 'online' ? 'Cerrar sesión' : 'Salir'}
                </span>
              </>
            )}
          </Button>
        </article>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar contraseñas..."
          aria-label="Buscar contraseñas"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 text-body leading-ui bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-amber/30 focus:border-vault-amber transition-all"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORY_BUTTONS.map((button) => (
          <Button
            key={button.id}
            variant={selectedCategory === button.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(button.value)}
            className={
              selectedCategory === button.value
                ? 'bg-vault-amber text-black hover:bg-vault-amber/80'
                : ''
            }
          >
            {button.label}
          </Button>
        ))}
      </div>
    </header>
  );
};
