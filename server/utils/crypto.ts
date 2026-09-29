const BASE64URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/**
 * Codifica bytes a base64url sin relleno (formato que usa WebAuthn).
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64URL_ALPHABET[b0 >> 2];
    out += BASE64URL_ALPHABET[((b0 & 0b11) << 4) | ((b1 ?? 0) >> 4)];
    if (b1 === undefined) {
      break;
    }
    out += BASE64URL_ALPHABET[((b1 & 0b1111) << 2) | ((b2 ?? 0) >> 6)];
    if (b2 === undefined) {
      break;
    }
    out += BASE64URL_ALPHABET[b2 & 0b111111];
  }
  return out;
}

/**
 * Genera un token aleatorio criptográficamente seguro en base64url.
 *
 * Se usa Web Crypto (no `node:crypto`) para que funcione igual en el
 * runtime de las Route Handlers y en el de `proxy.ts`.
 */
export function randomToken(bytes = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return bytesToBase64Url(buffer);
}

/**
 * Huella SHA-256 en hex. Solo se persiste el hash de los tokens:
 * si Redis se vacía o alguien lee la base, no obtiene cookies vivas.
 */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Comparación en tiempo constante. Evita que un atacante distinga
 * el token correcto carácter a carácter por las diferencias de latencia.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);

  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < left.length; i++) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}
