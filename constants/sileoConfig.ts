export const sileoError = {
  title: 'Error',
  description: 'Error al procesar el archivo',
  duration: 5000,
  fill: 'var(--color-bg-elevated)',
  styles: {
    title: 'text-red! font-bold!',
    description: 'text-white! text-center!',
  },
  button: {
    onClick: () => {
      // callback requerido por la API de sileo
    },
    title: 'Aceptar',
  },
};
