/**
 * Tipo de reto WebAuthn. Se guarda junto al valor para que un reto de
 * registro no pueda reutilizarse como reto de autenticación (ni al revés).
 */
export type ChallengeKind = 'registration' | 'authentication';

/** Reto tal y como se serializa en el almacén. */
export interface StoredChallenge {
  email: string;
  value: string;
  kind: ChallengeKind;
  createdAt: number;
}
