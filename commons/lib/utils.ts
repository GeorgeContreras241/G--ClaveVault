import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge no conoce los tokens `--text-*` propios y los clasifica como
 * color. Sin esta extensión, `cn('text-body text-muted-foreground')` elimina
 * `text-body` y el tamaño acaba siendo el heredado (16px).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display-xl',
        'text-display-lg',
        'text-display-md',
        'text-heading',
        'text-subheading',
        'text-body-lg',
        'text-body',
        'text-label',
        'text-caption',
        'text-meta',
        'text-technical',
        'text-button',
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
