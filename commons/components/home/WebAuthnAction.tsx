'use client';
import WebAuthn from '@/commons/components/icons/WebAuthn';
import Link from 'next/link';
import { sileo } from 'sileo';
import { alerts } from '@/commons/constants/alerts';

const ONLINE_ENABLED = true;

export function WebAuthnAction() {
  const handleClick = (e: React.MouseEvent) => {
    if (!ONLINE_ENABLED) {
      e.preventDefault();
      sileo.warning(alerts.onlineUnavailable);
    }
  };

  return (
    <Link
      className="group relative flex items-center gap-4 rounded-2xl p-4 text-left md:p-6 active:scale-[0.99] border border-border hover:border-border-strong cursor-pointer"
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
        <h2 className="text-subheading font-semibold leading-heading tracking-heading text-foreground">
          WebAuthn
        </h2>
        <p className="text-caption leading-ui text-muted-foreground md:text-body">
          Biometría, PIN o llave de seguridad
        </p>
        <span className="vault-status-soon flex justify-start md:justify-center">
          Próximamente
        </span>
      </div>
    </Link>
  );
}
