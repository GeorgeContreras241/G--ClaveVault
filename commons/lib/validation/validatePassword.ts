/**
 * Validación de la master key / contraseña en el cliente.
 *
 * La misma función se usa en dos contextos distintos, por eso separa las reglas:
 *
 * - **Estructurales** (bloquean siempre): tipo de dato, longitud 8–128
 *   caracteres, sin caracteres de control y que no sea solo espacios. Es lo
 *   único que se exige al desbloquear un vault o importar un `.enc`, para no
 *   dejar fuera a nadie cuya clave ya existe.
 * - **De calidad** (avisos; errores con `strict`): longitud cómoda, variedad de
 *   caracteres (o passphrase de 20+ caracteres), secuencias (`abcd`, `1234`) y
 *   contraseñas muy comunes. Solo se bloquean al crear una clave nueva.
 *
 * Devuelve además `score` (0–4) y `strength` para pintar un indicador de
 * fuerza mientras el usuario escribe.
 */

/** Longitud mínima aceptada, contada en code points. */
export const MIN_PASSWORD_LENGTH = 8;
/** Longitud máxima aceptada para no disparar el coste del KDF. */
export const MAX_PASSWORD_LENGTH = 128;

/** Longitud a partir de la que se considera cómoda de recordar y de atacar. */
const SOFT_MIN_LENGTH = 12;
/** Longitud a partir de la que la longitud por sí sola aporta fuerza. */
const STRONG_LENGTH = 16;
/** Longitud mínima de una passphrase de palabras para prescindir de símbolos. */
const PASSPHRASE_LENGTH = 20;

/** `\u0000`–`\u001f` (controles) y `\u007f` (supr). */
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const EDGE_SPACES = /^\s|\s$/;

/** Contraseñas más frecuentes en filtraciones (comparadas en minúsculas). */
const COMMON_PASSWORDS = new Set([
  '123456',
  '12345678',
  '123456789',
  'password',
  'contrasena',
  'qwerty',
  'qwerty123',
  'iloveyou',
  'letmein',
  'admin',
  'monkey',
  'dragon',
  'welcome',
  'abc123',
  '111111',
  '000000',
  'master',
  'clave',
]);

const STRENGTH_LABELS: PasswordStrength[] = [
  'muy débil',
  'débil',
  'regular',
  'fuerte',
  'muy fuerte',
];

export type PasswordStrength =
  | 'muy débil'
  | 'débil'
  | 'regular'
  | 'fuerte'
  | 'muy fuerte';

export type PasswordValidation = {
  /** `true` cuando la contraseña pasa todas las reglas aplicadas. */
  success: boolean;
  /** Primer error, listo para mostrar un único mensaje en la UI. */
  error?: string;
  /** Todos los errores que impiden aceptar la contraseña. */
  errors: string[];
  /** Avisos de calidad que no impiden aceptar la contraseña. */
  warnings: string[];
  /** Fuerza estimada: 0 (muy débil) a 4 (muy fuerte). */
  score: number;
  /** Etiqueta legible correspondiente a `score`. */
  strength: PasswordStrength;
};

export type ValidatePasswordOptions = {
  /**
   * Convierte los avisos de calidad en errores. Solo al crear una clave nueva:
   * aplicado al desbloqueo, dejaría fuera a quien su clave actual no cumple.
   */
  strict?: boolean;
};

/** Quita tildes para clasificar `á`, `ñ`, `ü`… como letras. */
const stripAccents = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Cuenta las clases presentes: minúsculas, mayúsculas, dígitos, símbolos y
 * espacios (los espacios cuentan porque separan las palabras de una passphrase).
 */
const countCharacterClasses = (value: string): number => {
  const plain = stripAccents(value);
  let classes = 0;

  if (/[a-z]/.test(plain)) {
    classes += 1;
  }
  if (/[A-Z]/.test(plain)) {
    classes += 1;
  }
  if (/[0-9]/.test(plain)) {
    classes += 1;
  }
  if (/\s/.test(plain)) {
    classes += 1;
  }
  if (/[^a-zA-Z0-9\s]/.test(plain)) {
    classes += 1;
  }

  return classes;
};

/** Detecta 4 caracteres seguidos: `abcd`, `9876`, `wxyz`… */
const hasSequence = (value: string): boolean => {
  let ascending = 1;
  let descending = 1;

  for (let i = 1; i < value.length; i += 1) {
    const diff = value.charCodeAt(i) - value.charCodeAt(i - 1);
    ascending = diff === 1 ? ascending + 1 : 1;
    descending = diff === -1 ? descending + 1 : 1;

    if (ascending >= 4 || descending >= 4) {
      return true;
    }
  }

  return false;
};

/**
 * Valida la contraseña y analiza su fuerza.
 *
 * @param password Cadena a validar (recibe `unknown` para tolerar entradas de
 *   formularios, p. ej. `formData.get()` sin castear).
 * @param options `strict: true` exige también las reglas de calidad.
 */
export const validatePassword = (
  password: unknown,
  options: ValidatePasswordOptions = {}
): PasswordValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const buildResult = (score: number): PasswordValidation => ({
    success: errors.length === 0,
    error: errors[0],
    errors,
    warnings,
    score,
    strength: STRENGTH_LABELS[score],
  });

  if (typeof password !== 'string' || password.length === 0) {
    errors.push('La contraseña es requerida');
    return buildResult(0);
  }

  const length = [...password].length;

  // ── reglas estructurales: bloquean siempre ──────────────────────────
  if (length < MIN_PASSWORD_LENGTH) {
    errors.push(`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`);
  }
  if (length > MAX_PASSWORD_LENGTH) {
    errors.push(`Máximo ${MAX_PASSWORD_LENGTH} caracteres`);
  }
  if (CONTROL_CHARACTERS.test(password)) {
    errors.push('No se permiten caracteres de control');
  }
  if (password.trim().length === 0) {
    errors.push('La contraseña no puede ser solo espacios');
  }

  // ── reglas de calidad: avisos, o errores en modo strict ─────────────
  const classes = countCharacterClasses(password);
  const sequence = hasSequence(password);
  const common = COMMON_PASSWORDS.has(password.trim().toLowerCase());
  // Una passphrase larga no necesita mayúsculas ni símbolos: sus palabras y
  // separadores ya aportan entropía (p. ej. correct-horse-battery-staple).
  const isPassphrase = length >= PASSPHRASE_LENGTH && classes >= 2;
  const qualityIssues: string[] = [];

  if (EDGE_SPACES.test(password)) {
    qualityIssues.push('Tiene espacios al principio o al final');
  }
  if (length < SOFT_MIN_LENGTH) {
    qualityIssues.push(`Usa al menos ${SOFT_MIN_LENGTH} caracteres`);
  }
  if (classes < 3 && !isPassphrase) {
    qualityIssues.push('Combina mayúsculas, minúsculas, números y símbolos');
  }
  if (sequence) {
    qualityIssues.push('Evita secuencias como abcd o 1234');
  }
  if (common) {
    qualityIssues.push('Es una de las contraseñas más usadas del mundo');
  }

  if (options.strict === true) {
    errors.push(...qualityIssues);
  } else {
    warnings.push(...qualityIssues);
  }

  // ── score 0–4 ───────────────────────────────────────────────────────
  let score = 0;
  if (length >= SOFT_MIN_LENGTH) {
    score += 1;
  }
  if (length >= STRONG_LENGTH) {
    score += 1;
  }
  if (classes >= 3) {
    score += 1;
  }
  if (classes >= 4) {
    score += 1;
  }
  if (!sequence && !common) {
    score += 1;
  }

  return buildResult(Math.min(score, 4));
};
