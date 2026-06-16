import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
    title: "Online",
    description: "ClaveVault Online - Autenticación WebAuthn",
};

export default function OnlineLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-dvh w-full grid place-items-center gap-4 p-4 md:p-6">
            <div className="w-full max-w-5xl">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    {children}
                </main>
                <Footer />
            </div>
        </main>
    );
}