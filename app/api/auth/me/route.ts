import { SessionService, VaultService } from '@/server/services';
import { ValidationService } from '@/server/services/ValidationService';
import { RateLimitService } from '@/server/services/RateLimitService';
import { CsrfService } from '@/server/services/CsrfService';
import { fail, handleRouteError, ok } from '@/server/http';

const NO_STORE = ValidationService.NO_STORE;

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export const GET = async () => {
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

    const vault = await VaultService.findByUserId(session.userId);

    if (!vault) {
      return Response.json(
        { ok: true, hasVault: false },
        { headers: NO_STORE }
      );
    }

    if (!vault.salt || !vault.iv || !vault.encryptedData) {
      return fail('Datos del vault incompletos', 500);
    }

    return Response.json(
      {
        ok: true,
        hasVault: true,
        salt: toBase64(vault.salt),
        iv: toBase64(vault.iv),
        encryptedData: toBase64(vault.encryptedData),
        version: vault.version,
        updatedAt: vault.updatedAt,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    return handleRouteError(error, 'Error al obtener datos');
  }
};

export const POST = async (request: Request) => {
  try {
    // Doble capa: `Origin` (proxy.ts) + token de doble cookie.
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

    const body = await ValidationService.readJson(
      request,
      ValidationService.MAX_JSON_VAULT_BYTES
    );
    if (!body.ok) {
      return body.response;
    }

    const validation = ValidationService.validateVaultPayload(
      body.body as { salt?: unknown; iv?: unknown; encryptedData?: unknown }
    );
    if (!validation.ok) {
      return ValidationService.toResponse(validation);
    }

    const { salt, iv, encryptedData } = body.body as {
      salt: string;
      iv: string;
      encryptedData: string;
    };

    const existing = await VaultService.findByUserId(session.userId);
    const newVersion = existing ? existing.version + 1 : 1;

    const upsert = await VaultService.upsert(
      session.userId,
      Buffer.from(salt, 'base64'),
      Buffer.from(iv, 'base64'),
      Buffer.from(encryptedData, 'base64'),
      newVersion
    );

    if (!upsert) {
      return fail('Error al guardar vault', 500);
    }

    return ok({ version: newVersion });
  } catch (error) {
    return handleRouteError(error, 'Error al guardar');
  }
};
