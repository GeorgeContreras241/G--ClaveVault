import { WebAuthnRegister } from "@/components/auth/WebAuthnRegister";

export const metadata = {
    title: "Registrarse",
    description: "Crea una cuenta en ClaveVault con WebAuthn",
};

export default function RegisterPage() {
    return (
        <main className="flex-1 flex items-center justify-center">
            <WebAuthnRegister />
        </main>
    );
}
