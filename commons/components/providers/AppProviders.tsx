'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { TOAST_EVENT } from '@/commons/lib/toast';

/**
 * El toaster se monta bajo demanda: `sileo` importa `motion/react` y no debe
 * entrar en el bundle inicial. `commons/lib/toast` emite `TOAST_EVENT` al
 * primer aviso y aquí se carga el contenedor. La cola de toasts vive en el
 * store de `sileo`, así que el aviso que dispara el montaje no se pierde.
 */
const Toaster = dynamic(
  () => import('sileo').then((mod) => ({ default: mod.Toaster })),
  { ssr: false }
);

function LazyToaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mount = () => setMounted(true);
    window.addEventListener(TOAST_EVENT, mount);
    return () => window.removeEventListener(TOAST_EVENT, mount);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Toaster position="top-center" theme="light" />;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <LazyToaster />
    </ThemeProvider>
  );
}
