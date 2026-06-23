import {
  generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server'
import { UserRepository, CredentialRepository } from '@/server/repositories'
import { Challenge, WebAuthnCredential } from '@/server/models'
import { webauthnConfig } from '@/server/config'
import { challenges } from '@/lib/webauthn-store'

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private credentialRepo: CredentialRepository
  ) { }

  async generateRegistrationOptions(email: string) {
    // Verificar si el email ya está registrado
    const existingUser = await this.userRepo.findByEmail(email)
    if (existingUser) {
      throw new RegistrationError('Este email ya está registrado. Inicia sesión para agregar un nuevo authenticator.', 409)
    }

    // Crear usuario nuevo
    const user = await this.userRepo.create(email)

    // Generar opciones WebAuthn
    const options = await generateRegistrationOptions({
      rpName: webauthnConfig.rpName,
      rpID: webauthnConfig.rpID,
      userName: email,
      timeout: webauthnConfig.timeout,
      attestationType: webauthnConfig.attestationType,
      excludeCredentials: [],
      authenticatorSelection: webauthnConfig.authenticatorSelection,
    })

    // Guardar challenge con expiración
    const challenge = new Challenge(email, options.challenge)
    challenges.set(email, challenge)

    return options
  }

  async verifyRegistration(attResp: unknown, email: string) {
    // Obtener y validar challenge
    const challenge = challenges.get(email)
    if (!challenge) {
      throw new RegistrationError('Challenge no encontrado', 400)
    }

    // Verificar que no esté expirado
    if (challenge.isExpired(webauthnConfig.challengeTTL)) {
      challenges.delete(email)
      throw new RegistrationError('Challenge expirado', 400)
    }

    // Verificar la respuesta del authenticator
    const verification = await verifyRegistrationResponse({
      response: attResp as Parameters<typeof verifyRegistrationResponse>[0]['response'],
      expectedChallenge: challenge.value,
      expectedOrigin: webauthnConfig.origin,
      expectedRPID: webauthnConfig.rpID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      throw new RegistrationError('Verificación fallida', 400)
    }

    const { credential } = verification.registrationInfo

    // Buscar usuario
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new RegistrationError('Usuario no encontrado', 404)
    }

    // Crear modelo de credencial
    const webAuthnCredential = WebAuthnCredential.create({
      userId: user.id,
      credentialId: Buffer.from(credential.id).toString('base64url'),
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
    })

    // Guardar en base de datos
    await this.credentialRepo.save(webAuthnCredential)

    // Borrar challenge usado
    challenges.delete(email)

    return { ok: true }
  }

  async generateAuthenticationOptions(email: string) {
    // manejo de consulta a base de datos
    const existingUser = await this.userRepo.findByEmail(email)
    if (!existingUser) {
      throw new RegistrationError('Usuario no registrado', 404)
    }
    // Genera opciones de Autentificaion
    const options = generateAuthenticationOptions({
      rpID: webauthnConfig.rpID,
      timeout: webauthnConfig.timeout,
      allowCredentials: [],
      userVerification: webauthnConfig.authenticatorSelection.userVerification,
    })

    return options
  }

  async verifyAuthentication(email: string, attResp: any) {
    // verificar autentigifacion
    try {
      const verification = await verifyAuthenticationResponse({
        response: attResp,
        expectedChallenge: '',
        expectedOrigin: webauthnConfig.origin,
        expectedRPID: webauthnConfig.rpID,
        credential: {
          id: '',
          publicKey: new Uint8Array(),
          counter: 0,
        },
        requireUserVerification: true,
      })
      return verification
    } catch (error) {
      throw new RegistrationError('Verificación fallida', 400)
    }
  }


}

export class RegistrationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'RegistrationError'
  }
}
