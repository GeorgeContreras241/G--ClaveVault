import { getKv } from '@/server/redis/client';
import type { StoredChallenge } from './types';

/**
 * Resultado de una lectura.
 *
 * `corrupt` se distingue de `missing` para que el servicio pueda borrar la
 * clave inválida en lugar de dejarla ocupando sitio hasta que caduque.
 */
export type ChallengeLookup =
  | { status: 'missing' }
  | { status: 'corrupt' }
  | { status: 'found'; challenge: StoredChallenge };

/** Prefijo de las claves de reto en el almacén KV. */
const KEY_PREFIX = 'wvn:challenge:';

function keyFor(challengeId: string): string {
  return `${KEY_PREFIX}${challengeId}`;
}

/**
 * Persistencia de los retos WebAuthn en el almacén KV.
 *
 * La clave es un identificador aleatorio, no el email: así nadie puede
 * pisar el reto de otro usuario con una petición propia.
 */
export class ChallengeRepository {
  static async save(
    challengeId: string,
    challenge: StoredChallenge,
    ttlSeconds: number
  ): Promise<void> {
    await getKv().set(
      keyFor(challengeId),
      JSON.stringify(challenge),
      ttlSeconds
    );
  }

  static async findByChallengeId(
    challengeId: string
  ): Promise<ChallengeLookup> {
    const raw = await getKv().get(keyFor(challengeId));
    if (!raw) {
      return { status: 'missing' };
    }

    try {
      return {
        status: 'found',
        challenge: JSON.parse(raw) as StoredChallenge,
      };
    } catch {
      return { status: 'corrupt' };
    }
  }

  /** Devuelve el número de claves borradas (consumo único atómico). */
  static async delete(challengeId: string): Promise<number> {
    return getKv().del(keyFor(challengeId));
  }
}
