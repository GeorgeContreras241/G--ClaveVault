import { cookies } from 'next/headers';

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  maxAge?: number;
};

/**
 * Abstracción mínima de cookies para que los servicios (SessionService,
 * CsrfService) funcionen igual dentro de una Route Handler (usa
 * `next/headers`) y dentro de `proxy.ts` (usa request/response de Next).
 */
export interface CookieJar {
  get(name: string): string | undefined;
  set(name: string, value: string, options?: CookieOptions): void;
  delete(name: string): void;
}

/**
 * Jarra para Route Handlers y Server Components.
 */
export async function nextCookieJar(): Promise<CookieJar> {
  const store = await cookies();
  return {
    get: (name) => store.get(name)?.value,
    set: (name, value, options) => store.set(name, value, options),
    delete: (name) => store.delete(name),
  };
}

/**
 * Solo lectura: sirve para mirar los cookies que llegan en la petición
 * (middleware) sin tocar la respuesta.
 */
export function readOnlyJar(
  read: (name: string) => string | undefined
): CookieJar {
  return {
    get: read,
    set: () => {
      throw new Error('CookieJar de solo lectura');
    },
    delete: () => {
      throw new Error('CookieJar de solo lectura');
    },
  };
}
