import { webauthnConfig } from '@/server/config';
import { randomToken } from '@/server/shared/crypto';
import { ChallengeRepository } from './ChallengeRepository';
import type { ChallengeKind, StoredChallenge } from './types';

export type { ChallengeKind, StoredChallenge } from './types';

/** Vida útil del reto en segundos (sale de `webauthnConfig.challengeTTL`). */
const CHALLENGE_TTL_SECONDS = Math.max(
  60,
  Math.floor(webauthnConfig.challengeTTL / 1000)
);

/**
 * Casos de uso de los retos WebAuthn.
 *
 * No toca el almacén directamente: delega en {@link ChallengeRepository}.
 * El servicio decide el identificador, valida el `kind` y aplica la
 * política de caducidad y de uso único.
 */
export class ChallengeService {
  static async create(
    email: string,
    value: string,
    kind: ChallengeKind
  ): Promise<string> {
    const challengeId = randomToken(16);

    await ChallengeRepository.save(
      challengeId,
      { email, value, kind, createdAt: Date.now() },
      CHALLENGE_TTL_SECONDS
    );

    return challengeId;
  }

  /**
   * Lee y consume el reto (uso único).
   *
   * Se lee, se valida y luego se borra: solo quien obtiene `1` en el borrado
   * continúa, de modo que dos peticiones simultáneas no pueden reutilizar
   * el mismo reto.
   */
  static async consume(
    challengeId: string,
    kind: ChallengeKind
  ): Promise<StoredChallenge | null> {
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(challengeId)) {
      return null;
    }

    const lookup = await ChallengeRepository.findByChallengeId(challengeId);
    if (lookup.status === 'missing') {
      return null;
    }

    if (lookup.status === 'corrupt') {
      await ChallengeRepository.delete(challengeId);
      return null;
    }

    const stored = lookup.challenge;

    if (stored.kind !== kind) {
      return null;
    }

    if (Date.now() - stored.createdAt > CHALLENGE_TTL_SECONDS * 1000) {
      await ChallengeRepository.delete(challengeId);
      return null;
    }

    const deleted = await ChallengeRepository.delete(challengeId);
    if (deleted === 0) {
      return null;
    }

    return stored;
  }
}
