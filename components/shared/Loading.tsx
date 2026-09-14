"use client"

interface LoadingProps {
  /** Texto alternativo para screen readers */
  label?: string
  /** Tamaño del spinner: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg'
  /** Mostrar texto junto al spinner */
  text?: string
  /** Clases adicionales */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
}

export const Loading = ({
  label = 'Cargando...',
  size = 'md',
  text,
  className = '',
}: LoadingProps) => {
  return (
    <div
      className={`flex items-center justify-center gap-2 ${className}`}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <div
        className={`${sizeClasses[size]} rounded-full border-b-vault-amber border-transparent animate-spin`}
      />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  )
}

/** Loading fullscreen - para páginas completas */
export const LoadingFullPage = ({ label = 'Cargando...' }: { label?: string }) => {
  return (
    <div
      className="grid min-h-dvh place-items-center"
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <Loading size="lg" text={label} />
    </div>
  )
}
