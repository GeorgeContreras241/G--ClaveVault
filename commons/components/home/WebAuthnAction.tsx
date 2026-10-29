'use client';
import WebAuthn from '@/commons/components/icons/WebAuthn';
import Link from 'next/link';
import { sileo } from 'sileo';

const ONLINE_ENABLED = true;

export function WebAuthnAction() {
  const handleClick = (e: React.MouseEvent) => {
    if (!ONLINE_ENABLED) {
      e.preventDefault();
      sileo.warning({
        title: 'Modo online aún no disponible',
        description:
          'Estamos trabajando en ello. Próximamente podrás acceder desde cualquier dispositivo.',
        duration: 4000,
      });
    }
  };

  return (
    <Link
      className="group relative flex items-center gap-4 rounded-2xl p-4 text-left md:p-6 active:scale-[0.99] border border-zinc-300 dark:border-zinc-500/30 hover:border-zinc-400 dark:hover:border-zinc-500/80 cursor-pointer"
      role="menuitem"
      aria-label="WebAuthn - Autenticación biométrica"
      href="/online"
      onClick={handleClick}
    >
      <div
        className="vault-icon-frame h-12 w-12 shrink-0 rounded-xl md:h-13 md:w-13"
        aria-hidden="true"
      >
        <WebAuthn />
      </div>
      <div className="min-w-0 flex-1 space-y-1 text-start md:text-center md:space-y-1.5">
        <h2 className="text-subheading font-semibold leading-heading tracking-heading text-zinc-900 dark:text-zinc-50">
          WebAuthn
        </h2>
        <p className="text-caption leading-ui text-zinc-600 dark:text-zinc-400 md:text-body">
          Biometría, PIN o llave de seguridad
        </p>
        <span className="vault-status-soon flex justify-start md:justify-center">
          Próximamente
        </span>
      </div>
    </Link>
  );
}
