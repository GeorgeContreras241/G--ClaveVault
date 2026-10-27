import { encrypt } from '@/commons/lib/crypto/encryptData';
import { updateVault } from '@/commons/lib/vault/vaultsApi';
import type { PasswordEntry } from '@/features/vault-management';

export type CommitVaultResult =
  | { ok: true; version: number }
  | { ok: false; error: string; conflict: boolean };

/**
 * Cifra la bóveda activa completa y la envía al servidor.
 *
 * `expectedVersion` es la versión que el cliente leyó al desbloquear: si
 * otra pestaña guardó antes, el servidor responde 409 y no se sobrescribe
 * nada. Centraliza el flujo que AddPassword, EditPassword y Manager
 * replicaban.
 */
export async function commitVaultOnline(params: {
  vaultId: string;
  expectedVersion: number;
  derivedKey: CryptoKey;
  salt: Uint8Array;
  entries: PasswordEntry[];
}): Promise<CommitVaultResult> {
  try {
    const encrypted = await encrypt(params.derivedKey, params.entries);

    const result = await updateVault(params.vaultId, {
      salt: params.salt,
      iv: new Uint8Array(encrypted.iv),
      encryptedData: new Uint8Array(encrypted.data),
      version: params.expectedVersion,
    });

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
        conflict: result.conflict,
      };
    }

    return { ok: true, version: result.version };
  } catch {
    return {
      ok: false,
      error: 'No se pudo conectar con el servidor',
      conflict: false,
    };
  }
}
