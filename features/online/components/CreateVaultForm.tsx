'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowLeft, KeyRound } from 'lucide-react';
import { sileo } from 'sileo';
import { Button } from '@/commons/components/ui/button';
import { Input } from '@/commons/components/ui/input';
import { Label } from '@/commons/components/ui/label';
import { StrengthMeter } from '@/commons/components/shared/StrengthMeter';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { validatePassword } from '@/commons/lib/validation/validatePassword';
import { generateSalt } from '@/commons/lib/crypto/generateSalt';
import { deriveKey } from '@/commons/lib/crypto/kdfKey';
import { encrypt } from '@/commons/lib/crypto/encryptData';
import { createVault } from '@/commons/lib/vault/vaultsApi';
import { VaultPanel } from './VaultPanel';
import type { CreateVaultFormProps } from '@/features/online';

const MAX_NAME_LENGTH = 80;

export function CreateVaultForm({
  onBack,
  onCreated,
  onLogout,
}: CreateVaultFormProps) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [confirmation, setConfirmation] = useState('');
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

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('El nombre de la bóveda es requerido.');
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setError(`El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.`);
      return;
    }

    const validation = validatePassword(key, { strict: true });
    if (!validation.success) {
      setError(validation.error ?? 'La master key es demasiado débil.');
      return;
    }

    if (key !== confirmation) {
      setError('Las dos master keys no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const salt = await generateSalt();
      const derivedKey = await deriveKey(key, salt);
      const encrypted = await encrypt(derivedKey, []);

      const result = await createVault({
        name: trimmedName,
        salt,
        iv: new Uint8Array(encrypted.iv),
        encryptedData: new Uint8Array(encrypted.data),
      });

      if (!result.ok) {
        if (result.status === 401) {
          onLogout();
          return;
        }
        setError(result.error);
        return;
      }

      setSalt(salt);
      setDerivedKey(derivedKey);
      setDataPasswordInit([]);
      setVersion(result.vault.version);
      setActiveVault(result.vault);

      sileo.success({
        title: 'Bóveda creada.',
        description: 'Ya puedes empezar a guardar contraseñas.',
        duration: 1500,
      });

      onCreated(result.vault);
    } catch {
      setError('No se pudo crear la bóveda. Inténtalo de nuevo.');
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
          <div>
            <h1 className="font-display text-display-md md:text-display-lg font-semibold leading-heading md:leading-display tracking-heading md:tracking-display">
              Nueva bóveda
            </h1>
            <p className="mt-1 text-body leading-body text-muted-foreground">
              Cada bóveda tiene su propia master key. Si la olvidas, sus datos
              quedan perdidos para siempre.
            </p>
          </div>
        </div>
      </header>

      <VaultPanel>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vault-name">Nombre de la bóveda</Label>
            <Input
              id="vault-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Personal, Trabajo, Familia…"
              autoComplete="off"
              maxLength={MAX_NAME_LENGTH}
              aria-invalid={Boolean(error) && !name.trim()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vault-key">Master key</Label>
            <Input
              id="vault-key"
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder="Ingresa una master key fuerte"
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
            />
            {key.length > 0 && (
              <StrengthMeter
                validation={validatePassword(key, { strict: true })}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vault-key-confirmation">Repite la master key</Label>
            <Input
              id="vault-key-confirmation"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Repite la master key"
              autoComplete="new-password"
              aria-invalid={confirmation.length > 0 && confirmation !== key}
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-vault-amber/20 bg-vault-amber/5 p-3">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-vault-amber"
              aria-hidden="true"
            />
            <p className="text-caption leading-body text-muted-foreground">
              La master key no se envía al servidor ni se guarda en ningún
              sitio. Anótala en un lugar seguro antes de continuar.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="text-caption leading-ui text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creando…' : 'Crear bóveda'}
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
