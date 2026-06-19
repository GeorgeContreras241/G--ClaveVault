import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/db'
import { challenges } from '@/lib/webauthn-store'

export async function POST(request: Request) {
  try {
    const { attResp, email } = await request.json()

    if (!attResp || !email) {
      return Response.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const expectedChallenge = challenges.get(email)
    if (!expectedChallenge) {
      return Response.json({ ok: false, error: 'Challenge no encontrado' }, { status: 400 })
    }

    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge,
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

    // Guardar credencial en la base de datos
    await prisma.webAuthnCredential.create({
      data: {
        userId: user.id,
        credentialId: Buffer.from(credential.id).toString('base64url'),
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
      }
    })

    // Borrar challenge usado
    challenges.delete(email)

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: 'Error al verificar registro' }, { status: 500 })
  }
}
