import type { DecryptResult, VaultCipherPayload } from '@/types';
import type { PasswordEntry } from '@/features/vault-management';

/**
 * Normaliza una entrada descifrada. Un `.enc` es un archivo externo: no se
 * puede confiar en que tenga la forma exacta que genera la app. Se exigen
 * los campos imprescindibles y se rellenan los opcionales con valores
 * seguros para que un archivo manipulado no rompa el render.
 */
function normalizeEntry(value: unknown): PasswordEntry | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const entry = value as Record<string, unknown>;

  if (
    typeof entry.id !== 'string' ||
    typeof entry.title !== 'string' ||
    typeof entry.username !== 'string' ||
    typeof entry.password !== 'string'
  ) {
    return null;
  }

  return {
    id: entry.id,
    title: entry.title,
    username: entry.username,
    password: entry.password,
    url: typeof entry.url === 'string' ? entry.url : '',
    category:
      typeof entry.category === 'string' && entry.category
        ? entry.category
        : 'web',
    favorite: entry.favorite === true,
  };
}

export const decrypt = async (
  key: CryptoKey,
  payload: VaultCipherPayload
): Promise<DecryptResult> => {
  try {
    if (
      !key ||
      !payload?.iv ||
      !payload?.data ||
      payload.iv.length !== 12 ||
      payload.data.length === 0
    ) {
      return {
        status: false,
        message: {
          title: 'Error al descifrar los datos',
          description: 'Key inválida',
          duration: 5000,
          fill: 'var(--color-bg-elevated)',
        },
      };
    }

    const iv = new Uint8Array(payload.iv);
    const data = new Uint8Array(payload.data);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    const decoded = new TextDecoder().decode(decrypted);

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(decoded);
    } catch {
      throw new Error('JSON inválido');
    }

    if (!Array.isArray(parsedData)) {
      throw new Error('Formato de bóveda inválido');
    }

    const entries = parsedData.map(normalizeEntry);
    if (entries.some((entry) => entry === null)) {
      throw new Error('Formato de bóveda inválido');
    }

    return {
      status: true,
      data: entries as PasswordEntry[],
    };
  } catch (error: unknown) {
    const description =
      error instanceof Error ? error.message : 'Datos incorrectos';

    return {
      status: false,
      message: {
        title: 'Error al descifrar los datos',
        description,
        duration: 5000,
        fill: 'var(--color-bg-elevated)',
        styles: {
          title: 'text-red! font-semibold!',
          description: 'text-white! text-center!',
        },
      },
    };
  }
};
