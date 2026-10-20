import { Suspense } from 'react';
import Archive from '@/commons/components/icons/Archive';
import Link from 'next/link';
import { CapabilityChip } from '@/commons/components/shared/CapabilityChip';
import { CAPABILITIES } from '@/commons/constants/capabilities';
import { WebAuthnAction } from '@/commons/components/home/WebAuthnAction';
import { WebAuthnFallback } from '@/commons/components/home/WebAuthnFallback';
import { Footer } from '@/commons/components/layout/Footer';

export default function Home() {
  return (
    <main className="home relative z-10 grid w-full place-items-center px-3 py-10 md:px-6 md:py-12">
      <div className="flex w-full max-w-3xl flex-col items-center gap-8 md:gap-10">
        <section
          id="main-content"
          className="vault-rise w-full rounded-3xl p-5 md:p-8 lg:p-10"
        >
          <header className="space-y-6">
            <div className="flex flex-col gap-5">
              <div className="vault-rise vault-rise-delay-1 space-y-3">
                <p className="vault-eyebrow">ClaveVault</p>
                <h1 className="font-display text-start text-display-xl font-semibold leading-display tracking-display text-balance text-zinc-900 dark:text-zinc-50">
                  Tu bóveda local de credenciales
                </h1>
                <p className="max-w-xl text-start text-body-lg leading-body text-pretty text-zinc-600 dark:text-zinc-400">
                  Almacena, organiza y protege tus claves en el navegador.
                  Cifrado en cliente,{' '}
                  <strong className="font-semibold text-blue-700 dark:text-blue-400">
                    cero servidores
                  </strong>{' '}
                  y control total sobre tus datos.
                </p>
              </div>

              <section
                className="vault-rise vault-rise-delay-2 grid grid-cols-3 gap-2 sm:gap-3"
                aria-label="Capacidades"
              >
                {CAPABILITIES.map((item) => (
                  <CapabilityChip key={item.text} text={item.text} />
                ))}
              </section>
            </div>
          </header>

          <nav
            className="vault-rise vault-rise-delay-3 mt-8 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-4"
            role="navigation"
            aria-label="Opciones principales"
          >
            {/* Se queja de Role de SEo - Pending*/}
            <Link
              href="/offline"
              title="Abrir gestor de contraseñas sin conexión"
              className="group relative flex  items-center gap-4 rounded-2xl p-4 md:p-6 border border-zinc-300 dark:border-zinc-500/30 hover:border-zinc-400 dark:hover:border-zinc-500/80 cursor-pointer"
              role="menuitem"
              aria-label="Uso Offline - Administrar claves sin conexión"
            >
              <div
                className="vault-icon-frame  h-12 w-12 shrink-0 md:h-14 md:w-14"
                aria-hidden="true"
              >
                <Archive />
              </div>
              <div className="min-w-0 flex-1 space-y-1 text-start md:text-center md:space-y-1.5">
                <h2 className="font-display text-subheading font-semibold leading-heading tracking-heading text-zinc-900 dark:text-zinc-50">
                  Uso Offline
                </h2>
                <p className="text-caption leading-ui text-zinc-600 dark:text-zinc-400 md:text-body">
                  Sin internet · archivo cifrado local
                </p>
                <span className="vault-status-live flex justify-start md:justify-center">
                  Disponible
                </span>
              </div>
            </Link>

            <WebAuthnPage />
          </nav>
        </section>

        <div className="vault-rise vault-rise-delay-4 w-full">
          <Footer />
        </div>
      </div>
    </main>
  );
}

// fix error cache components
const WebAuthnPage = () => {
  return (
    <Suspense fallback={<WebAuthnFallback />}>
      <WebAuthnAction />
    </Suspense>
  );
};
