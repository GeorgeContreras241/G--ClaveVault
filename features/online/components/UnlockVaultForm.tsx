'use client';

import { useState } from 'react';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '@/commons/components/ui/button';
import { Input } from '@/commons/components/ui/input';
import { Label } from '@/commons/components/ui/label';
import { StrengthMeter } from '@/commons/components/shared/StrengthMeter';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { validatePassword } from '@/commons/lib/validation/validatePassword';
import { base64ToBytes } from '@/commons/lib/encoding/base64';
import { deriveKey } from '@/commons/lib/crypto/kdfKey';
import { decrypt } from '@/commons/lib/crypto/decryptData';
import { getVault } from '@/commons/lib/vault/vaultsApi';
import { VaultPanel } from './VaultPanel';
import type { UnlockVaultFormProps } from '@/features/online';

export function UnlockVaultForm({
  vault,
  onBack,
  onUnlocked,
  onLogout,
}: UnlockVaultFormProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setSalt = useStoragePass((state) => state.setSalt);
  const setDerivedKey = useStoragePass((state) => state.setDerivedKey);
  const setDataPasswordInit = useStoragePass(
    (state) => state.setDataPasswordInit
  );
  const setVersion = useStoragePass((state) => state.setVersion);
  const setActiveVault = useStoragePass((state) => state.setActiveVault);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const validation = validatePassword(key);
    if (!validation.success) {
      setError(validation.error ?? 'Master key inválida.');
      return;
    }

    setLoading(true);
    try {
      const result = await getVault(vault.id);

      if (!result.ok) {
        if (result.status === 401) {
          onLogout();
          return;
        }
        setError(result.error);
        return;
      }

      const payload = result.vault;
      const salt = base64ToBytes(payload.salt);
      const derivedKey = await deriveKey(key, salt);
      const decrypted = await decrypt(derivedKey, {
        iv: base64ToBytes(payload.iv),
        data: base64ToBytes(payload.encryptedData),
      });

      if (!decrypted.status) {
        setError('Master key incorrecta. Inténtalo de nuevo.');
        return;
      }

      setSalt(salt);
      setDerivedKey(derivedKey);
      setDataPasswordInit(decrypted.data);
      setVersion(payload.version);
      setActiveVault({
        id: payload.id,
        name: payload.name,
        version: payload.version,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      });

      onUnlocked();
    } catch {
      setError('No se pudo desbloquear la bóveda. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex w-full flex-col gap-4 md:gap-6">
      <div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a mis bóvedas
        </Button>
      </div>

      <header className="vault-panel rounded-xl p-4 md:p-6">
        <div className="flex items-start gap-3">
          <div className="vault-icon-frame flex h-10 w-10 shrink-0 items-center justify-center">
            <KeyRound className="h-5 w-5 text-vault-amber" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-display-md md:text-display-lg font-semibold leading-heading md:leading-display tracking-heading md:tracking-display">
              {vault.name}
            </h1>
            <p className="mt-1 text-body leading-body text-muted-foreground">
              Introduce la master key de esta bóveda para descifrarla.
            </p>
          </div>
        </div>
      </header>

      <VaultPanel>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="vault-unlock-key">Master key</Label>
              {error && (
                <p
                  role="alert"
                  className="text-caption leading-ui text-destructive"
                >
                  {error}
                </p>
              )}
            </div>
            <Input
              id="vault-unlock-key"
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="Ingresa tu master key"
              autoComplete="current-password"
              aria-invalid={Boolean(error)}
            />
            {key.length > 0 && (
              <StrengthMeter validation={validatePassword(key)} />
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <ShieldCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-vault-amber"
              aria-hidden="true"
            />
            <p className="text-caption leading-body text-muted-foreground">
              La clave se deriva en tu dispositivo y nunca sale del navegador.
              El servidor solo entrega el contenido cifrado.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Descifrando…' : 'Desbloquear'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onBack}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </VaultPanel>
    </section>
  );
}
