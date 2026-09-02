"use client"
import { Copy } from "@/components/icons/Copy"
import { Eye } from "@/components/icons/Eye"
import { EyeClose } from "@/components/icons/EyeClose"
import { Edit } from "@/components/icons/Edit"
import { Delete } from "@/components/icons/Delete"
import { Star } from "@/components/icons/Star"
import { StarFilled } from "@/components/icons/StarFilled"
import type { PasswordCardProps } from "@/types"

export const PasswordCard = ({ 
  password, 
  showPasswords, 
  onTogglePasswordVisibility, 
  onCopyToClipboard, 
  onEditPassword, 
  onDeletePassword, 
  onToggleFavorite,
  getCategoryIcon 
}: PasswordCardProps) => {
  return (
    <article className="vault-action-card vault-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <div className="vault-icon-frame w-8 h-8 flex-shrink-0">
          {getCategoryIcon(password.category)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-sora font-semibold text-sm truncate">{password.title}</h3>
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
        <button
          className="flex-shrink-0 p-1 rounded-md hover:bg-vault-amber/10 transition-colors"
          aria-label={password.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          onClick={() => onToggleFavorite(password.id)}
        >
          {password.favorite ? <StarFilled /> : <Star />}
        </button>
      </div>
      
      <div className="p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">User</label>
            <div className="relative flex-1 min-w-0">
              <span className="text-xs font-mono truncate bg-secondary px-2 py-1.5 rounded flex-1 pr-7 flex">{password.username}</span>
              <button
                onClick={() => onCopyToClipboard(password.username)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-vault-amber/10 transition-colors"
                aria-label="Copiar usuario"
              >
                <Copy />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">Pass</label>
            <div className="relative flex-1 min-w-0">
              <span className="text-xs font-mono truncate bg-secondary px-2 py-1.5 rounded flex-1 pr-14 flex">
                {showPasswords[password.id] ? password.password : '•••••••'}
              </span>
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-0.5">
                <button
                  onClick={() => onTogglePasswordVisibility(password.id)}
                  className="p-0.5 rounded hover:bg-vault-amber/10 transition-colors"
                  aria-label={showPasswords[password.id] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPasswords[password.id] ? <EyeClose /> : <Eye />}
                </button>
                <button
                  onClick={() => onCopyToClipboard(password.password)}
                  className="p-0.5 rounded hover:bg-vault-amber/10 transition-colors"
                  aria-label="Copiar contraseña"
                >
                  <Copy />
                </button>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              className="p-1 rounded hover:bg-vault-amber/10 transition-colors"
              aria-label="Editar contraseña"
              onClick={() => onEditPassword(password)}
            >
              <Edit />
            </button>
            <button
              className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
              aria-label="Eliminar contraseña"
              onClick={() => onDeletePassword(password.id)}
            >
              <Delete />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
