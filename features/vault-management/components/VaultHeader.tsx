'use client';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
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
}: VaultHeaderProps) => {
  const router = useRouter();
  const mode = useMode();
  const handleExport = useStoragePass((state) => state.handleExport);
  const handleReset = useStoragePass((state) => state.handleReset);
  const dataPassword = useStoragePass((state) => state.dataPassword);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <header className="vault-panel rounded-xl p-4 md:p-6">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1 className="font-sora text-xl md:text-4xl font-bold tracking-tight">
          Clave vault
        </h1>
        <article className="flex items-center gap-2">
          <ThemeToggle className="h-5 w-5" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport(dataPassword)}
          >
            <Export />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoggingOut}
            onClick={async () => {
              if (isLoggingOut) {
                return;
              }
              setIsLoggingOut(true);
              try {
                // En modo online además hay que invalidar la sesión en el
                // servidor: sin esto la cookie seguía viva 30 minutos.
                if (mode === 'online') {
                  try {
                    await apiFetch('/api/auth/login/logout', {
                      method: 'POST',
                    });
                  } catch {
                    // El almacenamiento local se limpia igualmente y el
                    // servidor caduca la sesión por inactividad.
                  }
                }
                await handleReset();
                router.push('/offline');
              } finally {
                setIsLoggingOut(false);
              }
            }}
          >
            {isLoggingOut ? (
              <div className="h-4 w-4 border-b-2 rounded-full border-current animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-amber/30 focus:border-vault-amber transition-all"
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
