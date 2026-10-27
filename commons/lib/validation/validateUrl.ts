/**
 * Validación de URLs de entradas de la bóveda.
 *
 * `new URL()` por sí solo acepta esquemas peligrosos como `javascript:` o
 * `data:`. Como el valor se usa en un `href`, hay que limitarlo a http/https
 * para que un `.enc` manipulado no pueda ejecutar código en la app.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/** Devuelve el mensaje de error, o `null` si la URL es válida o está vacía. */
export function validateUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return 'URL inválida';
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return 'Solo se permiten URLs http o https';
  }

  return null;
}

/** `true` solo para URLs http/https no vacías. */
export function isSafeHttpUrl(
  value: string | null | undefined
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    validateUrl(value) === null
  );
}
