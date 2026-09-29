import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import { AuthService, SessionService } from '@/server/services';
import { UserRepository, CredentialRepository } from '@/server/repositories';
import { ValidationService } from '@/server/services/ValidationService';
import { CsrfService } from '@/server/services/CsrfService';
import { nextCookieJar } from '@/server/utils/cookies';
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

    const validation = ValidationService.validateLoginVerifyPayload(body.body);
    if (!validation.ok) {
      return ValidationService.toResponse(validation);
    }

    const { attResp, challengeId } = body.body as {
      attResp: AuthenticationResponseJSON;
      challengeId: string;
    };

    // El email ya no viaja en el cuerpo: lo aporta el reto guardado en
    // Redis, así que no se puede elegir la cuenta desde el cliente.
    const result = await authService.verifyAuthentication(attResp, challengeId);

    // La sesión y el token CSRF nacen juntos: aunque el cliente no haya
    // cargado antes ninguna página, ya sale de aquí con ambos.
    const jar = await nextCookieJar();
    await SessionService.create(result.userId, jar);
    CsrfService.issue(jar);

    return ok();
  } catch (error) {
    return handleRouteError(error, 'Error al verificar autenticación');
  }
}
