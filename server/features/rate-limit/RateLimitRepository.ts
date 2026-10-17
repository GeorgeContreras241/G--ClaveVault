import { getKv } from '@/server/redis/client';

/** Prefijo compartido por todos los contadores (facilita un `SCAN` manual). */
const KEY_PREFIX = 'rl:';

function keyFor(key: string): string {
  return `${KEY_PREFIX}${key}`;
}

/**
 * Persistencia de los contadores de rate limiting en el almacén KV.
 *
 * No decide nada: solo expone `INCR`, `EXPIRE` y `TTL`. La política de
 * límites y ventanas vive en el servicio.
 */
export class RateLimitRepository {
  /** Devuelve el valor del contador tras incrementarlo. */
  static async increment(key: string): Promise<number> {
    return getKv().incr(keyFor(key));
  }

  /** Establece la ventana de tiempo. Devuelve 1 si se aplicó, 0 si no había clave. */
  static async expire(key: string, ttlSeconds: number): Promise<number> {
    return getKv().expire(keyFor(key), ttlSeconds);
  }

  /** Segundos restantes de ventana; negativo si la clave no existe o no caduca. */
  static async ttl(key: string): Promise<number> {
    return getKv().ttl(keyFor(key));
  }
}
