import type { SileoOptions } from 'sileo';

/**
 * Estilos comunes de todos los toasts.
 *
 * Se pasa a `<Toaster options={sileoDefaults} />`: sileo lo fusiona con cada
 * `sileo.*()`, pero el call site gana. Por eso los call sites no deben
 * declarar `fill` ni `styles`; de lo contrario pisan estos valores.
 */
export const sileoDefaults: Partial<SileoOptions> = {
  fill: 'black',
  styles: {
    title: 'text-green-400! font-semibold!',
    description: 'text-white! text-center!',
  },
};

/** Mensaje genérico reutilizado en la importación offline. */
export const sileoError = {
  title: 'Error',
  description: 'Error al procesar el archivo',
  duration: 5000,
  button: {
    onClick: () => {
      // callback requerido por la API de sileo
    },
    title: 'Aceptar',
  },
};
