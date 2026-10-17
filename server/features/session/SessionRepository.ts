import { getKv } from '@/server/redis/client';

/** Sesión tal y como se serializa en el almacén. */
export interface StoredSession {
  userId: string;
  createdAt: number;
}

/**
 * Resultado de una lectura.
 *
 * `corrupt` se distingue de `missing` para que el servicio pueda borrar la
 * clave inválida en lugar de dejarla ocupando sitio hasta que caduque.
 */
export type SessionLookup =
  | { status: 'missing' }
  | { status: 'corrupt' }
  | { status: 'found'; session: StoredSession };

/** Prefijo de las claves de sesión en el almacén KV. */
const KEY_PREFIX = 'session:';

function keyFor(hash: string): string {
  return `${KEY_PREFIX}${hash}`;
}

/**
 * Persistencia de las sesiones en el almacén KV.
 *
 * La clave es siempre el hash del token: el token en claro nunca llega
 * aquí, así que volcar el almacén no permite reconstruir cookies vivas.
 */
export class SessionRepository {
  static async save(
    hash: string,
    session: StoredSession,
    ttlSeconds: number
  ): Promise<void> {
    await getKv().set(keyFor(hash), JSON.stringify(session), ttlSeconds);
  }

  static async findByHash(hash: string): Promise<SessionLookup> {
    const raw = await getKv().get(keyFor(hash));
    if (!raw) {
      return { status: 'missing' };
    }

    try {
      return { status: 'found', session: JSON.parse(raw) as StoredSession };
    } catch {
      return { status: 'corrupt' };
    }
  }

  /** Devuelve el número de claves borradas. */
  static async delete(hash: string): Promise<number> {
    return getKv().del(keyFor(hash));
  }

  /** Renueva el tiempo de inactividad restante. */
  static async touch(hash: string, ttlSeconds: number): Promise<void> {
    await getKv().expire(keyFor(hash), ttlSeconds);
  }
}
