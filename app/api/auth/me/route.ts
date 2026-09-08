import { SessionService } from "@/server/services/SessionService"
import { VaultService } from "@/server/services/VaultService"

function toBase64(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64')
}

export const GET = async () => {
    try {
        const session = await SessionService.validate()
        if (!session) {
            return Response.json({ ok: false, error: "No autenticado" }, { status: 401 })
        }

        const vault = await VaultService.findByUserId(session.userId)

        if (!vault) {
            return Response.json({ ok: true, hasVault: false })
        }

        if(!vault.salt || !vault.iv || !vault.encryptedData) {
            return Response.json({ ok: false, error: "Datos del vault incompletos" }, { status: 500 })
        }
        return Response.json({
            ok: true,
            hasVault: true,
            salt: toBase64(vault.salt),
            iv: toBase64(vault.iv),
            encryptedData: toBase64(vault.encryptedData),
            version: vault.version,
            updatedAt: vault.updatedAt,
        })
    } catch (error) {
        console.error("Error al obtener vault:", error)
        return Response.json({ ok: false, error: "Error al obtener datos" }, { status: 500 })
    }
}
