'use client';
import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const iconButtonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded transition-colors outline-none focus-visible:ring-2 focus-visible:ring-vault-amber/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-inherit hover:bg-vault-amber/10',
        destructive: 'text-destructive hover:bg-destructive/10',
      },
      size: {
        xs: 'p-0.5',
        sm: 'p-1',
        md: 'p-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export interface IconButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Nombre accesible: el botón no tiene texto visible. */
  label: string;
}

/**
 * Botón de solo icono usado en toda la feature de manager
 * (copiar, mostrar/ocultar, editar, eliminar, favorito...).
 * `label` se usa como `aria-label` y como tooltip nativo.
 */
export const IconButton = ({
  label,
  className,
  variant = 'default',
  size = 'sm',
  type = 'button',
  title,
  ...props
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    title={title ?? label}
    className={cn(iconButtonVariants({ variant, size }), className)}
    {...props}
  />
);

const chevronSizes = {
  sm: { frame: 'w-7 h-7', icon: 'w-4 h-4' },
  xs: { frame: 'w-6 h-6', icon: 'w-3 h-3' },
} as const;

export interface ChevronButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estado del bloque que alterna (controla la rotación de la flecha). */
  open: boolean;
  /** Nombre accesible del botón. */
  label: string;
  /** `sm`: cabecera del formulario · `xs`: cabecera de configuración. */
  size?: keyof typeof chevronSizes;
}

/**
 * Botón con flecha dentro de `vault-icon-frame` para plegar/expandir
 * secciones (cabecera del formulario y bloque de configuración).
 */
export const ChevronButton = ({
  open,
  label,
  size = 'sm',
  className,
  type = 'button',
  title,
  ...props
}: ChevronButtonProps) => {
  const { frame, icon } = chevronSizes[size];

  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      aria-expanded={open}
      className={cn('vault-icon-frame cursor-pointer', frame, className)}
      {...props}
    >
      <svg
        aria-hidden="true"
        className={cn(
          'text-white transition-transform duration-200',
          icon,
          open && 'rotate-180'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};
