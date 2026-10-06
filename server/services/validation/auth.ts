import { isNonEmptyString, isValidBase64Url, isValidEmail } from './core';
import type { Failure, ValidationResult } from './types';

// ── campos de formulario ──────────────────────────────────────────────

export function validateEmail(email: unknown): ValidationResult {
  if (!isNonEmptyString(email)) {
    return { ok: false, error: 'Email es requerido', field: 'email' };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Email inválido', field: 'email' };
  }
  return { ok: true };
}

export function validatePassword(password: unknown): ValidationResult {
  if (!isNonEmptyString(password)) {
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

export function validateChallengeId(challengeId: unknown): ValidationResult {
  if (typeof challengeId !== 'string' || challengeId.length === 0) {
    return {
      ok: false,
      error: 'Challenge id es requerido',
      field: 'challengeId',
    };
  }
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(challengeId)) {
    return { ok: false, error: 'Challenge id inválido', field: 'challengeId' };
  }
  return { ok: true };
}

// ── payloads de las rutas ─────────────────────────────────────────────

/** `POST /login/options` y `POST /register/options`. */
export function validateOptionsPayload(
  body: Record<string, unknown>
): ValidationResult {
  return validateEmail(body.email);
}

/** `POST /login/verify`: ya no se acepta `email`, sale del reto. */
export function validateLoginVerifyPayload(
  body: Record<string, unknown>
): ValidationResult {
  const challenge = validateChallengeId(body.challengeId);
  if (!challenge.ok) {
    return challenge;
  }

  return validateAuthenticationResponse(body.attResp);
}

/** `POST /register/verify`. */
export function validateRegisterVerifyPayload(
  body: Record<string, unknown>
): ValidationResult {
  const challenge = validateChallengeId(body.challengeId);
  if (!challenge.ok) {
    return challenge;
  }

  return validateRegistrationResponse(body.attResp);
}

// ── respuestas WebAuthn ───────────────────────────────────────────────

/**
 * `clientDataJSON` es un JSON codificado en base64url. Devuelve el tipo
 * de ceremonia (`webauthn.create` / `webauthn.get`) o `null` si no se
 * puede decodificar. Ese campo, y no `attResp.type`, es donde viaja el
 * tipo real: `attResp.type` es siempre `'public-key'` (WebAuthn L3).
 */
function clientDataType(
  clientDataJSON: unknown
): 'webauthn.create' | 'webauthn.get' | null {
  if (!isValidBase64Url(clientDataJSON)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(clientDataJSON, 'base64').toString('utf8')
    );
    if (parsed && typeof parsed === 'object') {
      const type = (parsed as { type?: unknown }).type;
      if (type === 'webauthn.create' || type === 'webauthn.get') {
        return type;
      }
    }
  } catch {
    // JSON roto: se trata como tipo desconocido.
  }
  return null;
}

/** Valida la envoltura común de toda respuesta JSON de WebAuthn. */
function validateCredentialEnvelope(
  attResp: unknown,
  label: string
): { ok: true; inner: Record<string, unknown> } | Failure {
  if (!attResp || typeof attResp !== 'object' || Array.isArray(attResp)) {
    return {
      ok: false,
      error: `Respuesta de ${label} inválida`,
      field: 'attResp',
    };
  }

  const response = attResp as Record<string, unknown>;

  if (response.type !== 'public-key') {
    return {
      ok: false,
      error: 'Tipo de respuesta incorrecto',
      field: 'attResp.type',
    };
  }

  for (const field of ['id', 'rawId'] as const) {
    if (!isValidBase64Url(response[field])) {
      return {
        ok: false,
        error: `Campo ${field} inválido`,
        field: `attResp.${field}`,
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

  const inner = response.response;
  if (!inner || typeof inner !== 'object' || Array.isArray(inner)) {
    return {
      ok: false,
      error: `Respuesta de ${label} inválida`,
      field: 'attResp.response',
    };
  }

  return { ok: true, inner: inner as Record<string, unknown> };
}

export function validateRegistrationResponse(
  attResp: unknown
): ValidationResult {
  const envelope = validateCredentialEnvelope(attResp, 'registro');
  if (!envelope.ok) {
    return envelope;
  }
  const payload = envelope.inner;

  for (const field of ['clientDataJSON', 'attestationObject'] as const) {
    if (!isValidBase64Url(payload[field])) {
      return {
        ok: false,
        error: `Campo ${field} inválido`,
        field: `attResp.response.${field}`,
      };
    }
  }

  if (clientDataType(payload.clientDataJSON) !== 'webauthn.create') {
    return {
      ok: false,
      error: 'Tipo de respuesta incorrecto',
      field: 'attResp.response.clientDataJSON',
    };
  }

  if (
    payload.authenticatorData !== undefined &&
    payload.authenticatorData !== null &&
    !isValidBase64Url(payload.authenticatorData)
  ) {
    return {
      ok: false,
      error: 'Campo authenticatorData inválido',
      field: 'attResp.response.authenticatorData',
    };
  }

  if (payload.transports !== undefined && payload.transports !== null) {
    const transports = payload.transports;
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
        field: 'attResp.response.transports',
      };
    }
  }

  return { ok: true };
}

export function validateAuthenticationResponse(
  attResp: unknown
): ValidationResult {
  const envelope = validateCredentialEnvelope(attResp, 'autenticación');
  if (!envelope.ok) {
    return envelope;
  }
  const payload = envelope.inner;

  for (const field of [
    'clientDataJSON',
    'authenticatorData',
    'signature',
  ] as const) {
    if (!isValidBase64Url(payload[field])) {
      return {
        ok: false,
        error: `Campo ${field} inválido`,
        field: `attResp.response.${field}`,
      };
    }
  }

  if (clientDataType(payload.clientDataJSON) !== 'webauthn.get') {
    return {
      ok: false,
      error: 'Tipo de respuesta incorrecto',
      field: 'attResp.response.clientDataJSON',
    };
  }

  if (
    payload.userHandle !== undefined &&
    payload.userHandle !== null &&
    !isValidBase64Url(payload.userHandle)
  ) {
    return {
      ok: false,
      error: 'Campo userHandle inválido',
      field: 'attResp.response.userHandle',
    };
  }

  return { ok: true };
}
