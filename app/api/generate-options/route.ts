import { generateRegistrationOptions } from '@simplewebauthn/server'
import { challenges } from '@/lib/webauthn-store'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ ok: false, error: 'Email es requerido' }, { status: 400 })
    }

    const options = await generateRegistrationOptions({
      rpName: 'ClaveVault',
      rpID: process.env.RP_ID || 'localhost',
      userName: email,
      timeout: 60000,
      attestationType: 'none',
      excludeCredentials: [],
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: 'preferred'
      }
    })

    challenges.set(email, options.challenge)

    return Response.json({ ok: true, options })
  } catch (error) {
    return Response.json({ ok: false, error: 'Error al generar opciones' }, { status: 500 })
  }
}