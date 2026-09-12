import { SessionService } from "@/server/services/SessionService"
import { VaultService } from "@/server/services/VaultService"


function toBase64(bytes: Uint8Array): string {
    return Buffer.from(bytes).toString('base64')
}

export const GET = async () => {
    console.log("[/api/auth/me] Consultando vault del usuario autenticado")
    try {
        const session = await SessionService.validate()
        if (!session) {
            return Response.json({ ok: false, error: "No autenticado" }, { status: 401 })
        }

        const vault = await VaultService.findByUserId(session.userId)

        if (!vault) {
            return Response.json({ ok: true, hasVault: false })
        }

        if (!vault.salt || !vault.iv || !vault.encryptedData) {
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



export const POST = async (req: Request) => {
    console.log("[/api/auth/me] Guardando vault en servidor")
    const body = await req.json()
    const { salt, iv, encryptedData } = body
    if (!salt || !iv || !encryptedData) {
        return Response.json({ ok: false, error: "Datos incompletos" }, { status: 400 })
    }
    try {
        const session = await SessionService.validate()
        if (!session) {
            return Response.json({ ok: false, error: "No autenticado" }, { status: 401 })
        }

        const existing = await VaultService.findByUserId(session.userId)
        const newVersion = existing ? existing.version + 1 : 1

        const upsert = await VaultService.upsert(
            session.userId,
            Buffer.from(salt, 'base64'),
            Buffer.from(iv, 'base64'),
            Buffer.from(encryptedData, 'base64'),
            newVersion
        )

        if (!upsert) {
            return Response.json({ ok: false, error: "Error al guardar vault" }, { status: 500 })
        }

        return Response.json({ ok: true, version: newVersion })
    } catch (error) {
        console.error("Error al guardar vault:", error)
        return Response.json({ ok: false, error: "Error al guardar" }, { status: 500 })
    }
}