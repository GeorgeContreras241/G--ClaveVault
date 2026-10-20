type LoadVaultParams = {
  file: File;
};

type LoadVaultResult =
  | { state: true; salt: Uint8Array; iv: Uint8Array; data: Uint8Array }
  | { state: false; error: unknown };

/** salt(16) + iv(12) + tag GCM(16) como mínimo. */
const MIN_VAULT_FILE_BYTES = 16 + 12 + 16;

export const loadVault = async ({
  file,
}: LoadVaultParams): Promise<LoadVaultResult> => {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(fileArrayBuffer);

    if (fileBuffer.length < MIN_VAULT_FILE_BYTES) {
      return {
        state: false,
        error: new Error('El archivo es demasiado pequeño para ser una bóveda'),
      };
    }

    const salt = fileBuffer.slice(0, 16);
    const iv = fileBuffer.slice(16, 28);
    const data = fileBuffer.slice(28);

    return { state: true, salt, iv, data };
  } catch (error) {
    return { state: false, error };
  }
};
