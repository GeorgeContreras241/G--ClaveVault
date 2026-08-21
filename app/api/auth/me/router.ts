import { SessionService } from "@/server/services/SessionService"


export const POST = async () => {
    try {
        const seccionValidate = await SessionService.validate()
        // contenido cifrado respuesta
    } catch (error) {

    }
}