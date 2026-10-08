'use client';
import { sileo } from 'sileo';
import { Copy } from '@/components/icons/Copy';
import { Eye } from '@/components/icons/Eye';
import { EyeClose } from '@/components/icons/EyeClose';
import { Edit } from '@/components/icons/Edit';
import { Delete } from '@/components/icons/Delete';
import { Star } from '@/components/icons/Star';
import { StarFilled } from '@/components/icons/StarFilled';
import { IconButton } from '@/features/manager/components/ui/Button';
import type { PasswordCardProps } from '@/types';

export const PasswordCard = ({
  password,
  showPasswords,
  onTogglePasswordVisibility,
  onCopyToClipboard,
  onEditPassword,
  onDeletePassword,
  onToggleFavorite,
  getCategoryIcon,
}: PasswordCardProps) => {
  const handleCopy = (text: string, title: string) => {
    onCopyToClipboard(text);
    sileo.success({ title, duration: 600 });
  };

  return (
    <article className="vault-action-card vault-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <div className="vault-icon-frame w-8 h-8 flex-shrink-0">
          {getCategoryIcon(password.category)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-sora font-semibold text-sm truncate">
            {password.title}
          </h3>
          {password.url && (
            <a
              href={password.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-vault-amber hover:underline truncate block"
            >
              {password.url}
            </a>
          )}
        </div>
        <IconButton
          label={
            password.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'
          }
          className="flex-shrink-0 z-10 rounded-md"
          onClick={() => onToggleFavorite(password.id)}
        >
          {password.favorite ? <StarFilled /> : <Star />}
        </IconButton>
      </div>

      <div className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              User
            </label>
            <div className="relative flex-1 min-w-0">
              <span className="text-xs font-mono truncate bg-secondary px-2 py-1.5 rounded flex-1 pr-7 flex">
                {password.username}
              </span>
              <IconButton
                size="xs"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
                label="Copiar usuario"
                onClick={() =>
                  handleCopy(
                    password.username,
                    'Usuario copiado al portapapeles.'
                  )
                }
              >
                <Copy />
              </IconButton>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              Pass
            </label>
            <div className="relative flex-1 min-w-0">
              <span className="text-xs font-mono truncate bg-secondary px-2 py-1.5 rounded flex-1 pr-14 flex">
                {showPasswords[password.id] ? password.password : '•••••••'}
              </span>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-0.5">
                <IconButton
                  size="xs"
                  label={
                    showPasswords[password.id]
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  onClick={() => onTogglePasswordVisibility(password.id)}
                >
                  {showPasswords[password.id] ? <EyeClose /> : <Eye />}
                </IconButton>
                <IconButton
                  size="xs"
                  label="Copiar contraseña"
                  onClick={() =>
                    handleCopy(
                      password.password,
                      'Contraseña copiada al portapapeles.'
                    )
                  }
                >
                  <Copy />
                </IconButton>
              </div>
            </div>
          </div>

          <div className="hidden z-10 sm:flex items-center gap-1">
            <IconButton
              label="Editar contraseña"
              onClick={() => onEditPassword(password)}
            >
              <Edit />
            </IconButton>
            <IconButton
              variant="destructive"
              label="Eliminar contraseña"
              onClick={() => onDeletePassword(password.id)}
            >
              <Delete />
            </IconButton>
          </div>
        </div>
      </div>
    </article>
  );
};
