import { Header } from '@/commons/components/layout/Header';
import { Footer } from '@/commons/components/layout/Footer';

export const metadata = {
  title: 'Passwords',
  description: 'ClaveVault - Gestor de contraseñas',
};

export default async function PasswordsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex w-full flex-1 flex-col bg-gradient-to-b from-background via-background to-muted/20 py-6">
      <Header className="rounded-none bg-background/85 backdrop-blur-md" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pt-6 pb-12">
        <div className="w-full">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
