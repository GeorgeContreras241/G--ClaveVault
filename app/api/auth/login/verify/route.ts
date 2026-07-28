import { AuthService, RegistrationError } from '@/server/services'
import { UserRepository, CredentialRepository } from '@/server/repositories'
import { SessionService } from '@/server/services/SessionService'

const userRepo = new UserRepository()
const credentialRepo = new CredentialRepository()
const authService = new AuthService(userRepo, credentialRepo)

export async function POST(request: Request) {
  try {
    console.log("Corriendo app")
    const { attResp, email } = await request.json()

    if (!attResp || !email) {
      console.error("Datos incompletos")
      return Response.json({ ok: false, error: 'Datos incompletos' }, { status: 400 })
    }

    await authService.verifyAuthentication(email, attResp)

    const user = await userRepo.findByEmail(email)
    if (!user) {
      console.error("Usuario no encontrado")
      return Response.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 })
    }

    await SessionService.create(user.id)

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Error en verifyAuthentication:", error)
    if (error instanceof RegistrationError) {
      return Response.json({ ok: false, error: error.message }, { status: error.statusCode })
    }
    return Response.json({ ok: false, error: 'Error al verificar autenticación error de captura' }, { status: 500 })
  }
}



// this route error 500 
// reason: challenge not found
// it may be due to  lost of challenge during server load; for that i need to run the project in mode build , but  it gives an error