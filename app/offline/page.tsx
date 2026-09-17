import { Manager } from "@/features/manager/Manager";
import { AuthGuard } from "./AuthGuard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function OfflinePage() {
  return (
    <AuthGuard>
      <Header />
      <Manager />
      <Footer />
    </AuthGuard>
  );
}
