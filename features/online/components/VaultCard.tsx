'use client';

import { KeyRound, Trash2 } from 'lucide-react';
import { Button } from '@/commons/components/ui/button';
import type { VaultCardProps } from '@/features/online';

/** Fecha ISO -> fecha local del usuario (dd/mm/aaaa). */
function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function VaultCard({ vault, onEnter, onDelete }: VaultCardProps) {
  return (
    <article className="vault-panel flex flex-col gap-4 rounded-xl p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="vault-icon-frame flex h-10 w-10 shrink-0 items-center justify-center">
            <KeyRound className="h-5 w-5 text-vault-amber" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-heading font-semibold leading-heading tracking-heading">
              {vault.name}
            </h2>
            <p className="text-caption leading-ui text-muted-foreground">
              Actualizada el {formatDate(vault.updatedAt)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(vault)}
          aria-label={`Eliminar la bóveda ${vault.name}`}
          title={`Eliminar ${vault.name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onEnter(vault)}
      >
        Entrar
      </Button>
    </article>
  );
}
