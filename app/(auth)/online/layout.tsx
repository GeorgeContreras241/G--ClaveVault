import { Header } from '@/commons/components/layout/Header';
import { Footer } from '@/commons/components/layout/Footer';

export const metadata = {
  title: 'Online',
  description: 'ClaveVault Online - Autenticación WebAuthn',
};

export default function OnlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="vault-bg" aria-hidden="true" />
      <div className="relative z-10 flex w-full flex-1 flex-col py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4">
          <div className="w-full">
            <Header />
          </div>
          <main className="flex flex-1 items-center justify-center py-12 md:py-20">
            <div className="w-full max-w-sm">{children}</div>
          </main>
          <div className="w-full">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
