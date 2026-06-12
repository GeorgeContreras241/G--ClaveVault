import { WebAuthnLogin } from "@/components/auth/WebAuthnLogin";

export const metadata = {
    title: "Iniciar Sesión",
    description: "Inicia sesión en ClaveVault con WebAuthn",
};

export default function LoginPage() {
    return (
        <main className="flex-1 flex items-center justify-center">
            <WebAuthnLogin />
        </main>
    );
}
