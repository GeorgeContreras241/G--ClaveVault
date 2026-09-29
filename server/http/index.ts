import { RegistrationError } from '@/server/services/AuthService';
import { CsrfError, CsrfService } from '@/server/services/CsrfService';
import { RateLimitService } from '@/server/services/RateLimitService';
import { NO_STORE } from '@/server/services/ValidationService';
import { getClientIp } from '@/server/utils/ip';

/** Respuesta `200` con cabecera `no-store` aplicada por defecto. */
export function ok(data: Record<string, unknown> = {}): Response {
  return Response.json(
    { ok: true, ...data },
    { status: 200, headers: NO_STORE }
  );
}

/** Respuesta de error genérica con `no-store`. */
export function fail(error: string, status: number, field?: string): Response {
  return Response.json(
    { ok: false, error, ...(field ? { field } : {}) },
    { status, headers: NO_STORE }
  );
}

/**
 * Traduce cualquier error lanzado en el cuerpo de una ruta a su respuesta
 * HTTP: errores de CSRF (403), errores de dominio de autenticación
 * (`RegistrationError`) y, como último recurso, un 500 sin filtrar detalles.
 */
export function handleRouteError(error: unknown, fallback: string): Response {
  if (error instanceof CsrfError) {
    return CsrfService.toResponse(error);
  }
  if (error instanceof RegistrationError) {
    return fail(error.message, error.statusCode);
  }

  console.error(`[api] ${fallback}:`, error);
  return fail(fallback, 500);
}

/**
 * Rate limiting por IP para las rutas de autenticación.
 *
 * Devuelve `null` cuando la petición pasa; una respuesta `429` con
 * `Retry-After` cuando se supera el límite.
 */
export async function authRateLimit(
  request: Request,
  bucket: 'options' | 'verify',
  limit = 20,
  windowSeconds = 15 * 60
): Promise<Response | null> {
  const decision = await RateLimitService.hit(
    `auth:${bucket}:${getClientIp(request)}`,
    limit,
    windowSeconds
  );

  return decision.allowed ? null : RateLimitService.toResponse(decision);
}
