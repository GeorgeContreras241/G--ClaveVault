"use client"
import { Copy } from "@/components/icons/Copy"
import { Eye } from "@/components/icons/Eye"
import { EyeClose } from "@/components/icons/EyeClose"
import { Edit } from "@/components/icons/Edit"
import { Delete } from "@/components/icons/Delete"
import { Star } from "@/components/icons/Star"
import { StarFilled } from "@/components/icons/StarFilled"
import type { PasswordEntry, PasswordCardProps } from "@/types"

// Ajustar tamaño icons 

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'web':
      return <span className="w-4 h-4 text-blue-600">🌐</span>
    case 'app':
      return <span className="w-4 h-4 text-green-600">📱</span>
    case 'card':
      return <span className="w-4 h-4 text-purple-600">💳</span>
    default:
      return <span className="w-4 h-4 text-gray-600">🔒</span>
  }
}

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
    <article className="bg-white/95 dark:bg-blue-950/0 backdrop-blur-md border border-gray-300 dark:border-blue-950/20 rounded-lg overflow-hidden hover:border-blue-400 dark:hover:border-blue-900/40 transition-all duration-300 hover:scale-[1.003] shadow-sm hover:shadow-md">
      {/* Password Card Header */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-blue-900/30 bg-linear-to-r from-gray-50 to-white dark:from-blue-900/20 dark:to-blue-950/30">
        <div className="shrink-0 p-1 bg-linear-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded text-white text-xs">
          {getCategoryIcon(password.category)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{password.title}</h3>
          {password.url && (
            <a
              href={password.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors truncate block font-medium"
              aria-label={`Visitar ${password.url}`}
            >
              {password.url}
            </a>
          )}
        </div>
        <button
          className="shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-blue-900/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:scale-110"
          aria-label={password.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-pressed={password.favorite}
          onClick={() => onToggleFavorite(password.id)}
        >
          {password.favorite ? <StarFilled /> : <Star />}
        </button>
      </div>
      
      {/* Password Details */}
      <div className="p-2 bg-linear-to-b from-white to-gray-50 dark:from-blue-950/30 dark:to-blue-900/20">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0 w-12 uppercase tracking-wide">User:</label>
            <div className="relative flex-1 min-w-0">
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate bg-gray-100 dark:bg-gray-950 px-1.5 py-1.5 rounded flex-1 pr-8 flex">{password.username}</span>
              <button
                onClick={() => onCopyToClipboard(password.username)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 "
                aria-label="Copiar usuario"
              >
                <Copy />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0 w-12 uppercase tracking-wide">Pass:</label>
            <div className="relative flex-1 min-w-0">
              <span className="text-xs font-mono text-gray-900 dark:text-gray-100 truncate bg-gray-100 dark:bg-gray-800 px-1.5 py-1.5 rounded flex-1 pr-16 flex">
                {showPasswords[password.id] ? password.password : '•••••••'}
              </span>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button
                  onClick={() => onTogglePasswordVisibility(password.id)}
                  className="shrink-0 p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:scale-110"
                  aria-label={showPasswords[password.id] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPasswords[password.id]}
                >
                  {showPasswords[password.id] ? <EyeClose /> : <Eye />}
                </button>
                <button
                  onClick={() => onCopyToClipboard(password.password)}
                  className="shrink-0 p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:scale-110"
                  aria-label="Copiar contraseña"
                >
                  <Copy />
                </button>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Desktop Only */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              className='p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:scale-110'
              aria-label="Editar contraseña"
              onClick={() => onEditPassword(password)}
            >
              <Edit />
            </button>
            <button
              onClick={() => onDeletePassword(password.id)}
              className='p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 hover:scale-110'
              aria-label="Eliminar contraseña"
            >
              <Delete />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
