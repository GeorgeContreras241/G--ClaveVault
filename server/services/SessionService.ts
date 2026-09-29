import { nextCookieJar } from '@/server/utils/cookies';
import { randomToken, sha256Hex } from '@/server/utils/crypto';
import { getKv } from '@/server/redis/client';
import type { CookieJar } from '@/server/utils/cookies';

export const SESSION_COOKIE_NAME = 'session_token';

/** Tiempo de inactividad antes de cerrar la sesión (30 minutos). */
const SESSION_TIMEOUT_SECONDS = 30 * 60;

const KEY_PREFIX = 'session:';

function keyFor(hash: string): string {
  return `${KEY_PREFIX}${hash}`;
}

async function jarOr(jar?: CookieJar): Promise<CookieJar> {
  return jar ?? (await nextCookieJar());
}

/**
 * Sesiones en Redis con token de 256 bits del que solo se persiste el hash.
 *
 * - Cookie `httpOnly` + `SameSite=Lax` + `Secure` en producción.
 * - La clave de Redis es `sha256(token)`: volcar Redis no permite
 *   reconstruir cookies válidas.
 * - TTL = inactividad de 30 min y se renueva al validar, así que las
 *   sesiones caducadas desaparecen solas sin limpieza de tablas.
 * - Se elimina el uso de la tabla `sessions` de Prisma (puede borrarse
 *   con `prisma migrate` en una siguiente pasada).
 */
export class SessionService {
  static async create(userId: string, jar?: CookieJar): Promise<string> {
    const store = await jarOr(jar);

    const token = randomToken(32);
    const hash = await sha256Hex(token);

    await getKv().set(
      keyFor(hash),
      JSON.stringify({ userId, createdAt: Date.now() }),
      SESSION_TIMEOUT_SECONDS
    );

    store.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TIMEOUT_SECONDS,
    });

    return token;
  }

  /** Devuelve la sesión activa o `null`. Renueva el tiempo de inactividad. */
  static async validate(jar?: CookieJar): Promise<{ userId: string } | null> {
    const store = await jarOr(jar);
    const token = store.get(SESSION_COOKIE_NAME);
    if (!token) {
      return null;
    }

    const hash = await sha256Hex(token);
    const raw = await getKv().get(keyFor(hash));
    if (!raw) {
      return null;
    }

    let payload: { userId?: string };
    try {
      payload = JSON.parse(raw) as { userId?: string };
    } catch {
      await getKv().del(keyFor(hash));
      return null;
    }

    if (!payload.userId) {
      await getKv().del(keyFor(hash));
      return null;
    }

    // Deslizante: mientras haya actividad la sesión sigue viva.
    await getKv().expire(keyFor(hash), SESSION_TIMEOUT_SECONDS);

    return { userId: payload.userId };
  }

  static async destroy(jar?: CookieJar): Promise<void> {
    const store = await jarOr(jar);
    const token = store.get(SESSION_COOKIE_NAME);
    if (token) {
      const hash = await sha256Hex(token);
      await getKv().del(keyFor(hash));
    }

    store.delete(SESSION_COOKIE_NAME);
  }
}
