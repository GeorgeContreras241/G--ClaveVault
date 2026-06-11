import { Suspense } from "react";
import Archive from "../components/icons/Archive";
import SeccionSocial from "../components/Social/SocialSeccion";
import Link from "next/link";
import { Target } from "@/components/shared/Target";
import { target } from "@/const/target";
import { WebAuthnAction } from "@/components/home/WebAuthnAction";
import {
  SocialFallback,
  WebAuthnFallback,
} from "@/components/home/HomeFallbacks";

// Remember i have to do  a border animation - completed

export default function Home() {
  return (
    <>
      <div className="vault-bg" aria-hidden="true" />
      <div className="vault-grid" aria-hidden="true" />
      <div className="vault-grain" aria-hidden="true" />

      <main className="home relative z-10 grid min-h-dvh place-items-center px-3 py-10 md:px-6 md:py-12">
        <div className="flex w-full max-w-2xl flex-col items-center gap-8 md:gap-10">
          <section
            id="main-content"
            className="vault-panel vault-rise w-full rounded-3xl p-5 md:p-8 lg:p-10"
          >
            <header className="space-y-6">
              <div className="flex flex-col gap-5">
                <div className="vault-rise vault-rise-delay-1 space-y-3">
                  <p className="vault-eyebrow">ClaveVault</p>
                  <h1 className="font-sora text-start text-[1.65rem] font-bold leading-[1.05] tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[2.2rem] md:text-[2.75rem] lg:text-[3.25rem]">
                    Tu bóveda local de credenciales
                  </h1>
                  <p className="max-w-xl text-start text-[0.85rem] leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-sm md:text-base">
                    Almacena, organiza y protege tus claves en el navegador. Cifrado
                    en cliente,{" "}
                    <strong className="font-semibold text-amber-600 dark:text-vault-amber">
                      cero servidores
                    </strong>{" "}
                    y control total sobre tus datos.
                  </p>
                </div>

                <section
                  className="vault-rise vault-rise-delay-2 grid grid-cols-3 gap-2 sm:gap-3"
                  aria-label="Capacidades"
                >
                  {target.map((item) => (
                    <Target key={item.text} text={item.text} />
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
                  <h2 className="font-sora text-base font-semibold text-zinc-900 dark:text-zinc-50 md:text-lg">
                    Uso Offline
                  </h2>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 md:text-sm">
                    Sin internet · archivo cifrado local
                  </p>
                  <span className="vault-status-live text-green-800 flex justify-start md:justify-center">
                    Disponible
                  </span>
                </div>
              </Link>

              <Suspense fallback={<WebAuthnFallback />}>
                <WebAuthnAction />
              </Suspense>
            </nav>
          </section>

          <div className="vault-rise vault-rise-delay-4 w-full">
            <Suspense fallback={<SocialFallback />}>
              <SeccionSocial />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  );
}
