export const validateVaultInputs = (password: string) => {
  if (!password) {
    return {
      title: 'Error Fatal',
      description: 'La contraseña es requerida',
      duration: 5000,
    };
  }
  return true;
};
