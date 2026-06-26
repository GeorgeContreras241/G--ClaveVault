import {
  generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server'
import type { AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/server'
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
    const existingUser = await this.userRepo.findByEmail(email)
    if (existingUser) {
      throw new RegistrationError('Este email ya está registrado. Inicia sesión para agregar un nuevo authenticator.', 409)
    }

    const options = await generateRegistrationOptions({
      rpName: webauthnConfig.rpName,
      rpID: webauthnConfig.rpID,
      userName: email,
      timeout: webauthnConfig.timeout,
      attestationType: webauthnConfig.attestationType,
      excludeCredentials: [],
      authenticatorSelection: webauthnConfig.authenticatorSelection,
    })

    const challenge = new Challenge(email, options.challenge)
    challenges.set(email, challenge)

    return options
  }

  async verifyRegistration(attResp: unknown, email: string) {
    const challenge = challenges.get(email)
    if (!challenge) {
      throw new RegistrationError('Challenge no encontrado', 400)
    }

    if (challenge.isExpired(webauthnConfig.challengeTTL)) {
      challenges.delete(email)
      throw new RegistrationError('Challenge expirado', 400)
    }

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

    // Crear usuario después de verificación exitosa
    let user = await this.userRepo.findByEmail(email)
    if (!user) {
      user = await this.userRepo.create(email)
    }

    const webAuthnCredential = WebAuthnCredential.create({
      userId: user.id,
      credentialId: credential.id,
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports?.join(','),
    })

    await this.credentialRepo.save(webAuthnCredential)

    challenges.delete(email)

    return { ok: true }
  }

  async generateAuthenticationOptions(email: string) {
    const existingUser = await this.userRepo.findByEmail(email)
    if (!existingUser) {
      throw new RegistrationError('Usuario no registrado', 404)
    }

    const credentials = await this.credentialRepo.findByUserId(existingUser.id)

    const options = await generateAuthenticationOptions({
      rpID: webauthnConfig.rpID,
      timeout: webauthnConfig.timeout,
      allowCredentials: credentials.map(cred => ({
        id: cred.credentialId,
        transports: cred.transports
          ? [cred.transports] as AuthenticatorTransportFuture[]
          : undefined,
      })),
      userVerification: webauthnConfig.authenticatorSelection.userVerification,
    })

    const challenge = new Challenge(email, options.challenge)
    challenges.set(email, challenge)

    return options
  }

  async verifyAuthentication(email: string, attResp: AuthenticationResponseJSON) {
    const challenge = challenges.get(email)
    if (!challenge) {
      throw new RegistrationError('Challenge no encontrado', 400)
    }

    if (challenge.isExpired(webauthnConfig.challengeTTL)) {
      challenges.delete(email)
      throw new RegistrationError('Challenge expirado', 400)
    }

    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new RegistrationError('Usuario no encontrado', 404)
    }

    const storedCredential = await this.credentialRepo.findByCredentialId(attResp.id)
    if (!storedCredential) {
      throw new RegistrationError('Credencial no encontrada', 404)
    }

    const verification = await verifyAuthenticationResponse({
      response: attResp,
      expectedChallenge: challenge.value,
      expectedOrigin: webauthnConfig.origin,
      expectedRPID: webauthnConfig.rpID,
      credential: {
        id: storedCredential.credentialId,
        publicKey: new Uint8Array(storedCredential.publicKey) as Uint8Array<ArrayBuffer>,
        counter: storedCredential.counter,
        transports: storedCredential.transports
          ? [storedCredential.transports] as AuthenticatorTransportFuture[]
          : undefined,
      },
      requireUserVerification: true,
    })

    if (!verification.verified) {
      throw new RegistrationError('Verificación fallida', 400)
    }

    await this.credentialRepo.updateCounter(
      storedCredential.credentialId,
      verification.authenticationInfo.newCounter
    )

    challenges.delete(email)

    return { ok: true }
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
