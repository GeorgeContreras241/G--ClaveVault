'use client';
import { sileo } from 'sileo';
import { Button } from '@/commons/components/ui/button';
import { useState } from 'react';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { generatePassword } from '@/commons/lib/password/generatePassword';
import { copyToClipboard } from '@/commons/lib/password/copyToClipboard';
import { ChevronButton } from '@/features/vault-management/components/ui/IconButton';
import { PasswordActions } from '@/features/vault-management/components/ui/PasswordActions';
import type { AddPasswordProps, FormErrors } from '@/features/vault-management';
import { toPasswordEntry } from '@/commons/lib/password/toPasswordEntry';
import { useMode } from '@/features/vault-management/hooks/useMode';
import { commitVaultOnline } from '@/commons/lib/vault/commitVault';
import { validateUrl } from '@/commons/lib/validation/validateUrl';
import { validatePassword } from '@/commons/lib/validation/validatePassword';

export const AddPassword = ({ onLock }: AddPasswordProps) => {
  const mode = useMode();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const dataPassword = useStoragePass((state) => state.dataPassword);
  const setDataPasswordUpdate = useStoragePass(
    (state) => state.setDataPasswordUpdate
  );
  const derivedKey = useStoragePass((state) => state.derivedKey);
  const salt = useStoragePass((state) => state.salt);
  const activeVaultId = useStoragePass((state) => state.activeVaultId);
  const version = useStoragePass((state) => state.version);
  const setVersion = useStoragePass((state) => state.setVersion);
  const [keys, setKeys] = useState({
    title: '',
    application: 'web',
    username: '',
    password: '',
    url: '',
    category: '',
    favorite: false,
  });

  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!keys.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (!keys.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }
    const passwordValidation = validatePassword(keys.password);
    if (!passwordValidation.success) {
      newErrors.password =
        passwordValidation.error ?? 'La contraseña no es válida';
    }
    const urlError = validateUrl(keys.url);
    if (urlError) {
      newErrors.url = urlError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setKeys({
      title: '',
      application: 'web',
      username: '',
      password: '',
      url: '',
      category: '',
      favorite: false,
    });
    setErrors({});
    setShowPassword(false);
    setPasswordOptions({
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
  };

  const handleGeneratePassword = () => {
    const generated = generatePassword(passwordOptions);
    if (!generated) {
      sileo.error({
        title: 'Selecciona al menos un tipo de carácter',
      });
      return;
    }
    setKeys({ ...keys, password: generated });
    setErrors({ ...errors, password: undefined });
    sileo.success({
      title: 'Se ha generado una nueva contraseña.',
      duration: 600,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    if (!validateForm()) {
      return;
    }

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Array.from(
            crypto.getRandomValues(new Uint8Array(8)),
            (b) => b.toString(16).padStart(2, '0')
          ).join('')}`;
    const newEntry = toPasswordEntry({ id, ...keys });

    setIsSubmitting(true);
    try {
      if (mode === 'online') {
        if (!derivedKey || !salt || !activeVaultId) {
          sileo.error({
            title: 'No se pudo guardar la contraseña',
            description: 'La bóveda no está desbloqueada. Vuelve a abrirla.',
            duration: 5000,
          });
          return;
        }

        const next = [...dataPassword, newEntry];
        const result = await commitVaultOnline({
          vaultId: activeVaultId,
          expectedVersion: version,
          derivedKey,
          salt,
          entries: next,
        });
        if (!result.ok) {
          sileo.error({
            title: result.conflict
              ? 'La bóveda cambió en otra sesión'
              : 'No se pudo guardar la contraseña',
            description: result.conflict
              ? 'Vuelve a abrir la bóveda para sincronizarla.'
              : result.error,
            duration: 5000,
          });
          if (result.conflict) {
            onLock?.();
          }
          return;
        }
        setDataPasswordUpdate(newEntry);
        setVersion(result.version);
      } else {
        setDataPasswordUpdate(newEntry);
      }

      resetForm();
      setIsFormVisible(false);
      sileo.success({
        title: 'Contraseña agregada correctamente.',
        duration: 600,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlecopyToClipboard = async () => {
    const copied = await copyToClipboard(keys.password);
    if (copied) {
      sileo.success({
        title: 'Contraseña copiada al portapapeles.',
        duration: 600,
      });
    } else {
      sileo.error({
        title: 'No se pudo copiar al portapapeles',
      });
    }
  };

  return (
    <section className="vault-panel rounded-xl p-4">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <label className="text-subheading font-semibold leading-heading tracking-heading">
            Agregar Contraseña
          </label>
          <ChevronButton
            open={isFormVisible}
            label={isFormVisible ? 'Ocultar formulario' : 'Mostrar formulario'}
            onClick={() => setIsFormVisible(!isFormVisible)}
          />
        </div>

        {isFormVisible && (
          <>
            <div>
              <label
                htmlFor="add-entry-title"
                className="text-label font-medium leading-ui text-muted-foreground mb-1 block"
              >
                Título <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="add-entry-title"
                placeholder="Título"
                autoComplete="off"
                value={keys.title}
                onChange={(e) => {
                  setKeys({ ...keys, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={
                  errors.title ? 'add-entry-title-error' : undefined
                }
                className={`w-full px-3 py-1.5 text-body bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.title ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
              />
              {errors.title && (
                <p
                  id="add-entry-title-error"
                  className="text-destructive text-caption leading-ui mt-1"
                >
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-entry-application"
                className="text-label font-medium leading-ui text-muted-foreground mb-1 block"
              >
                Aplicación
              </label>
              <select
                id="add-entry-application"
                value={keys.application}
                onChange={(e) =>
                  setKeys({
                    ...keys,
                    application: e.target.value,
                    category: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-body bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-amber/30 focus:border-vault-amber transition-all"
              >
                <option value="web">Web</option>
                <option value="app">App</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="add-entry-username"
                className="text-label font-medium leading-ui text-muted-foreground mb-1 block"
              >
                Usuario <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="add-entry-username"
                placeholder="Usuario"
                autoComplete="username"
                value={keys.username}
                onChange={(e) => {
                  setKeys({ ...keys, username: e.target.value });
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={
                  errors.username ? 'add-entry-username-error' : undefined
                }
                className={`w-full px-3 py-1.5 text-body bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.username ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
              />
              {errors.username && (
                <p
                  id="add-entry-username-error"
                  className="text-destructive text-caption leading-ui mt-1"
                >
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-entry-url"
                className="text-label font-medium leading-ui text-muted-foreground mb-1 block"
              >
                URL
              </label>
              <input
                type="text"
                id="add-entry-url"
                placeholder="https://ejemplo.com"
                autoComplete="url"
                value={keys.url}
                onChange={(e) => {
                  setKeys({ ...keys, url: e.target.value });
                  if (errors.url) {
                    setErrors({ ...errors, url: undefined });
                  }
                }}
                aria-invalid={Boolean(errors.url)}
                aria-describedby={
                  errors.url ? 'add-entry-url-error' : undefined
                }
                className={`w-full px-3 py-1.5 text-body bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.url ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
              />
              {errors.url && (
                <p
                  id="add-entry-url-error"
                  className="text-destructive text-caption leading-ui mt-1"
                >
                  {errors.url}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="add-entry-password"
                className="text-label font-medium leading-ui text-muted-foreground mb-1 block"
              >
                Contraseña <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="add-entry-password"
                  placeholder="Contraseña"
                  autoComplete="new-password"
                  value={keys.password}
                  onChange={(e) => {
                    setKeys({ ...keys, password: e.target.value });
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? 'add-entry-password-error' : undefined
                  }
                  className={`w-full px-3 py-1.5 text-body bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all pr-20 ${errors.password ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
                />
                <PasswordActions
                  showPassword={showPassword}
                  onGenerate={handleGeneratePassword}
                  onToggleVisibility={() => setShowPassword(!showPassword)}
                  onCopy={handlecopyToClipboard}
                />
              </div>
              {errors.password && (
                <p
                  id="add-entry-password-error"
                  className="text-destructive text-caption leading-ui mt-1"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-label font-medium leading-ui text-muted-foreground">
                  Configuración
                </label>
                <ChevronButton
                  open={isConfigVisible}
                  size="xs"
                  label={
                    isConfigVisible
                      ? 'Ocultar configuración'
                      : 'Mostrar configuración'
                  }
                  onClick={() => setIsConfigVisible(!isConfigVisible)}
                />
              </div>

              {isConfigVisible && (
                <>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="add-password-length"
                      className="text-caption leading-ui text-muted-foreground w-16"
                    >
                      Longitud:
                    </label>
                    <input
                      type="number"
                      id="add-password-length"
                      min="8"
                      max="64"
                      value={passwordOptions.length}
                      onChange={(e) =>
                        setPasswordOptions({
                          ...passwordOptions,
                          length: parseInt(e.target.value) || 16,
                        })
                      }
                      className="flex-1 px-2 py-1 text-caption bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-vault-amber/30 transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(
                      [
                        ['includeUppercase', 'Mayúsculas (A-Z)'],
                        ['includeLowercase', 'Minúsculas (a-z)'],
                        ['includeNumbers', 'Números (0-9)'],
                        ['includeSymbols', 'Símbolos (!@#$)'],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-1.5 text-caption leading-ui text-muted-foreground cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={passwordOptions[key]}
                          onChange={(e) =>
                            setPasswordOptions({
                              ...passwordOptions,
                              [key]: e.target.checked,
                            })
                          }
                          className="w-3 h-3 rounded border-border accent-vault-amber"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-1.5 text-body"
              >
                {isSubmitting ? 'Guardando…' : 'Agregar'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => {
                  resetForm();
                  setIsFormVisible(false);
                }}
                className="flex-1 py-1.5 text-body"
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </form>
    </section>
  );
};
