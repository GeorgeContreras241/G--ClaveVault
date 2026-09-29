import type { EncryptResult, PasswordEntry } from '@/types';

export const encrypt = async (
  key: CryptoKey,
  data: PasswordEntry[]
): Promise<EncryptResult> => {
  if (!crypto?.subtle) {
    throw new Error('Web Crypto API no soportada');
  }

  if (!key) {
    throw new Error('La key es requerida');
  }

  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encodedData = new TextEncoder().encode(JSON.stringify(data));

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedData
    );

    const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));

    return {
      iv: Array.from(iv),
      data: encryptedArray,
    };
  } catch (error) {
    console.error('Error encryptando datos:', error);
    throw new Error('No se pudieron encryptar los datos');
  }
};
