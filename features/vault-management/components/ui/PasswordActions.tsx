'use client';
import { Copy } from '@/components/icons/Copy';
import { IconButton } from '@/features/vault-management/components/ui/Button';
import type { PasswordActionsProps } from '@/features/vault-management';

/**
 * Acciones del campo contraseña: generar, mostrar/ocultar y copiar.
 * Se posicionan sobre el input (requiere un contenedor `relative`).
 */
export const PasswordActions = ({
  showPassword,
  onGenerate,
  onToggleVisibility,
  onCopy,
}: PasswordActionsProps) => (
  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
    <IconButton label="Generar contraseña" onClick={onGenerate}>
      <svg
        className="w-3.5 h-3.5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </IconButton>

    <IconButton
      label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      onClick={onToggleVisibility}
    >
      <svg
        className="w-3.5 h-3.5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={
            showPassword
              ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
              : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
          }
        />
      </svg>
    </IconButton>

    <IconButton
      label="Copiar contraseña"
      className="text-white"
      onClick={onCopy}
    >
      <Copy />
    </IconButton>
  </div>
);
