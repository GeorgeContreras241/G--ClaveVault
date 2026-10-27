'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/commons/components/ui/button';
import { Input } from '@/commons/components/ui/input';
import { Label } from '@/commons/components/ui/label';
import type { DeleteVaultDialogProps } from '@/features/online';

export function DeleteVaultDialog({
  vault,
  busy,
  error,
  onCancel,
  onConfirm,
}: DeleteVaultDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const matches = confirmation.trim() === vault.name;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-vault-title"
        aria-describedby="delete-vault-description"
        className="vault-panel w-full max-w-md rounded-xl p-5 md:p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="vault-icon-frame flex h-10 w-10 shrink-0 items-center justify-center">
            <AlertTriangle
              className="h-5 w-5 text-destructive"
              aria-hidden="true"
            />
          </div>
          <div>
            <h2
              id="delete-vault-title"
              className="font-display text-heading font-semibold leading-heading tracking-heading"
            >
              Eliminar bóveda
            </h2>
            <p
              id="delete-vault-description"
              className="mt-1 text-body leading-body text-muted-foreground"
            >
              Se borrará «{vault.name}» y todo su contenido cifrado. Esta acción
              no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="delete-vault-confirmation">
            Escribe «{vault.name}» para confirmar
          </Label>
          <Input
            id="delete-vault-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-invalid={confirmation.length > 0 && !matches}
          />
          {error && (
            <p
              role="alert"
              className="text-caption leading-ui text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={!matches || busy}
          >
            {busy ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
