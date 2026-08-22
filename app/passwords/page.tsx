
import { Suspense } from "react";
import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import { OnlineProvider } from "@/components/providers/OnlineProvider";

export default function PasswordsPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <PasswordsContent />
        </Suspense>
    );
}


export async function PasswordsContent() {
    const user = await getUser();
    // necesito averiguar como funciona el redirect de nextjs, para que no se pueda acceder a esta pagina si no hay un usuario logueado
    if (!user) {
        redirect("/online");
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">
                Mis Contraseñas
            </h1>

            <p className="text-muted-foreground">
                Hola {user.email}, Necesitamos tu Master key para acceder a tus contraseñas.
            </p>
            {/* componente para ingresar la master key */}
            <OnlineProvider/>



        </div>
    );
}
