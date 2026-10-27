import { Manager } from '@/features/vault-management/Manager';
import { AuthGuard } from '@/features/offline';
import { Header } from '@/commons/components/layout/Header';
import { Footer } from '@/commons/components/layout/Footer';

export default function OfflinePage() {
  return (
    <AuthGuard>
      <Header className="rounded-none bg-background/85 backdrop-blur-md" />
      <Manager />
      <Footer />
    </AuthGuard>
  );
}
