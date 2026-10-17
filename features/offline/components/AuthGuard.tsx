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
      <div className="relative z-10 flex w-full flex-1 flex-col py-6">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4">
          <div className="w-full">
            <Header />
          </div>
          <main className="flex flex-1 items-center justify-center">
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
