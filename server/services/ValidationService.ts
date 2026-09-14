type ValidationRule = {
  validate: (value: unknown) => boolean
  message: string
}

type ValidationSchema = Record<string, ValidationRule[]>

type ValidationResult =
  | { ok: true }
  | { ok: false; error: string; field: string }

export class ValidationService {
  static isValidBase64(str: string): boolean {
    try {
      const decoded = atob(str)
      return typeof decoded === 'string'
    } catch {
      return false
    }
  }

  static isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0
  }

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  }

  static validate(data: Record<string, unknown>, schema: ValidationSchema): ValidationResult {
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]

      for (const rule of rules) {
        if (!rule.validate(value)) {
          return { ok: false, error: rule.message, field }
        }
      }
    }
    return { ok: true }
  }

  static validateVaultPayload(body: {
    salt?: unknown
    iv?: unknown
    encryptedData?: unknown
  }): ValidationResult {
    const schema: ValidationSchema = {
      salt: [
        { validate: (v) => ValidationService.isNonEmptyString(v), message: "Salt es requerido" },
        { validate: (v) => ValidationService.isValidBase64(v as string), message: "Salt debe ser base64 válido" },
        {
          validate: (v) => {
            const bytes = Buffer.from(v as string, 'base64')
            return bytes.length === 16
          },
          message: "Salt debe ser 16 bytes"
        },
      ],
      iv: [
        { validate: (v) => ValidationService.isNonEmptyString(v), message: "IV es requerido" },
        { validate: (v) => ValidationService.isValidBase64(v as string), message: "IV debe ser base64 válido" },
      ],
      encryptedData: [
        { validate: (v) => ValidationService.isNonEmptyString(v), message: "Datos encriptados son requeridos" },
        { validate: (v) => ValidationService.isValidBase64(v as string), message: "Datos encriptados deben ser base64 válido" },
      ],
    }

    return ValidationService.validate(body, schema)
  }

  static validateEmail(email: unknown): ValidationResult {
    if (!ValidationService.isNonEmptyString(email)) {
      return { ok: false, error: "Email es requerido", field: "email" }
    }
    if (!ValidationService.isValidEmail(email)) {
      return { ok: false, error: "Email inválido", field: "email" }
    }
    return { ok: true }
  }

  static validatePassword(password: unknown): ValidationResult {
    if (!ValidationService.isNonEmptyString(password)) {
      return { ok: false, error: "Contraseña es requerida", field: "password" }
    }
    if (password.length < 4) {
      return { ok: false, error: "Contraseña debe tener al menos 4 caracteres", field: "password" }
    }
    if (password.length > 128) {
      return { ok: false, error: "Contraseña demasiado larga", field: "password" }
    }
    return { ok: true }
  }
}
