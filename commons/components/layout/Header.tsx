import Link from 'next/link';
import { cn } from '@/commons/lib/utils';
import { Arrow } from '../icons/Arrow';

export const Header = ({ className }: { className?: string }) => {
  return (
    <header
      className={cn(
        'flex w-full justify-center sticky top-0 z-50 px-4 py-5.5 md:px-6 rounded-lg',
        className
      )}
      aria-label="Navegación principal"
    >
      <div className="w-full max-w-5xl grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 justify-self-start text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300 cursor-pointer"
          aria-label="Volver al inicio"
          title="Volver al inicio"
        >
          <div className="w-4 h-4 shrink-0 rotate-180">
            <Arrow />
          </div>
          <span className="hidden text-meta font-medium tracking-meta uppercase min-[360px]:block">
            Volver
          </span>
        </Link>
        <p className="font-display text-heading font-semibold leading-heading tracking-heading text-zinc-900 dark:text-zinc-50 justify-self-center">
          ClaveVault
        </p>
        <Link
          href="/#main-content"
          className="justify-self-end whitespace-nowrap text-meta font-medium tracking-meta uppercase text-zinc-600 transition-colors duration-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 cursor-pointer"
          aria-label="Acerca de ClaveVault"
          title="Acerca de ClaveVault"
        >
          Acerca de
        </Link>
      </div>
    </header>
  );
};
