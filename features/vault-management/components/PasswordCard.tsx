'use client';
import { sileo } from 'sileo';
import { Copy } from '@/features/vault-management/components/icons/Copy';
import { Eye } from '@/commons/components/icons/Eye';
import { EyeClose } from '@/commons/components/icons/EyeClose';
import { Edit } from '@/features/vault-management/components/icons/Edit';
import { Delete } from '@/features/vault-management/components/icons/Delete';
import { Star } from '@/features/vault-management/components/icons/Star';
import { StarFilled } from '@/features/vault-management/components/icons/StarFilled';
import { IconButton } from '@/features/vault-management/components/ui/IconButton';
import { isSafeHttpUrl } from '@/commons/lib/validation/validateUrl';
import type { PasswordCardProps } from '@/features/vault-management';

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
  const handleCopy = async (text: string, title: string) => {
    const copied = await onCopyToClipboard(text);
    if (copied) {
      sileo.success({ title, duration: 600 });
    } else {
      sileo.error({ title: 'No se pudo copiar al portapapeles' });
    }
  };

  const safeUrl = isSafeHttpUrl(password.url) ? password.url : null;

  return (
    <article className="vault-action-card vault-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <div className="vault-icon-frame w-8 h-8 flex-shrink-0">
          {getCategoryIcon(password.category)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-subheading leading-heading tracking-heading truncate">
            {password.title}
          </h3>
          {password.url &&
            (safeUrl ? (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-caption leading-ui text-vault-amber hover:underline truncate block"
              >
                {password.url}
              </a>
            ) : (
              <span className="text-caption leading-ui text-muted-foreground truncate block">
                {password.url}
              </span>
            ))}
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
            <span className="text-meta font-medium leading-ui text-muted-foreground uppercase tracking-meta shrink-0">
              User
            </span>
            <div className="relative flex-1 min-w-0">
              <span className="type-technical truncate bg-secondary px-2 py-1.5 rounded flex-1 pr-7 flex">
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
            <span className="text-meta font-medium leading-ui text-muted-foreground uppercase tracking-meta shrink-0">
              Pass
            </span>
            <div className="relative flex-1 min-w-0">
              <span className="type-technical truncate bg-secondary px-2 py-1.5 rounded flex-1 pr-14 flex">
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

          <div className="flex z-10 items-center gap-1 flex-shrink-0">
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
