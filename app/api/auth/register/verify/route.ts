import { AuthService, RegistrationError } from '@/server/services'
import { UserRepository, CredentialRepository } from '@/server/repositories'

const userRepo = new UserRepository()
const credentialRepo = new CredentialRepository()
const authService = new AuthService(userRepo, credentialRepo)

export async function POST(request: Request) {
  try {

    const { attResp, email } = await request.json()


    if (!attResp || !email) {

      return Response.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    const result = await authService.verifyRegistration(attResp, email)

    return Response.json(result)
  } catch (error) {
    if (error instanceof RegistrationError) {
      return Response.json({ ok: false, error: error.message }, { status: error.statusCode })
    }
    return Response.json({ ok: false, error: 'Error al verificar registro' }, { status: 500 })
  }
}

