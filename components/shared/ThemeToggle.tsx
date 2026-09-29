'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Dark } from '@/components/icons/Dark';
import { Light } from '@/components/icons/Light';

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // false en el servidor y true en el cliente: evita el desajuste de
  // hidratación del tema sin usar un efecto que haga setState.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`flex cursor-pointer items-center justify-center rounded-md bg-transparent  text-inherit transition-all duration-300 ${className ?? ''}`}
      aria-label={
        theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'
      }
    >
      {theme === 'dark' ? <Dark /> : <Light />}
    </button>
  );
}
