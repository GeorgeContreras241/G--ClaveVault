import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { AuthService } from '@/server/features/auth/AuthService';
import { UserRepository } from '@/server/features/auth/UserRepository';
import { CredentialRepository } from '@/server/features/auth/CredentialRepository';
import { ValidationService } from '@/server/validation';
import { authRateLimit, handleRouteError, ok } from '@/server/http';

const userRepo = new UserRepository();
const credentialRepo = new CredentialRepository();
const authService = new AuthService(userRepo, credentialRepo);

export async function POST(request: Request) {
  try {
    const limited = await authRateLimit(request, 'verify');
    if (limited) {
      return limited;
    }

    const body = await ValidationService.readJson(request);
    if (!body.ok) {
      return body.response;
    }

    const validation = ValidationService.validateRegisterVerifyPayload(
      body.body
    );
    if (!validation.ok) {
      return ValidationService.toResponse(validation);
    }

    const { attResp, challengeId } = body.body as {
      attResp: RegistrationResponseJSON;
      challengeId: string;
    };

    await authService.verifyRegistration(attResp, challengeId);

    return ok();
  } catch (error) {
    return handleRouteError(error, 'Error al verificar registro');
  }
}
