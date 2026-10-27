import { SessionService } from '@/server/features/session/SessionService';
import { VaultService } from '@/server/features/vault/VaultService';
import { ValidationService } from '@/server/validation';
import { RateLimitService } from '@/server/features/rate-limit/RateLimitService';
import { CsrfService } from '@/server/features/csrf/CsrfService';
import { fail, handleRouteError, ok } from '@/server/http';

export const GET = async () => {
  try {
    const session = await SessionService.validate();
    if (!session) {
      return fail('No autenticado', 401);
    }

    const rate = await RateLimitService.hit(
      `vault:list:${session.userId}`,
      240,
      60
    );
    if (!rate.allowed) {
      return RateLimitService.toResponse(rate);
    }

    const vaults = await VaultService.list(session.userId);
    return ok({ vaults });
  } catch (error) {
    return handleRouteError(error, 'Error al listar las bóvedas');
  }
};

export const POST = async (request: Request) => {
  try {
    CsrfService.assert(request);

    const session = await SessionService.validate();
    if (!session) {
      return fail('No autenticado', 401);
    }

    const rate = await RateLimitService.hit(
      `vault:create:${session.userId}`,
      20,
      60 * 60
    );
    if (!rate.allowed) {
      return RateLimitService.toResponse(rate);
    }

    const body = await ValidationService.readJson(
      request,
      ValidationService.MAX_JSON_VAULT_BYTES
    );
    if (!body.ok) {
      return body.response;
    }

    const validation = ValidationService.validateCreateVaultPayload(body.body);
    if (!validation.ok) {
      return ValidationService.toResponse(validation);
    }

    const { name, salt, iv, encryptedData } = body.body as {
      name: string;
      salt: string;
      iv: string;
      encryptedData: string;
    };

    const vault = await VaultService.create(session.userId, {
      name,
      salt: Buffer.from(salt, 'base64'),
      iv: Buffer.from(iv, 'base64'),
      encryptedData: Buffer.from(encryptedData, 'base64'),
    });

    return ok({ vault });
  } catch (error) {
    return handleRouteError(error, 'Error al crear la bóveda');
  }
};
