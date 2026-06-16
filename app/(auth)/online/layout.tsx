import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
    title: "Online",
    description: "ClaveVault Online - Autenticación WebAuthn",
};

export default function OnlineLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh w-full flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
            <Header />
            <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}