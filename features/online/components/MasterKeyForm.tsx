'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Shield,
  KeyRound,
  Lock,
  EyeOff,
  AlertTriangle,
  WifiOff,
} from 'lucide-react';
import { Input } from '@/commons/components/ui/input';
import { Button } from '@/commons/components/ui/button';
import { Label } from '@/commons/components/ui/label';
import { Loading } from '@/commons/components/shared/Loading';
import { StrengthMeter } from '@/commons/components/shared/StrengthMeter';
import { validatePassword } from '@/commons/lib/validation/validatePassword';
import { apiFetch } from '@/commons/lib/apiFetch';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { FeatureCard } from '@/features/online/components/FeatureCard';
import { TipList } from '@/features/online/components/TipList';
import { VaultPanel } from '@/features/online/components/VaultPanel';
// cryptography - Criptografia
import { decrypt } from '@/commons/lib/crypto/decryptData';
import { deriveKey } from '@/commons/lib/crypto/kdfKey';
import { generateSalt } from '@/commons/lib/crypto/generateSalt';
import type { MasterKeyFormProps } from '@/features/online';

/** Recomendaciones de seguridad para la master key. */
const SECURITY_TIPS: ReactNode[] = [
  'Usa entre 16 y 32 caracteres con letras, números y símbolos.',
  'Evita palabras comunes, fechas o información personal.',
  'No reutilices esta contraseña en ningún otro servicio.',
  <>
    Considera usar una passphrase de 4+ palabras aleatorias (ej:{' '}
    <span className="type-technical text-foreground/70">
      correct-horse-battery-staple
    </span>
    .
  </>,
  'Anótala en un lugar seguro offline si temes olvidarla.',
];

export function MasterKeyForm({ setLook }: MasterKeyFormProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  //storage - Almacenamiento
  const setDerivedKey = useStoragePass((state) => state.setDerivedKey);
  const setSalt = useStoragePass((state) => state.setSalt);
  const setDataPasswordInit = useStoragePass(
    (state) => state.setDataPasswordInit
  );
  const setVersion = useStoragePass((state) => state.setVersion);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get('password') as string;

    const validatePasswordResult = validatePassword(password);
    if (!validatePasswordResult.success) {
      setError(validatePasswordResult.error ?? 'Master Key inválida.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 0));
    try {
      // operacion de consultal a base de datos para si hay datos guardados previamente
      const response = await apiFetch('/api/auth/me');
      if (!response.ok) {
        throw new Error(
          'Error al acceder al vault. Por favor, inténtalo de nuevo.'
        );
      }
      const data = await response.json();
      // Si la respuesta es false y true no hay vault, mientras que si son dos hay un previamente creado
      if (!data.hasVault) {
        // Creación de vault nuevo: aquí sí se exige una clave fuerte.
        const strictValidation = validatePassword(password, { strict: true });
        if (!strictValidation.success) {
          setError(strictValidation.error ?? 'Master Key demasiado débil.');
          return;
        }
        const salt = await generateSalt();
        if (!salt) {
          throw new Error(
            'Error al generar la sal. Por favor, inténtalo de nuevo.'
          );
        }
        const derivedKey = await deriveKey(password, salt);
        if (!derivedKey) {
          throw new Error(
            'Error al derivar la clave. Por favor, inténtalo de nuevo.'
          );
        }
        setSalt(salt);
        setDerivedKey(derivedKey);
        setDataPasswordInit([]);
        setLook(true);
        return;
      }

      // Vault existente: descifrar
      const saltBytes = Uint8Array.from(atob(data.salt), (c) =>
        c.charCodeAt(0)
      );
      const derivedKey = await deriveKey(password, saltBytes);
      if (!derivedKey) {
        throw new Error(
          'Error al derivar la clave. Por favor, inténtalo de nuevo.'
        );
      }

      const iv = Uint8Array.from(atob(data.iv), (c) => c.charCodeAt(0));
      const encryptedData = Uint8Array.from(atob(data.encryptedData), (c) =>
        c.charCodeAt(0)
      );

      const result = await decrypt(derivedKey, { iv, data: encryptedData });
      if (!result.status || !result.data) {
        setError('Master key incorrecta. Inténtalo de nuevo.');
        return;
      }

      setSalt(saltBytes);
      setDerivedKey(derivedKey);
      setDataPasswordInit(result.data);
      setVersion(data.version);
      setLook(true);
    } catch {
      setError('Error al acceder al vault. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKey(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center py-20">
        <Loading size="lg" text="Accediendo al vault..." />
      </div>
    );
  }

  return (
    <section className="relative flex w-full flex-col items-center pb-4 md:pb-8">
      <div className="vault-rise w-full flex flex-col items-center text-center mb-6 md:mb-8">
        <div className="flex flex-row items-center justify-center gap-3 mb-4 md:mb-5">
          <div className="vault-rise vault-rise-delay-1 mb-4 md:mb-6 flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-vault-amber/10 border border-vault-amber/20">
            <KeyRound className="w-5 h-5 md:w-7 md:h-7 text-vault-amber" />
          </div>
          <h1 className="vault-rise vault-rise-delay-2 font-display text-display-md md:text-display-lg font-semibold leading-display tracking-display mb-3 md:mb-4">
            Crea tu Master Key
          </h1>
        </div>
        <p className="vault-rise vault-rise-delay-3 text-muted-foreground text-start text-body md:text-body-lg leading-body text-pretty">
          Necesitamos una clave maestra que nunca olvidarás. Con ella se cifran
          y descifran todas tus contraseñas. No se guarda en ningún lugar. Si la
          olvidas, tus datos quedan perdidos para siempre.
        </p>
      </div>

      <div className="vault-rise vault-rise-delay-3 w-full mb-8 md:mb-10">
        <VaultPanel>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Master Key</Label>
                {error && (
                  <p className="text-caption md:text-body text-destructive">
                    {error}
                  </p>
                )}
              </div>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu master key"
                value={key}
                onChange={handlePasswordChange}
                aria-invalid={!!error}
              />
              {key.length > 0 && (
                <StrengthMeter validation={validatePassword(key)} />
              )}
            </div>
            <Button type="submit" className="w-full">
              Acceder
            </Button>
          </form>
        </VaultPanel>
      </div>

      <div className="vault-rise vault-rise-delay-3 w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-10">
        <FeatureCard
          icon={<Lock className="w-5 h-5" />}
          title="Cifrado local"
          description="Tus contraseñas se cifran en tu dispositivo antes de sincronizarse. Nadie más puede leerlas."
        />
        <FeatureCard
          icon={<EyeOff className="w-5 h-5" />}
          title="Sin rastro digital"
          description="La master key nunca se envía al servidor. Solo existe en tu memoria y en tu máquina."
        />
        <FeatureCard
          icon={<Shield className="w-5 h-5" />}
          title="Resistente a ataques"
          description="Incluso si el servidor es comprometido, tus datos permanecen cifrados e inaccesibles."
        />
        <FeatureCard
          icon={<WifiOff className="w-5 h-5" />}
          title="Funciona sin conexión"
          description="Accede a tus contraseñas guardadas localmente aunque no tengas conexión a internet."
        />
      </div>

      <div className="vault-rise vault-rise-delay-4 w-full mb-8 md:mb-10">
        <VaultPanel>
          <div className="flex items-center gap-3 mb-4 md:mb-5">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-vault-amber" />
            <h2 className="font-display text-heading font-semibold leading-heading tracking-heading">
              Recomendaciones de seguridad
            </h2>
          </div>
          <TipList items={SECURITY_TIPS} />
        </VaultPanel>
      </div>
    </section>
  );
}
