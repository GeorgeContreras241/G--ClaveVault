import { AuthService, RegistrationError } from '@/server/services'
import { UserRepository, CredentialRepository } from '@/server/repositories'

const userRepo = new UserRepository()
const credentialRepo = new CredentialRepository()
const authService = new AuthService(userRepo, credentialRepo)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // validation email
    if (!email || typeof email !== 'string') {
      return Response.json({ ok: false, error: 'Email es requerido' }, { status: 400 })
    }

    // Generar opciones de login
    const options = await authService.generateAuthenticationOptions(email)
    return Response.json({ ok: true, options })

  } catch (error) {
    if (error instanceof RegistrationError) {
      return Response.json({ ok: false, error: error.message }, { status: error.statusCode })
    }
    return Response.json({ ok: false, error: 'Error al generar opciones' }, { status: 500 })
  }
}
