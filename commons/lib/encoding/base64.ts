/**
 * Conversión bytes ⇄ base64 para el contrato de la API de bóveda.
 *
 * El servidor recibe y devuelve siempre base64 (ver `POST /api/vaults` y
 * `GET /api/vaults/[id]`), así que aquí se centraliza esa codificación en
 * lugar de repetir `btoa`/`atob` repartidos por los componentes.
 */

const CHUNK_SIZE = 0x8000;

function bytesToBinary(bytes: Uint8Array | number[]): string {
  const view = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
  const parts: string[] = [];

  // `apply` acepta un array tipado como array-like: evita materializar un
  // `number[]` nuevo por cada bloque.
  for (let i = 0; i < view.length; i += CHUNK_SIZE) {
    parts.push(
      String.fromCharCode.apply(
        null,
        view.subarray(i, i + CHUNK_SIZE) as unknown as number[]
      )
    );
  }

  return parts.join('');
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
