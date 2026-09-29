/**
 * Conversión bytes ⇄ base64 para el contrato de la API de bóveda.
 *
 * El servidor recibe y devuelve siempre base64 (ver `GET/POST
 * /api/auth/me`), así que aquí se centraliza esa codificación en lugar de
 * repetir `btoa`/`atob` repartidos por los componentes.
 */

const CHUNK_SIZE = 0x8000;

function bytesToBinary(bytes: Uint8Array | number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, i + CHUNK_SIZE) as ArrayLike<number>;
    out += String.fromCharCode.apply(
      null,
      Array.from(chunk, (byte) => byte & 0xff)
    );
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array | number[]): string {
  return btoa(bytesToBinary(bytes));
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
