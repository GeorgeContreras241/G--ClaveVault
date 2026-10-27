'use client';
import { useEffect } from 'react';
import Add from '@/features/offline/components/icons/Add';
import { sileoError } from '@/commons/constants/sileoConfig';
import { sileo } from 'sileo';
import { useState } from 'react';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { validateVaultInputs } from '@/features/offline/utils/validateVaultInputs';
import { Eye } from '@/commons/components/icons/Eye';
import { EyeClose } from '@/commons/components/icons/EyeClose';
import { validatePassword } from '@/commons/lib/validation/validatePassword';
import { StrengthMeter } from '@/commons/components/shared/StrengthMeter';
import type { OfflineUnlockProps } from '@/features/offline';
import { generateSalt } from '@/commons/lib/crypto/generateSalt';
import { deriveKey } from '@/commons/lib/crypto/kdfKey';
import { Arrow } from '@/commons/components/icons/Arrow';
import Link from 'next/link';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const OfflineUnlock = ({ onSuccess }: OfflineUnlockProps) => {
  const handleImport = useStoragePass((state) => state.handleImport);
  const handleReset = useStoragePass((state) => state.handleReset);
  const setDerivedKey = useStoragePass((state) => state.setDerivedKey);
  const setSalt = useStoragePass((state) => state.setSalt);
  const setDataPasswordInit = useStoragePass(
    (state) => state.setDataPasswordInit
  );

  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [viewPass, setViewPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    // Limpia la sesión en memoria al entrar; el modo offline es volátil por
    // diseño (no hay persistencia local del vault más allá de la salt).
    void handleReset().catch(() => {
      // Un fallo de storage no debe romper la UI del desbloqueo.
    });
  }, [handleReset]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // El error se limpia mientras se escribe; se valida de nuevo al enviar.
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setFileError('');
  };

  const handleNoFileScenario = async (pass: string) => {
    // Sin archivo se crea un vault nuevo: ahí sí se exige una clave fuerte.
    const validation = validatePassword(pass, { strict: true });
    if (!validation.success) {
      const message = validation.error ?? 'La contraseña es demasiado débil';
      setPasswordError(message);
      sileo.error({ title: message });
      return;
    }
    sileo.warning({
      title: 'Confirmar',
      description: '¿Continuar sin archivo? Se creará una bóveda vacía.',
      duration: 8000,
      fill: 'var(--color-bg-elevated)',
      styles: {
        title: 'text-red! font-semibold!',
        description: 'text-white! text-center!',
      },
      button: {
        onClick: async () => {
          setIsLoading(true);
          try {
            const saltGenerated = await generateSalt();
            localStorage.setItem(
              'salt',
              JSON.stringify(Array.from(saltGenerated))
            );
            const drcKeyResult = await deriveKey(pass, saltGenerated);
            setSalt(saltGenerated);
            setDerivedKey(drcKeyResult);
            setDataPasswordInit([]);
            onSuccess(true);
            sileo.clear();
          } catch {
            sileo.error({ title: 'Error al crear la bóveda local' });
          } finally {
            setIsLoading(false);
          }
        },
        title: 'Aceptar',
      },
    });
  };

  const processFileImport = async (selectedFile: File, pass: string) => {
    const validation = validateVaultInputs(pass);
    if (validation !== true) {
      sileo.error(validation);
      return false;
    }

    const importResult = await handleImport(selectedFile, pass);

    if (importResult.state === false) {
      if (importResult.message) {
        sileo.error(importResult.message);
      } else {
        sileo.error(sileoError);
      }
      return false;
    }

    if (importResult.decryptedData) {
      setDataPasswordInit(importResult.decryptedData);
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const pass = formData.get('password') as string;

    const validatePasswordResult = validatePassword(pass);
    if (!validatePasswordResult.success) {
      setPasswordError(validatePasswordResult.error || '');
      sileo.error(sileoError);
      return;
    }

    try {
      if (!file) {
        await handleNoFileScenario(pass);
        return;
      }
      setIsLoading(true);
      const success = await processFileImport(file, pass);
      if (success) {
        onSuccess(true);
      }
    } catch {
      sileo.error({ title: 'Error al descifrar el archivo' });
    } finally {
      setIsLoading(false);
    }
  };

  /** Valida y aplica un archivo; devuelve `false` si no es aceptable. */
  const applyFile = (selectedFile: File | null): boolean => {
    if (!selectedFile) {
      setFileError('');
      setFile(null);
      return true;
    }

    if (!selectedFile.name.endsWith('.enc')) {
      setFileError('Solo se permiten archivos .enc');
      setFile(null);
      return false;
    }

    if (selectedFile.size > MAX_FILE_BYTES) {
      setFileError('El archivo es demasiado grande (máximo 10MB)');
      setFile(null);
      return false;
    }

    setFileError('');
    setFile(selectedFile);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!applyFile(e.target.files?.[0] ?? null)) {
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    applyFile(e.dataTransfer.files?.[0] ?? null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center gap-8 py-12 px-3 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all duration-300"
        aria-label="Volver al inicio"
        title="Volver al inicio"
      >
        <span className="block h-4 w-4 rotate-180" aria-hidden="true">
          <Arrow />
        </span>
      </Link>
      <div className="offline w-full grid place-items-center rounded-3xl p-6 md:p-8">
        <div className="w-full grid place-items-center gap-2">
          <div className="w-full flex gap-3 ">
            <input
              className="hidden"
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".enc"
              aria-describedby="file-status"
            />
            <div
              className="flex-1 h-48 border-2 border-dashed border-zinc-300 dark:border-zinc-500/30 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <label
                htmlFor="file"
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer border rounded-lg border-zinc-300 dark:border-zinc-500/30"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Add />
                </div>
                <span className="text-body leading-ui text-zinc-800 dark:text-zinc-200 font-medium">
                  Arrastra o haz clic para subir
                </span>
                <span className="text-caption leading-ui text-zinc-600 dark:text-zinc-400 mt-1">
                  Solo archivos .enc
                </span>
              </label>
            </div>
            {file && (
              <button
                type="button"
                onClick={handleClearFile}
                className="grid place-content-center w-12 h-12 rounded-xl border border-zinc-300 dark:border-zinc-500/30 bg-zinc-100 dark:bg-zinc-800 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-300 group"
                title="Eliminar archivo"
              >
                <svg
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:scale-110 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
          <span
            id="file-status"
            role="status"
            aria-live="polite"
            className={`${
              file
                ? 'text-green-700 dark:text-green-400 border-green-300 dark:border-green-400/50 bg-green-100 dark:bg-green-400/10'
                : 'text-red-700 dark:text-red-400 border-red-300 dark:border-red-400/50 bg-red-100 dark:bg-red-400/10'
            }
                    text-body leading-ui border rounded px-2 py-1 w-full text-center transition-colors duration-300`}
          >
            {fileError
              ? fileError
              : file
                ? 'Archivo Cargado Correctamente'
                : 'Seleccione un archivo'}
          </span>
        </div>
        <form
          className="w-full flex flex-col gap-3 mt-4 text-body leading-ui"
          onSubmit={handleSubmit}
        >
          <div className="flex justify-between">
            <label
              htmlFor="password"
              className="font-display text-display-md md:text-display-lg text-start font-semibold leading-display tracking-display text-zinc-900 dark:text-zinc-50"
            >
              Clave Maestra
            </label>
            {passwordError && (
              <span
                id="password-error"
                className="text-red-600 dark:text-red-400 text-caption mt-1"
                role="alert"
              >
                {passwordError}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={viewPass ? 'text' : 'password'}
              className={`w-full border rounded-lg px-4 py-2 type-technical pr-10 border-zinc-300 dark:border-zinc-500/30 bg-white dark:bg-zinc-800/50 backdrop-blur-sm placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-vault-amber/30 focus:border-vault-amber transition-all duration-300 ${
                passwordError ? 'border-red-500 focus:ring-red-500/50' : ''
              }`}
              placeholder="Ingresa Aqui"
              id="password"
              name="password"
              value={password}
              autoComplete="off"
              spellCheck="false"
              autoCorrect="off"
              onChange={handlePasswordChange}
              aria-invalid={passwordError ? 'true' : 'false'}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setViewPass(!viewPass)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-vault-amber dark:hover:text-vault-amber transition-all duration-300"
              aria-label={
                viewPass ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
            >
              {viewPass ? <Eye /> : <EyeClose />}
            </button>
          </div>
          {password.length > 0 && (
            <StrengthMeter validation={validatePassword(password)} />
          )}
          <span id="loading-status" className="sr-only" role="status">
            {isLoading ? 'Procesando…' : ''}
          </span>
          <button
            className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg p-3 cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-vault-amber/30 shadow-lg text-button font-medium tracking-label"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            aria-describedby="loading-status"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Descifrando...</span>
              </>
            ) : file ? (
              <span>Decifrar</span>
            ) : (
              <span>Iniciar</span>
            )}
          </button>
          {isLoading && (
            <span id="loading-status" className="sr-only">
              Procesando archivo, por favor espere
            </span>
          )}
        </form>
      </div>
    </div>
  );
};
