type ValidationRule = {
  validate: (value: unknown) => boolean;
  message: string;
};

type ValidationSchema = Record<string, ValidationRule[]>;

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
const MAX_JSON_AUTH_BYTES = 64 * 1024;

/** Tamaño máximo del cuerpo JSON del bóveda cifrada. */
const MAX_JSON_VAULT_BYTES = 5 * 1024 * 1024;

/** Longitud máxima en caracteres de cada campo base64url de WebAuthn. */
const MAX_B64_URL_LENGTH = 16 * 1024;

const BASE64_URL_REGEX = /^[A-Za-z0-9_-]+={0,2}$/;

/**
 * Servicio central de validaciones de entrada del servidor.
 *
 * Toda ruta debe pasar por aquí en lugar de escribir sus propios `if`:
 * mantiene los mensajes, los códigos de estado y los límites en un único
 * sitio y garantiza que no haya una ruta "con suerte" que olvide validar.
 */
export class ValidationService {
  static readonly MAX_JSON_AUTH_BYTES = MAX_JSON_AUTH_BYTES;
  static readonly MAX_JSON_VAULT_BYTES = MAX_JSON_VAULT_BYTES;
  static readonly NO_STORE = NO_STORE;

  // ── primitivas ────────────────────────────────────────────────────────

  static isValidBase64(str: string): boolean {
    try {
      const decoded = atob(str);
      return typeof decoded === 'string';
    } catch {
      return false;
    }
  }

  /** base64url sin relleno, el formato que emite WebAuthn. */
  static isValidBase64Url(value: unknown): value is string {
    return (
      typeof value === 'string' &&
      value.length > 0 &&
      value.length <= MAX_B64_URL_LENGTH &&
      BASE64_URL_REGEX.test(value)
    );
  }

  static isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  static isValidEmail(email: string): boolean {
    if (email.length > 254) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  static validate(
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
  static toResponse(failure: Failure, status = 400): Response {
    return Response.json(
      { ok: false, error: failure.error, field: failure.field },
      { status, headers: NO_STORE }
    );
  }

  // ── lectura del cuerpo ────────────────────────────────────────────────

  private static failure(
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

  /**
   * Lee el cuerpo JSON acotado por tamaño y con `Content-Type` correcto.
   *
   * Se lee el stream por trozos para no llegar a alojar en memoria un body
   * enorme antes de rechazarlo (defensa contra DoS por cuerpo gigante).
   */
  static async readJson(
    request: Request,
    maxBytes: number = MAX_JSON_AUTH_BYTES
  ): Promise<JsonReadResult> {
    const contentType = request.headers.get('content-type');
    const mediaType = (contentType ?? '').split(';')[0].trim().toLowerCase();
    if (mediaType !== 'application/json') {
      return ValidationService.failure(
        'content-type',
        'Content-Type debe ser application/json',
        415
      );
    }

    const declared = Number(request.headers.get('content-length') ?? 0);
    if (Number.isFinite(declared) && declared > maxBytes) {
      return ValidationService.failure(
        'body',
        `Cuerpo demasiado grande (máximo ${maxBytes} bytes)`,
        413
      );
    }

    let text = '';
    const body = request.body;

    if (body) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let total = 0;

      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          total += value.byteLength;
          if (total > maxBytes) {
            await reader.cancel().catch(() => undefined);
            return ValidationService.failure(
              'body',
              `Cuerpo demasiado grande (máximo ${maxBytes} bytes)`,
              413
            );
          }
          text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
      } catch {
        return ValidationService.failure('body', 'No se pudo leer el cuerpo');
      }
    }

    if (text.trim().length === 0) {
      return ValidationService.failure('body', 'Cuerpo vacío');
    }

    try {
      const parsed: unknown = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return ValidationService.failure(
          'body',
          'El cuerpo debe ser un objeto JSON'
        );
      }
      return { ok: true, body: parsed as Record<string, unknown> };
    } catch {
      return ValidationService.failure('body', 'JSON inválido');
    }
  }

  // ── dominio: bóveda cifrada ───────────────────────────────────────────

  static validateVaultPayload(body: {
    salt?: unknown;
    iv?: unknown;
    encryptedData?: unknown;
  }): ValidationResult {
    const schema: ValidationSchema = {
      salt: [
        {
          validate: (v) => ValidationService.isNonEmptyString(v),
          message: 'Salt es requerido',
        },
        {
          validate: (v) => ValidationService.isValidBase64(v as string),
          message: 'Salt debe ser base64 válido',
        },
        {
          validate: (v) => Buffer.from(v as string, 'base64').length === 16,
          message: 'Salt debe ser 16 bytes',
        },
      ],
      iv: [
        {
          validate: (v) => ValidationService.isNonEmptyString(v),
          message: 'IV es requerido',
        },
        {
          validate: (v) => ValidationService.isValidBase64(v as string),
          message: 'IV debe ser base64 válido',
        },
        {
          // AES-GCM usa exactamente 12 bytes de IV: si el cliente envía
          // otra longitud, el descifrado posterior fallaría en silencio.
          validate: (v) => Buffer.from(v as string, 'base64').length === 12,
          message: 'IV debe decodificar exactamente a 12 bytes',
        },
      ],
      encryptedData: [
        {
          validate: (v) => ValidationService.isNonEmptyString(v),
          message: 'Datos encriptados son requeridos',
        },
        {
          validate: (v) => ValidationService.isValidBase64(v as string),
          message: 'Datos encriptados deben ser base64 válido',
        },
        {
          validate: (v) => {
            const bytes = Buffer.from(v as string, 'base64');
            return bytes.length > 0 && bytes.length <= MAX_JSON_VAULT_BYTES;
          },
          message: 'Datos encriptados fuera del tamaño permitido',
        },
      ],
    };

    return ValidationService.validate(body, schema);
  }

