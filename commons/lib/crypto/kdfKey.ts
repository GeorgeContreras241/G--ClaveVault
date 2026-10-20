export const deriveKey = async (password: string, salt: Uint8Array) => {
  const enc = new TextEncoder();
  const saltArray = new Uint8Array(salt);
  // NFC evita claves distintas para la misma contraseña según el SO
  // (macOS produce NFD en el teclado, Windows NFC).
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password.normalize('NFC')),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltArray,
      iterations: 200000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return key;
};
