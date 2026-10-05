import { cookies } from 'next/headers';
import type { CookieOptions, CookieJar } from "@/types/index";



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
