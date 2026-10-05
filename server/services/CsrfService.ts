import type { CookieJar, CookieOptions } from '@/types/index';
import { randomToken, timingSafeEqual } from '@/server/utils/crypto';

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/** Caducidad de la cookie; se renueva automáticamente en cada petición. */
const CSRF_TOKEN_TTL_SECONDS = 60 * 60;

/** Métodos que no modifican estado y no necesitan protección. */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export class CsrfError extends Error {
  constructor(
    message: string,
    public readonly status: number = 403
  ) {
    super(message);
    this.name = 'CsrfError';
  }
}

function isSecureEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: false, // el cliente debe poder leerlo para reenviarlo
    secure: isSecureEnv(),
    sameSite: 'lax',
    path: '/',
    maxAge: CSRF_TOKEN_TTL_SECONDS,
  };
}

export function readCookieHeader(
  cookieHeader: string | null | undefined,
  name: string
): string | null {
  if (!cookieHeader) {
    return null;
  }
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }
    if (part.slice(0, separator).trim() !== name) {
      continue;
    }
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}

function hostOf(rawValue: string | null): string | null {
  if (!rawValue) {
    return null;
  }
  try {
    return new URL(rawValue).host.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Protección CSRF en dos capas:
 *
 * 1. **Origen**: `Origin` (o `Referer` como respaldo) debe coincidir con el
 *    `Host` de la petición. Bloquea el clásico ataque desde otro dominio.
 * 2. **Doble cookie**: el servidor emite `csrf_token` en una cookie
 *    legible; el cliente la devuelve en `X-CSRF-Token`. Un tercero puede
 *    forzar una petición desde su sitio, pero no puede leer esa cookie
 *    (política de mismo origen) ni inyectar la cabecera sin que el
 *    navegador dispare un preflight CORS.
 *
 * Las dos capas se validan en tiempo constante y se combinan con
 * `SameSite=Lax` en la cookie de sesión.
 */
export class CsrfService {
  /** ¿Es una petición que modifica estado y necesita protección? */
  static isMutating(method: string): boolean {
    return !SAFE_METHODS.has(method.toUpperCase());
  }

  /**
   * Devuelve el token existente o genera uno nuevo y lo deja en la jarra.
   * Ruta Handlers usan esta variante.
   */
  static issue(jar: CookieJar): string {
    const existing = jar.get(CSRF_COOKIE_NAME);
    if (existing && existing.length >= 32) {
      return existing;
    }

    const token = randomToken(32);
    jar.set(CSRF_COOKIE_NAME, token, baseCookieOptions());
    return token;
  }

  /**
   * Emite el token directamente en la respuesta de `proxy.ts`
   * (middleware) cuando todavía no existe.
   */
  static ensureForResponse(
    requestCookieValue: string | undefined,
    setCookie: (value: string, options: CookieOptions) => void
  ): string {
    if (requestCookieValue && requestCookieValue.length >= 32) {
      return requestCookieValue;
    }

    const token = randomToken(32);
    setCookie(token, baseCookieOptions());
    return token;
  }

  /**
   * Capa 1: valida que la petición venga del propio origen.
   * Lanza {@link CsrfError} si no.
   */
  static assertOrigin(headers: Headers): void {
    const origin = headers.get('origin');
    const referer = headers.get('referer');
    const host = headers.get('host')?.toLowerCase();

    const source = hostOf(origin) ?? hostOf(referer);

    if (!source || !host) {
      throw new CsrfError('Origen no identificable en la petición');
    }

    if (source !== host) {
      throw new CsrfError('Origen no permitido');
    }
  }

  /** Capa 2: compara el token enviado contra la cookie, sin fugas de tiempo. */
  static assertToken(headers: Headers): void {
    const cookieToken = readCookieHeader(
      headers.get('cookie'),
      CSRF_COOKIE_NAME
    );
    const headerToken = headers.get(CSRF_HEADER_NAME);

    if (!cookieToken || !headerToken) {
      throw new CsrfError('Token CSRF ausente');
    }

    if (!timingSafeEqual(cookieToken, headerToken)) {
      throw new CsrfError('Token CSRF inválido');
    }
  }

  /** Aplica ambas capas. Usado en las rutas autenticadas. */
  static assert(request: Request): void {
    if (!CsrfService.isMutating(request.method)) {
      return;
    }
    CsrfService.assertOrigin(request.headers);
    CsrfService.assertToken(request.headers);
  }

  static toResponse(error: CsrfError): Response {
    return Response.json(
      { ok: false, error: error.message, field: 'csrf' },
      { status: error.status, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
