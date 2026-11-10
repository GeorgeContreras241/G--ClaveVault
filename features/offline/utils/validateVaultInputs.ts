import { alerts } from '@/commons/constants/alerts';

export const validateVaultInputs = (password: string) => {
  if (!password) {
    return alerts.passwordRequired;
  }
  return true;
};
