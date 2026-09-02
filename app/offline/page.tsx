import { Gestor } from "@/features/manager/Gestor";
import { AuthGuard } from "./AuthGuard";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function OfflinePage() {
  return (
    <AuthGuard>
      <Header />
      <Gestor />
      <Footer />
    </AuthGuard>
  );
}
