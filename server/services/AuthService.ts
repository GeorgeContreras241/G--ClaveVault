import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { UserRepository, CredentialRepository } from '@/server/repositories';
import { WebAuthnCredential } from '@/server/models';
import { webauthnConfig } from '@/server/config';
import { ChallengeService } from '@/server/services/ChallengeService';

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private credentialRepo: CredentialRepository
  ) {}

  // options Registration - Register
  async generateRegistrationOptions(email: string) {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new RegistrationError('Este email ya está registrado.', 409);
    }

    const options = await generateRegistrationOptions({
      rpName: webauthnConfig.rpName,
      rpID: webauthnConfig.rpID,
      userName: email,
      timeout: webauthnConfig.timeout,
      attestationType: webauthnConfig.attestationType,
      excludeCredentials: [],
      authenticatorSelection: webauthnConfig.authenticatorSelection,
    });

    // El reto se indexa por un id aleatorio: el email nunca viaja en claro
    // en la verificación posterior y nadie puede pisar el reto de otro.
    const challengeId = await ChallengeService.create(
      email,
      options.challenge,
      'registration'
    );

    return { options, challengeId };
  }

  async verifyRegistration(
    attResp: RegistrationResponseJSON,
    challengeId: string
  ) {
    const challenge = await ChallengeService.consume(
      challengeId,
      'registration'
    );
    if (!challenge) {
      throw new RegistrationError('Challenge no encontrado o expirado', 400);
    }

    const email = challenge.email;

    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge: challenge.value,
      expectedOrigin: webauthnConfig.origin,
      expectedRPID: webauthnConfig.rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new RegistrationError('Verificación fallida', 400);
    }

    const { credential } = verification.registrationInfo;

    // La credencial es única a nivel global: si ya existe no se crea otra.
    const duplicated = await this.credentialRepo.findByCredentialId(
      credential.id
    );
    if (duplicated) {
      throw new RegistrationError('Esta credencial ya está registrada', 409);
    }

    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      user = await this.userRepo.create(email);
    }

    const webAuthnCredential = WebAuthnCredential.create({
      userId: user.id,
      credentialId: credential.id,
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports?.join(','),
    });

    await this.credentialRepo.save(webAuthnCredential);

    return { ok: true };
  }

  // options Authentication - Login
  async generateAuthenticationOptions(email: string) {
    const existingUser = await this.userRepo.findByEmail(email);
    if (!existingUser) {
      throw new RegistrationError('email no registrado', 404);
    }

    const credentials = await this.credentialRepo.findByUserId(existingUser.id);

    const options = await generateAuthenticationOptions({
      rpID: webauthnConfig.rpID,
      timeout: webauthnConfig.timeout,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports
          ? ([cred.transports] as AuthenticatorTransportFuture[])
          : undefined,
      })),
      userVerification: webauthnConfig.authenticatorSelection.userVerification,
    });

    const challengeId = await ChallengeService.create(
      email,
      options.challenge,
      'authentication'
    );

    return { options, challengeId };
  }

  async verifyAuthentication(
    attResp: AuthenticationResponseJSON,
    challengeId: string
  ): Promise<{ ok: true; userId: string }> {
    const challenge = await ChallengeService.consume(
      challengeId,
      'authentication'
    );
    if (!challenge) {
      throw new RegistrationError('Challenge no encontrado o expirado', 400);
    }

    // El email NO viene del cuerpo de la petición: lo decide el servidor
    // cuando emitió el reto, así no se puede "cambiar de cuenta" a mitad.
    const email = challenge.email;

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new RegistrationError('email no registrado', 404);
    }

    const storedCredential =
      await this.credentialRepo.findByUserIdAndCredentialId(
        user.id,
        attResp.id
      );
    if (!storedCredential) {
      throw new RegistrationError('Credencial no encontrada', 404);
    }

    // Defensa en profundidad: la credencial pertenece obligatoriamente a
    // este usuario. Cerraría el hueco de la cuenta.
    if (storedCredential.userId !== user.id) {
      throw new RegistrationError(
        'Credencial no pertenece a este usuario',
        403
      );
    }

    const verification = await verifyAuthenticationResponse({
      response: attResp,
      expectedChallenge: challenge.value,
      expectedOrigin: webauthnConfig.origin,
      expectedRPID: webauthnConfig.rpID,
      credential: {
        id: storedCredential.credentialId,
        publicKey: new Uint8Array(
          storedCredential.publicKey
        ) as Uint8Array<ArrayBuffer>,
        counter: storedCredential.counter,
        transports: storedCredential.transports
          ? ([storedCredential.transports] as AuthenticatorTransportFuture[])
          : undefined,
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      throw new RegistrationError('Verificación fallida', 400);
    }

    await this.credentialRepo.updateCounter(
      storedCredential.credentialId,
      verification.authenticationInfo.newCounter
    );

    return { ok: true, userId: user.id };
  }
}

export class RegistrationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'RegistrationError';
  }
}
