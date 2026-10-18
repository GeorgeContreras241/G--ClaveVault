export type GeneratePasswordOptions = {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
};

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;

export const generatePassword = (
  options: GeneratePasswordOptions
): string | null => {
  const {
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  } = options;

  let charset = '';
  if (includeLowercase) {
    charset += 'abcdefghijklmnopqrstuvwxyz';
  }
  if (includeUppercase) {
    charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  if (includeNumbers) {
    charset += '0123456789';
  }
  if (includeSymbols) {
    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (charset === '') {
    return null;
  }

  const safeLength = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, length));
  const values = new Uint32Array(safeLength);
  crypto.getRandomValues(values);

  let password = '';
  for (let i = 0; i < safeLength; i++) {
    password += charset.charAt(values[i] % charset.length);
  }

  return password;
};
