import {
  BASE64_URL_REGEX,
  MAX_B64_URL_LENGTH,
  NO_STORE,
  type Failure,
  type JsonReadResult,
  type ValidationResult,
  type ValidationSchema,
} from './types';

// ── primitivas: piezas reutilizables ──────────────────────────────────

export function isValidBase64(str: string): boolean {
  try {
    const decoded = atob(str);
    return typeof decoded === 'string';
  } catch {
    return false;
  }
}

/** base64url sin relleno, el formato que emite WebAuthn. */
export function isValidBase64Url(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_B64_URL_LENGTH &&
    BASE64_URL_REGEX.test(value)
  );
}

export function isValidUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function isValidEmail(email: string): boolean {
  if (email.length > 254) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// ── motor ─────────────────────────────────────────────────────────────

/** Recorre campo por campo y regla por regla. Para en el primer error. */
export function validate(
  data: Record<string, unknown>,
  schema: ValidationSchema
): ValidationResult {
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    for (const rule of rules) {
      if (!rule.validate(value)) {
        return { ok: false, error: rule.message, field };
      }
    }
  }
  return { ok: true };
}

/** Convierte un fallo en la respuesta HTTP estándar de la API. */
export function toResponse(failure: Failure, status = 400): Response {
  return Response.json(
    { ok: false, error: failure.error, field: failure.field },
    { status, headers: NO_STORE }
  );
}

/** Fallo de lectura de cuerpo: ya trae su `Response` montada. */
export function readFailure(
  field: string,
  error: string,
  status = 400
): JsonReadResult {
  return {
    ok: false,
    response: Response.json(
      { ok: false, error, field },
      { status, headers: NO_STORE }
    ),
  };
}
