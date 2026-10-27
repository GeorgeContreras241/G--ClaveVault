import { isNonEmptyString, isValidBase64, validate } from './core';
import {
  MAX_JSON_VAULT_BYTES,
  type ValidationResult,
  type ValidationSchema,
} from './types';

/** Longitudes que exigen la crypto: PBKDF2 (16) y AES-GCM (12). */
const SALT_BYTES = 16;
const IV_BYTES = 12;

/** Longitud máxima del nombre visible de una bóveda. */
export const MAX_VAULT_NAME_LENGTH = 80;

/** Controles ASCII y DEL: no aportan nada a un nombre visible. */
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export function validateVaultName(value: unknown): ValidationResult {
  return validate(
    { name: value },
    {
      name: [
        {
          validate: (v) => isNonEmptyString(v),
          message: 'El nombre de la bóveda es requerido',
        },
        {
          validate: (v) => !CONTROL_CHARACTERS.test((v as string).trim()),
          message: 'El nombre contiene caracteres inválidos',
        },
        {
          validate: (v) => (v as string).trim().length <= MAX_VAULT_NAME_LENGTH,
          message: `El nombre no puede superar ${MAX_VAULT_NAME_LENGTH} caracteres`,
        },
      ],
    }
  );
}

export function validateCreateVaultPayload(body: {
  name?: unknown;
  salt?: unknown;
  iv?: unknown;
  encryptedData?: unknown;
}): ValidationResult {
  const name = validateVaultName(body.name);
  if (!name.ok) {
    return name;
  }

  return validateVaultPayload(body);
}

export function validateUpdateVaultPayload(body: {
  salt?: unknown;
  iv?: unknown;
  encryptedData?: unknown;
  version?: unknown;
}): ValidationResult {
  const payload = validateVaultPayload(body);
  if (!payload.ok) {
    return payload;
  }

  return validate(
    { version: body.version },
    {
      version: [
        {
          validate: (v) =>
            typeof v === 'number' && Number.isInteger(v) && v >= 1,
          message: 'La versión debe ser un entero positivo',
        },
      ],
    }
  );
}

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
