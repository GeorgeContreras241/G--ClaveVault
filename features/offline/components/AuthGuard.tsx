'use client';
import { OfflineUnlock } from './OfflineUnlock';
import { useStoragePass } from '@/commons/storage/useStoragePass';
import { Header } from '@/commons/components/layout/Header';
import { Footer } from '@/commons/components/layout/Footer';
import type { AuthGuardProps } from '@/features/offline';

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const isUnlocked = useStoragePass((state) => state.isUnlocked);
  const setIsUnlocked = useStoragePass((state) => state.setIsUnlocked);

  if (!isUnlocked) {
    return (
      <div className="h-[100dvh] w-full py-6 relative z-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col h-full">
          <div className="w-full">
            <Header />
          </div>
          <main className="flex-1 flex items-center justify-center h-full">
            <div className="w-full">
              <OfflineUnlock onSuccess={() => setIsUnlocked(true)} />
            </div>
          </main>
          <div className="w-full">
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
