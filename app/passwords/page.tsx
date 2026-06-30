import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

export default async function PasswordsPage() {
    const user = await getUser();
    if (!user) redirect("/online");

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Mis Contraseñas</h1>
            <p className="text-muted-foreground">
                Hola {user.email}, aquí están tus contraseñas guardadas.
            </p>
        </div>
    );
}
