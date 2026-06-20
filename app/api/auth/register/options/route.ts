import { generateRegistrationOptions } from '@simplewebauthn/server'
import { prisma } from '@/lib/db'
import { Challenge } from '@/server/models'
import { challenges } from '@/lib/webauthn-store'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return Response.json({ ok: false, error: 'Email es requerido' }, { status: 400 })
    }

    // Verificar si el email ya está registrado
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return Response.json(
        { ok: false, error: 'Este email ya está registrado. Inicia sesión para agregar un nuevo authenticator.' },
        { status: 409 }
      )
    }

    // Crear usuario nuevo
    const user = await prisma.user.create({ data: { email } })

    // Generar opciones WebAuthn
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

    // Guardar challenge con expiración
    const challenge = new Challenge(email, options.challenge)
    challenges.set(email, challenge)

    return Response.json({ ok: true, options })
  } catch (error) {
    return Response.json({ ok: false, error: 'Error al generar opciones' }, { status: 500 })
  }
}
