import type { DecryptResult, PasswordEntry, VaultCipherPayload } from '@/types';

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

    return {
      status: true,
      data: parsedData as PasswordEntry[],
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
          title: 'text-red! font-bold!',
          description: 'text-white! text-center!',
        },
      },
    };
  }
};
