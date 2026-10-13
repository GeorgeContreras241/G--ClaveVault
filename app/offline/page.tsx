import { Manager } from '@/features/vault-management/Management';
import { AuthGuard } from '@/features/offline';
import { Header } from '@/commons/components/layout/Header';
import { Footer } from '@/commons/components/layout/Footer';

export default function OfflinePage() {
  return (
    <AuthGuard>
      <Header />
      <Manager />
      <Footer />
    </AuthGuard>
  );
}
