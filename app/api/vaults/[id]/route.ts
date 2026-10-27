import { SessionService } from '@/server/features/session/SessionService';
import { VaultService } from '@/server/features/vault/VaultService';
import { ValidationService } from '@/server/validation';
import { RateLimitService } from '@/server/features/rate-limit/RateLimitService';
import { CsrfService } from '@/server/features/csrf/CsrfService';
import { fail, handleRouteError, ok } from '@/server/http';

type VaultRouteContext = { params: Promise<{ id: string }> };

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/** Comprueba el UUID antes de tocar Prisma: un id inválido es un 400. */
function assertVaultId(id: string): Response | null {
  return ValidationService.isValidUUID(id)
    ? null
    : fail('Identificador de bóveda inválido', 400, 'id');
}

export const GET = async (_request: Request, { params }: VaultRouteContext) => {
  try {
    const session = await SessionService.validate();
    if (!session) {
      return fail('No autenticado', 401);
    }

    const rate = await RateLimitService.hit(
      `vault:read:${session.userId}`,
      240,
      60
    );
    if (!rate.allowed) {
      return RateLimitService.toResponse(rate);
    }

    const { id } = await params;
    const invalidId = assertVaultId(id);
    if (invalidId) {
      return invalidId;
    }

    const vault = await VaultService.get(session.userId, id);

    return ok({
      vault: {
        id: vault.id,
        name: vault.name,
        salt: toBase64(vault.salt),
        iv: toBase64(vault.iv),
        encryptedData: toBase64(vault.encryptedData),
        version: vault.version,
        createdAt: vault.createdAt,
        updatedAt: vault.updatedAt,
      },
    });
  } catch (error) {
    return handleRouteError(error, 'Error al obtener la bóveda');
  }
};

export const PUT = async (request: Request, { params }: VaultRouteContext) => {
  try {
    CsrfService.assert(request);

    const session = await SessionService.validate();
    if (!session) {
      return fail('No autenticado', 401);
    }

    const rate = await RateLimitService.hit(
      `vault:write:${session.userId}`,
      120,
      60
    );
    if (!rate.allowed) {
      return RateLimitService.toResponse(rate);
    }

    const { id } = await params;
    const invalidId = assertVaultId(id);
    if (invalidId) {
      return invalidId;
    }

    const body = await ValidationService.readJson(
      request,
      ValidationService.MAX_JSON_VAULT_BYTES
    );
    if (!body.ok) {
      return body.response;
    }

    const validation = ValidationService.validateUpdateVaultPayload(body.body);
    if (!validation.ok) {
      return ValidationService.toResponse(validation);
    }

    const { salt, iv, encryptedData, version } = body.body as {
      salt: string;
      iv: string;
      encryptedData: string;
      version: number;
    };

    const result = await VaultService.update(session.userId, id, {
      salt: Buffer.from(salt, 'base64'),
      iv: Buffer.from(iv, 'base64'),
      encryptedData: Buffer.from(encryptedData, 'base64'),
      version,
    });

    return ok({ version: result.version });
  } catch (error) {
    return handleRouteError(error, 'Error al guardar la bóveda');
  }
};

export const DELETE = async (
  request: Request,
  { params }: VaultRouteContext
) => {
  try {
    CsrfService.assert(request);

    const session = await SessionService.validate();
    if (!session) {
      return fail('No autenticado', 401);
    }

    const rate = await RateLimitService.hit(
      `vault:delete:${session.userId}`,
      20,
      60 * 60
    );
    if (!rate.allowed) {
      return RateLimitService.toResponse(rate);
    }

    const { id } = await params;
    const invalidId = assertVaultId(id);
    if (invalidId) {
      return invalidId;
    }

    await VaultService.remove(session.userId, id);

    return ok();
  } catch (error) {
    return handleRouteError(error, 'Error al eliminar la bóveda');
  }
};
