import {
  validateAuthenticationResponse,
  validateChallengeId,
  validateEmail,
  validateLoginVerifyPayload,
  validateOptionsPayload,
  validatePassword,
  validateRegistrationResponse,
  validateRegisterVerifyPayload,
} from './auth';
import {
  isInRange,
  isNonEmptyString,
  isValidBase64,
  isValidBase64Url,
  isValidEmail,
  isValidUUID,
  toResponse,
  validate,
} from './core';
import { readJson } from './readJson';
import {
  MAX_JSON_AUTH_BYTES,
  MAX_JSON_VAULT_BYTES,
  NO_STORE,
  type Failure,
  type JsonReadResult,
  type ValidationResult,
  type ValidationSchema,
} from './types';
import { validateVaultPayload } from './vault';

/**
 * Servicio central de validaciones de entrada del servidor.
 *
 * Toda ruta debe pasar por aquí en lugar de escribir sus propios `if`:
 * mantiene los mensajes, los códigos de estado y los límites en un único
 * sitio y garantiza que no haya una ruta "con suerte" que olvide validar.
 *
 * La implementación vive repartida en este directorio, una pieza por archivo:
 *
 *   types.ts     tipos y constantes
 *   core.ts      primitivas + motor de reglas
 *   readJson.ts  lectura segura del cuerpo
 *   vault.ts     bóveda cifrada
 *   auth.ts      emails, contraseñas y respuestas WebAuthn
 */
export class ValidationService {
  static readonly MAX_JSON_AUTH_BYTES = MAX_JSON_AUTH_BYTES;
  static readonly MAX_JSON_VAULT_BYTES = MAX_JSON_VAULT_BYTES;
  static readonly NO_STORE = NO_STORE;

  // ── primitivas ──────────────────────────────────────────────────────

  static isValidBase64(str: string): boolean {
    return isValidBase64(str);
  }

  static isValidBase64Url(value: unknown): value is string {
    return isValidBase64Url(value);
  }

  static isValidUUID(str: string): boolean {
    return isValidUUID(str);
  }

  static isValidEmail(email: string): boolean {
    return isValidEmail(email);
  }

  static isNonEmptyString(value: unknown): value is string {
    return isNonEmptyString(value);
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return isInRange(value, min, max);
  }

  // ── motor ───────────────────────────────────────────────────────────

  static validate(
    data: Record<string, unknown>,
    schema: ValidationSchema
  ): ValidationResult {
    return validate(data, schema);
  }

  /** Convierte un fallo en la respuesta HTTP estándar de la API. */
  static toResponse(failure: Failure, status = 400): Response {
    return toResponse(failure, status);
  }

  // ── lectura del cuerpo ──────────────────────────────────────────────

  static readJson(
    request: Request,
    maxBytes: number = MAX_JSON_AUTH_BYTES
  ): Promise<JsonReadResult> {
    return readJson(request, maxBytes);
  }

  // ── dominio ─────────────────────────────────────────────────────────

  static validateVaultPayload = validateVaultPayload;
  static validateEmail = validateEmail;
  static validatePassword = validatePassword;
  static validateChallengeId = validateChallengeId;
  static validateOptionsPayload = validateOptionsPayload;
  static validateLoginVerifyPayload = validateLoginVerifyPayload;
  static validateRegisterVerifyPayload = validateRegisterVerifyPayload;
  static validateRegistrationResponse = validateRegistrationResponse;
  static validateAuthenticationResponse = validateAuthenticationResponse;
}
