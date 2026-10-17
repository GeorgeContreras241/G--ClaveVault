import { isNonEmptyString, isValidBase64, validate } from './core';
import {
  MAX_JSON_VAULT_BYTES,
  type ValidationResult,
  type ValidationSchema,
} from './types';

/** Longitudes que exigen la crypto: PBKDF2 (16) y AES-GCM (12). */
const SALT_BYTES = 16;
const IV_BYTES = 12;

export function validateVaultPayload(body: {
  salt?: unknown;
  iv?: unknown;
  encryptedData?: unknown;
}): ValidationResult {
  const schema: ValidationSchema = {
    salt: [
      {
        validate: (v) => isNonEmptyString(v),
        message: 'Salt es requerido',
      },
      {
        validate: (v) => isValidBase64(v as string),
        message: 'Salt debe ser base64 válido',
      },
      {
        validate: (v) =>
          Buffer.from(v as string, 'base64').length === SALT_BYTES,
        message: `Salt debe ser ${SALT_BYTES} bytes`,
      },
    ],
    iv: [
      {
        validate: (v) => isNonEmptyString(v),
        message: 'IV es requerido',
      },
      {
        validate: (v) => isValidBase64(v as string),
        message: 'IV debe ser base64 válido',
      },
      {
        // AES-GCM usa exactamente 12 bytes de IV: si el cliente envía
        // otra longitud, el descifrado posterior fallaría en silencio.
        validate: (v) => Buffer.from(v as string, 'base64').length === IV_BYTES,
        message: `IV debe decodificar exactamente a ${IV_BYTES} bytes`,
      },
    ],
    encryptedData: [
      {
        validate: (v) => isNonEmptyString(v),
        message: 'Datos encriptados son requeridos',
      },
      {
        validate: (v) => isValidBase64(v as string),
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

  return validate(body, schema);
}
