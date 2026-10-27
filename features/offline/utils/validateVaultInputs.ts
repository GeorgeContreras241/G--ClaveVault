export const validateVaultInputs = (password: string) => {
  if (!password) {
    return {
      title: 'Error Fatal',
      description: 'La contraseña es requerida',
      duration: 5000,
      fill: 'var(--color-bg-elevated)',
      styles: {
        title: 'text-red! font-semibold!',
        description: 'text-white! text-center!',
      },
    };
  }
  return true;
};
