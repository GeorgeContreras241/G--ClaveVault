import { nextCookieJar } from '@/server/shared/cookies';
import { randomToken, sha256Hex } from '@/server/shared/crypto';
import { SessionRepository } from './SessionRepository';
import type { CookieJar } from '@/types/index';

export const SESSION_COOKIE_NAME = 'session_token';

/** Tiempo de inactividad antes de cerrar la sesión (30 minutos). */
const SESSION_TIMEOUT_SECONDS = 30 * 60;

async function jarOr(jar?: CookieJar): Promise<CookieJar> {
  return jar ?? (await nextCookieJar());
}

/**
 * Sesiones con token de 256 bits del que solo se persiste el hash.
 *
 * - Cookie `httpOnly` + `SameSite=Lax` + `Secure` en producción.
 * - La clave de persistencia es `sha256(token)`: volcar el almacén no
 *   permite reconstruir cookies válidas.
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

    await SessionRepository.save(
      hash,
      { userId, createdAt: Date.now() },
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
    const lookup = await SessionRepository.findByHash(hash);

    if (lookup.status === 'missing') {
      return null;
    }

    if (lookup.status === 'corrupt' || !lookup.session.userId) {
      await SessionRepository.delete(hash);
      return null;
    }

    // Deslizante: mientras haya actividad la sesión sigue viva.
    await SessionRepository.touch(hash, SESSION_TIMEOUT_SECONDS);

    return { userId: lookup.session.userId };
  }

  static async destroy(jar?: CookieJar): Promise<void> {
    const store = await jarOr(jar);
    const token = store.get(SESSION_COOKIE_NAME);
    if (token) {
      const hash = await sha256Hex(token);
      await SessionRepository.delete(hash);
    }

    store.delete(SESSION_COOKIE_NAME);
  }
}
