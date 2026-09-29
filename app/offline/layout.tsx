import type { Metadata } from 'next';
import { OfflineShell } from '@/features/offline/OfflineShell';

export const metadata: Metadata = {
  title: 'Gestor offline',
  description:
    'Administra tus credenciales sin conexión. Archivo cifrado local en el navegador con ClaveVault.',
  alternates: {
    canonical: '/offline',
  },
};

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OfflineShell>{children}</OfflineShell>;
}
