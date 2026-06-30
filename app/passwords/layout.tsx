import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
    title: "Passwords",
    description: "ClaveVault - Gestor de contraseñas",
};

export default function PasswordsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh w-full flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
            <Header />
            <main className="flex-1 px-4 py-12 md:py-20">
                <div className="w-full max-w-4xl mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}
