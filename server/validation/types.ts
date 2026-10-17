export type ValidationRule = {
  validate: (value: unknown) => boolean;
  message: string;
};

export type ValidationSchema = Record<string, ValidationRule[]>;

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string; field: string };

export type Failure = Extract<ValidationResult, { ok: false }>;

export type JsonReadResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: Response };

/** Ninguna respuesta de la API debe quedar cacheada por proxies o CDN. */
export const NO_STORE = { 'Cache-Control': 'no-store' } as const;

/** Tamaño máximo de los cuerpos JSON de autenticación (retos WebAuthn). */
export const MAX_JSON_AUTH_BYTES = 64 * 1024;

/** Tamaño máximo del cuerpo JSON de la bóveda cifrada. */
export const MAX_JSON_VAULT_BYTES = 5 * 1024 * 1024;

/** Longitud máxima en caracteres de cada campo base64url de WebAuthn. */
export const MAX_B64_URL_LENGTH = 16 * 1024;

export const BASE64_URL_REGEX = /^[A-Za-z0-9_-]+={0,2}$/;
