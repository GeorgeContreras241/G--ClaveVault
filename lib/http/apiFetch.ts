const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  for (const part of document.cookie.split(';')) {
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

/**
 * Wrapper de `fetch` para la API de ClaveVault.
 *
 * Centraliza lo que toda llamada a la API necesita:
 * - envía `X-CSRF-Token` (doble cookie) en las peticiones que modifican
 *   estado, de modo que ninguna ruta olvide la protección;
 * - fija `Content-Type: application/json` cuando hay cuerpo JSON;
 * - añade `credentials: 'include'` para que viajen las cookies de sesión.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);

  if (MUTATING_METHODS.has(method)) {
    const token = readCookie(CSRF_COOKIE_NAME);
    if (token) {
      headers.set(CSRF_HEADER_NAME, token);
    }

    if (typeof init.body === 'string' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  return fetch(path, {
    credentials: 'include',
    ...init,
    method,
    headers,
  });
}
