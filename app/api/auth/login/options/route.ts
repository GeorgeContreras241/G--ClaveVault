import { AuthService } from '@/server/services';
import { UserRepository, CredentialRepository } from '@/server/repositories';
import { ValidationService } from '@/server/services/ValidationService';
import { authRateLimit, handleRouteError, ok } from '@/server/http';

const userRepo = new UserRepository();
const credentialRepo = new CredentialRepository();
const authService = new AuthService(userRepo, credentialRepo);

export async function POST(request: Request) {
  try {
    const limited = await authRateLimit(request, 'options');
    if (limited) {
      return limited;
    }

    const body = await ValidationService.readJson(request);
    if (!body.ok) {
      return body.response;
    }

    const validation = ValidationService.validateOptionsPayload(body.body);
    if (!validation.ok) {
      return ValidationService.toResponse(validation);
    }

    const email = body.body.email as string;
    const { options, challengeId } =
      await authService.generateAuthenticationOptions(email);

    return ok({ options, challengeId });
  } catch (error) {
    return handleRouteError(error, 'Error al generar opciones');
  }
}
