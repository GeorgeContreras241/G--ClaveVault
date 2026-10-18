'use client';
import { sileo } from 'sileo';
import { Button } from '@/commons/components/ui/button';
import { useState } from 'react';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { generatePassword } from '@/commons/lib/password/generatePassword';
import { copyToClipboard } from '@/commons/lib/password/copyToClipboard';
import { ChevronButton } from '@/features/vault-management/components/ui/IconButton';
import { PasswordActions } from '@/features/vault-management/components/ui/PasswordActions';
import type {
  EditPasswordProps,
  FormErrors,
} from '@/features/vault-management';
import { toPasswordEntry } from '@/commons/lib/password/toPasswordEntry';
import { useMode } from '@/features/vault-management/hooks/useMode';
import { commitVaultOnline } from '@/commons/lib/vault/commitVault';

export const EditPassword = ({ password, onClose }: EditPasswordProps) => {
  const mode = useMode();
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const setDataPasswordEdit = useStoragePass(
    (state) => state.setDataPasswordEdit
  );
  const dataPassword = useStoragePass((state) => state.dataPassword);
  const derivedKey = useStoragePass((state) => state.derivedKey);
  const salt = useStoragePass((state) => state.salt);
  const setVersion = useStoragePass((state) => state.setVersion);

  const [keys, setKeys] = useState({
    id: password.id,
    title: password.title,
    application: password.category,
    username: password.username,
    password: password.password,
    url: password.url,
    category: password.category,
    favorite: password.favorite,
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
    if (!keys.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (keys.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }
    if (keys.url && keys.url.trim()) {
      try {
        new URL(keys.url);
      } catch {
        newErrors.url = 'URL inválida';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      duration: 1000,
    });
  };

  const handleCopyToClipboard = async () => {
    const copied = await copyToClipboard(keys.password);
    if (copied) {
      sileo.success({
        title: 'Contraseña copiada al portapapeles.',
        duration: 1000,
      });
    } else {
      sileo.error({
        title: 'No se pudo copiar al portapapeles',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    if (!validateForm()) {
      return;
    }

    const editedEntry = toPasswordEntry(keys);

    setIsSubmitting(true);
    try {
      if (mode === 'online' && derivedKey && salt) {
        const next = dataPassword.map((p) =>
          p.id === editedEntry.id ? editedEntry : p
        );
        const result = await commitVaultOnline({ derivedKey, salt, entries: next });
        if (!result.ok) {
          sileo.error({
            title: 'No se pudieron guardar los cambios',
            description: result.error,
            duration: 5000,
          });
          return;
        }
        setDataPasswordEdit(editedEntry);
        setVersion(result.version);
      } else {
        setDataPasswordEdit(editedEntry);
      }

      onClose();
      sileo.success({
        title: 'Cambios guardados correctamente.',
        duration: 1000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-3 py-1.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? 'border-destructive focus:ring-destructive/20'
        : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'
    }`;

  return (
    <section className="vault-panel rounded-xl p-4">
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <label
            htmlFor="edit-entry-title"
            className="font-sora text-sm font-semibold"
          >
            Editar Contraseña
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
                htmlFor="edit-entry-title"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Título <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="edit-entry-title"
                placeholder="Título"
                autoComplete="off"
                value={keys.title}
                onChange={(e) => {
                  setKeys({ ...keys, title: e.target.value });
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                className={inputClass(!!errors.title)}
              />
              {errors.title && (
                <p className="text-destructive text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-entry-application"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Aplicación
              </label>
              <select
                id="edit-entry-application"
                value={keys.application}
                onChange={(e) =>
                  setKeys({
                    ...keys,
                    application: e.target.value,
                    category: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-vault-amber/30 focus:border-vault-amber transition-all"
              >
                <option value="web">Web</option>
                <option value="app">App</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-entry-username"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Usuario <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="edit-entry-username"
                placeholder="Usuario"
                autoComplete="username"
                value={keys.username}
                onChange={(e) => {
                  setKeys({ ...keys, username: e.target.value });
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                className={inputClass(!!errors.username)}
              />
              {errors.username && (
                <p className="text-destructive text-xs mt-1">
                  {errors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-entry-url"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                URL
              </label>
              <input
                type="text"
                id="edit-entry-url"
                placeholder="https://ejemplo.com"
                autoComplete="url"
                value={keys.url}
                onChange={(e) => {
                  setKeys({ ...keys, url: e.target.value });
                  if (errors.url) {
                    setErrors({ ...errors, url: undefined });
                  }
                }}
                className={inputClass(!!errors.url)}
              />
              {errors.url && (
                <p className="text-destructive text-xs mt-1">{errors.url}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="edit-entry-password"
                className="text-xs font-medium text-muted-foreground mb-1 block"
              >
                Contraseña <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="edit-entry-password"
                  placeholder="Contraseña"
                  autoComplete="new-password"
                  value={keys.password}
                  onChange={(e) => {
                    setKeys({ ...keys, password: e.target.value });
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  className={`w-full px-3 py-1.5 text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 transition-all pr-20 ${errors.password ? 'border-destructive focus:ring-destructive/20' : 'border-border focus:ring-vault-amber/30 focus:border-vault-amber'}`}
                />
                <PasswordActions
                  showPassword={showPassword}
                  onGenerate={handleGeneratePassword}
                  onToggleVisibility={() => setShowPassword(!showPassword)}
                  onCopy={handleCopyToClipboard}
                />
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
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
                      htmlFor="edit-password-length"
                      className="text-xs text-muted-foreground w-16"
                    >
                      Longitud:
                    </label>
                    <input
                      type="number"
                      id="edit-password-length"
                      min="8"
                      max="64"
                      value={passwordOptions.length}
                      onChange={(e) =>
                        setPasswordOptions({
                          ...passwordOptions,
                          length: parseInt(e.target.value) || 16,
                        })
                      }
                      className="flex-1 px-2 py-1 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-vault-amber/30 transition-all"
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
                        className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer"
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
                className="flex-1 py-1.5 text-sm"
              >
                {isSubmitting ? 'Guardando…' : 'Guardar Cambios'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={onClose}
                className="flex-1 py-1.5 text-sm"
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
