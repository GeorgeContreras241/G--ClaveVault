import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { challenges, credentials } from '@/lib/webauthn-store'

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

    credentials.set(email, {
      credentialID: Buffer.from(credential.id).toString('base64url'),
      credentialPublicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
    })

    challenges.delete(email)

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ ok: false, error: 'Error al verificar registro' }, { status: 500 })
  }
}
