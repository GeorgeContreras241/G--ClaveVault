'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function OfflineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="vault-panel w-full max-w-md space-y-4 rounded-2xl p-6 text-center">
        <h1 className="font-sora text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Algo salió mal
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No se pudo cargar el gestor offline. Puedes intentar de nuevo o volver
          al inicio.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-vault-amber px-4 py-2 text-sm font-medium text-zinc-900 transition hover:opacity-90"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
