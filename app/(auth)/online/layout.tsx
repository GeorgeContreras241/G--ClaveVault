import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
    title: "Online",
    description: "ClaveVault Online - Autenticación WebAuthn",
};

export default function OnlineLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="vault-bg" aria-hidden="true" />
            <div className="min-h-dvh w-full py-6 relative z-10">
                <div className="max-w-4xl mx-auto px-4 flex flex-col min-h-[600px]">
                    <div className="w-full">
                        <Header />
                    </div>
                    <main className="flex-1 flex items-center justify-center py-12 md:py-20">
                        <div className="w-full max-w-sm">
                            {children}
                        </div>
                    </main>
                    <div className="w-full">
                        <Footer />
                    </div>
                </div>
            </div>
        </>
    );
}