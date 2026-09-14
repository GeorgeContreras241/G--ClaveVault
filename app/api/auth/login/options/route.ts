import { AuthService, RegistrationError } from '@/server/services'
import { UserRepository, CredentialRepository } from '@/server/repositories'
import { ValidationService } from '@/server/services/ValidationService'

const userRepo = new UserRepository()
const credentialRepo = new CredentialRepository()
const authService = new AuthService(userRepo, credentialRepo)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const validation = ValidationService.validateEmail(email)
    if (!validation.ok) {
      return Response.json({ ok: false, error: validation.error }, { status: 400 })
    }

    const options = await authService.generateAuthenticationOptions(email)
    return Response.json({ ok: true, options })

  } catch (error) {
    if (error instanceof RegistrationError) {
      return Response.json({ ok: false, error: error.message }, { status: error.statusCode })
    }
    return Response.json({ ok: false, error: 'Error al generar opciones' }, { status: 500 })
  }
}
