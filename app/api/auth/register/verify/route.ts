import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/db'
import { WebAuthnCredential } from '@/server/models'
import { challenges } from '@/lib/webauthn-store'

export async function POST(request: Request) {
  try {
    const { attResp, email } = await request.json()

    if (!attResp || !email) {
      return Response.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    // Obtener y validar challenge
    const challenge = challenges.get(email)
    if (!challenge) {
      return Response.json({ ok: false, error: 'Challenge no encontrado' }, { status: 400 })
    }

    // Verificar que no esté expirado
    if (challenge.isExpired()) {
      challenges.delete(email)
      return Response.json({ ok: false, error: 'Challenge expirado' }, { status: 400 })
    }

    // Verificar la respuesta del authenticator
    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge: challenge.value,
      expectedOrigin: process.env.ORIGIN || 'http://localhost:3000',
      expectedRPID: process.env.RP_ID || 'localhost',
    })

    if (!verification.verified || !verification.registrationInfo) {
      return Response.json({ ok: false, error: 'Verificación fallida' }, { status: 400 })
    }

    const { credential } = verification.registrationInfo

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return Response.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Crear modelo de credencial
    const webAuthnCredential = WebAuthnCredential.create({
      userId: user.id,
      credentialId: Buffer.from(credential.id).toString('base64url'),
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
    })

    // Guardar en base de datos
    await prisma.webAuthnCredential.create({
      data: {
        userId: webAuthnCredential.userId,
        credentialId: webAuthnCredential.credentialId,
        publicKey: Buffer.from(webAuthnCredential.publicKey),
        counter: BigInt(webAuthnCredential.counter),
      }
    })

    // Borrar challenge usado
    challenges.delete(email)

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: 'Error al verificar registro' }, { status: 500 })
  }
}
