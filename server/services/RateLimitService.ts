import { getKv } from '@/server/redis/client';

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  /** Segundos que debe esperar el cliente antes de reintentar. */
  retryAfter: number;
}

/** Prefijo compartido por todos los contadores (facilita un `SCAN` manual). */
const KEY_PREFIX = 'rl:';

export class RateLimitService {
  /**
   * Incrementa el contador de `key` y decide si la petición pasa.
   *
   * `INCR` + `EXPIRE` solo cuando el contador nace es suficiente y evita
   * dos idas y vueltas en el caso normal.
   */
  static async hit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<RateLimitDecision> {
    const kv = getKv();
    const scopedKey = `${KEY_PREFIX}${key}`;

    const count = await kv.incr(scopedKey);
    if (count === 1) {
      await kv.expire(scopedKey, windowSeconds);
    }

    if (count > limit) {
      const remainingTtl = await kv.ttl(scopedKey);
      return {
        allowed: false,
        remaining: 0,
        retryAfter:
          remainingTtl > 0 ? remainingTtl : Math.max(1, windowSeconds),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - count),
      retryAfter: 0,
    };
  }

  /** Respuesta 429 con la cabecera `Retry-After` que exige la RFC. */
  static toResponse(decision: RateLimitDecision): Response {
    return Response.json(
      {
        ok: false,
        error: 'Demasiados intentos. Vuelve a probar en unos segundos.',
        field: 'rate_limit',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(decision.retryAfter),
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
