
import { Suspense } from "react";

import { OnlineProvider } from "@/components/providers/OnlineProvider";

import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import { PasswordsContent } from "./PasswordContent";

export default function PasswordsPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <PasswordsInit />
        </Suspense>
    );
}


export function PasswordsInit() {
    const user = getUser();

    if (!user) {
        redirect("/online");
    }
    // necesito averiguar como funciona el redirect de nextjs, para que no se pueda acceder a esta pagina si no hay un usuario logueado

    return <PasswordsContent />;
}
