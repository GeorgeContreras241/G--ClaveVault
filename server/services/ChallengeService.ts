import { webauthnConfig } from '@/server/config';
import { getKv } from '@/server/redis/client';
import { randomToken } from '@/server/utils/crypto';

/**
 * Tipo de reto WebAuthn. Se guarda junto al valor para que un reto de
 * registro no pueda reutilizarse como reto de autenticación (ni al revés).
 */
export type ChallengeKind = 'registration' | 'authentication';

export interface StoredChallenge {
  email: string;
  value: string;
  kind: ChallengeKind;
  createdAt: number;
}

/** Vida útil del reto en segundos (sale de `webauthnConfig.challengeTTL`). */
const CHALLENGE_TTL_SECONDS = Math.max(
  60,
  Math.floor(webauthnConfig.challengeTTL / 1000)
);

const KEY_PREFIX = 'wvn:challenge:';

function keyFor(challengeId: string): string {
  return `${KEY_PREFIX}${challengeId}`;
}

/**
 * Retos WebAuthn en Redis en lugar de un `Map` en memoria.
 *
 * Cambios respecto a la versión anterior:
 * - Se indexan por un identificador aleatorio de 128 bits, no por email,
 *   así nadie puede pisar el reto de otro usuario con una petición propia.
 * - La clave lleva TTL, así que no se acumulan retos caducados.
 * - El `kind` impide mezclar registro con autenticación.
 * - El email sale del reto, no del cuerpo de la petición de verificación.
 */
export class ChallengeService {
  static async create(
    email: string,
    value: string,
    kind: ChallengeKind
  ): Promise<string> {
    const challengeId = randomToken(16);
    const stored: StoredChallenge = {
      email,
      value,
      kind,
      createdAt: Date.now(),
    };

    await getKv().set(
      keyFor(challengeId),
      JSON.stringify(stored),
      CHALLENGE_TTL_SECONDS
    );

    return challengeId;
  }

  /**
   * Lee y consume el reto (uso único).
   *
   * Se lee, se valida y luego se borra: solo quien obtiene `1` en el borrado
   * continúa, de modo que dos peticiones simultáneas no pueden reutilizar el
   * mismo reto.
   */
  static async consume(
    challengeId: string,
    kind: ChallengeKind
  ): Promise<StoredChallenge | null> {
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(challengeId)) {
      return null;
    }

    const kv = getKv();
    const raw = await kv.get(keyFor(challengeId));
    if (!raw) {
      return null;
    }

    let stored: StoredChallenge;
    try {
      stored = JSON.parse(raw) as StoredChallenge;
    } catch {
      await kv.del(keyFor(challengeId));
      return null;
    }

    if (stored.kind !== kind) {
      return null;
    }

    if (Date.now() - stored.createdAt > CHALLENGE_TTL_SECONDS * 1000) {
      await kv.del(keyFor(challengeId));
      return null;
    }

    const deleted = await kv.del(keyFor(challengeId));
    if (deleted === 0) {
      return null;
    }

    return stored;
  }
}
