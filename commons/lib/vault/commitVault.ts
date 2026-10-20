import { encrypt } from '@/commons/lib/crypto/encryptData';
import { bytesToBase64 } from '@/commons/lib/encoding/base64';
import { apiFetch } from '@/commons/lib/apiFetch';
import type { PasswordEntry } from '@/features/vault-management';

export type CommitVaultResult =
  | { ok: true; version: number }
  | { ok: false; error: string };

/**
 * Cifra el vault completo y lo envía al servidor. Centraliza el flujo que
 * AddPassword, EditPassword y Manager replicaban (con los mismos bugs).
 */
export async function commitVaultOnline(params: {
  derivedKey: CryptoKey;
  salt: Uint8Array;
  entries: PasswordEntry[];
}): Promise<CommitVaultResult> {
  try {
    const encrypted = await encrypt(params.derivedKey, params.entries);
    const res = await apiFetch('/api/auth/me', {
      method: 'POST',
      body: JSON.stringify({
        salt: bytesToBase64(params.salt),
        iv: bytesToBase64(encrypted.iv),
        encryptedData: bytesToBase64(encrypted.data),
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok || !data?.version) {
      return {
        ok: false,
        error:
          (typeof data?.error === 'string' && data.error) ||
          `El servidor rechazó la operación (${res.status})`,
      };
    }

    return { ok: true, version: data.version };
  } catch {
    return { ok: false, error: 'No se pudo conectar con el servidor' };
  }
}
