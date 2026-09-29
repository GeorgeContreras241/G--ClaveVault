import type { RegistrationResponseJSON } from '@simplewebauthn/server';
import { AuthService } from '@/server/services';
import { UserRepository, CredentialRepository } from '@/server/repositories';
import { ValidationService } from '@/server/services/ValidationService';
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