  // ── dominio: WebAuthn ─────────────────────────────────────────────────

  static validateEmail(email: unknown): ValidationResult {
    if (!ValidationService.isNonEmptyString(email)) {
      return { ok: false, error: 'Email es requerido', field: 'email' };
    }
    if (!ValidationService.isValidEmail(email)) {
      return { ok: false, error: 'Email inválido', field: 'email' };
    }
    return { ok: true };
  }

  static validatePassword(password: unknown): ValidationResult {
    if (!ValidationService.isNonEmptyString(password)) {
      return { ok: false, error: 'Contraseña es requerida', field: 'password' };
    }
    if (password.length < 8) {
      return {
        ok: false,
        error: 'Contraseña debe tener al menos 8 caracteres',
        field: 'password',
      };
    }
    if (password.length > 128) {
      return {
        ok: false,
        error: 'Contraseña demasiado larga',
        field: 'password',
      };
    }
    return { ok: true };
  }

  static validateChallengeId(challengeId: unknown): ValidationResult {
    if (typeof challengeId !== 'string' || challengeId.length === 0) {
      return {
        ok: false,
        error: 'Challenge id es requerido',
        field: 'challengeId',
      };
    }
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(challengeId)) {
      return {
        ok: false,
        error: 'Challenge id inválido',
        field: 'challengeId',
      };
    }
    return { ok: true };
  }

  static validateOptionsPayload(
    body: Record<string, unknown>
  ): ValidationResult {
    return ValidationService.validateEmail(body.email);
  }

  /** `POST /login/verify`: ya no se acepta `email`, sale del reto. */
  static validateLoginVerifyPayload(
    body: Record<string, unknown>
  ): ValidationResult {
    const challenge = ValidationService.validateChallengeId(body.challengeId);
    if (!challenge.ok) {
      return challenge;
    }

    return ValidationService.validateAuthenticationResponse(body.attResp);
  }

  /** `POST /register/verify`. */
  static validateRegisterVerifyPayload(
    body: Record<string, unknown>
  ): ValidationResult {
    const challenge = ValidationService.validateChallengeId(body.challengeId);
    if (!challenge.ok) {
      return challenge;
    }

    return ValidationService.validateRegistrationResponse(body.attResp);
  }

  static validateRegistrationResponse(attResp: unknown): ValidationResult {
    if (!attResp || typeof attResp !== 'object') {
      return {
        ok: false,
        error: 'Respuesta de registro inválida',
        field: 'attResp',
      };
    }

    const response = attResp as Record<string, unknown>;

    if (response.type !== 'webauthn.create') {
      return {
        ok: false,
        error: 'Tipo de respuesta incorrecto',
        field: 'attResp.type',
      };
    }

    for (const field of [
      'id',
      'rawId',
      'clientDataJSON',
      'authenticatorData',
      'attestationObject',
    ] as const) {
      if (!ValidationService.isValidBase64Url(response[field])) {
        return {
          ok: false,
          error: `Campo ${field} inválido`,
          field: `attResp.${field}`,
        };
      }
    }

    if (response.transports !== undefined) {
      const transports = response.transports;
      if (
        !Array.isArray(transports) ||
        transports.length > 8 ||
        transports.some(
          (item) => typeof item !== 'string' || !/^[a-z-]{1,40}$/.test(item)
        )
      ) {
        return {
          ok: false,
          error: 'Transports inválidos',
          field: 'attResp.transports',
        };
      }
    }

    if (response.rawId !== response.id) {
      return {
        ok: false,
        error: 'id y rawId no coinciden',
        field: 'attResp.rawId',
      };
    }

    return { ok: true };
  }

  static validateAuthenticationResponse(attResp: unknown): ValidationResult {
    if (!attResp || typeof attResp !== 'object') {
      return {
        ok: false,
        error: 'Respuesta de autenticación inválida',
        field: 'attResp',
      };
    }

    const response = attResp as Record<string, unknown>;

    if (response.type !== 'webauthn.get') {
      return {
        ok: false,
        error: 'Tipo de respuesta incorrecto',
        field: 'attResp.type',
      };
    }

    for (const field of [
      'id',
      'rawId',
      'clientDataJSON',
      'authenticatorData',
      'signature',
    ] as const) {
      if (!ValidationService.isValidBase64Url(response[field])) {
        return {
          ok: false,
          error: `Campo ${field} inválido`,
          field: `attResp.${field}`,
        };
      }
    }

    if (
      response.userHandle !== undefined &&
      response.userHandle !== null &&
      !ValidationService.isValidBase64Url(response.userHandle)
    ) {
      return {
        ok: false,
        error: 'Campo userHandle inválido',
        field: 'attResp.userHandle',
      };
    }

    if (response.rawId !== response.id) {
      return {
        ok: false,
        error: 'id y rawId no coinciden',
        field: 'attResp.rawId',
      };
    }

    return { ok: true };
  }
}
