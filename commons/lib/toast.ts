'use client';

/**
 * Fachada diferida de `sileo`.
 *
 * `sileo` arrastra `motion/react`, que pesa más que el resto del shell. Al
 * importarlo de forma estática desde el layout raíz, ese peso acababa en el
 * chunk compartido de **todas** las rutas (incluido el 404).
 *
 * Aquí el módulo se carga la primera vez que se muestra una notificación y
 * se avisa a `AppProviders` (vía `TOAST_EVENT`) para que monte el `<Toaster>`
 * solo en ese momento. Así una visita que nunca genera avisos no descarga
 * `sileo` ni `motion`.
 *
 * `sileo` guarda la cola de toasts en un store de módulo y `<Toaster>` la
 * inicializa al montarse, de modo que un aviso emitido antes de que exista
 * el contenedor se pinta igualmente cuando aparece.
 */

type ToastOptions = Parameters<typeof import('sileo').sileo.success>[0];

/** Evento que pide a `AppProviders` montar el contenedor de notificaciones. */
export const TOAST_EVENT = 'clavevault:toast';

let modulePromise: Promise<typeof import('sileo')> | null = null;

function load(): Promise<typeof import('sileo')> {
  modulePromise ??= import('sileo');
  return modulePromise;
}

function emit(
  method: 'success' | 'error' | 'warning' | 'info',
  options: ToastOptions
): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(TOAST_EVENT));
  }

  void load().then(({ sileo }) => sileo[method](options));
}

export const toast = {
  success: (options: ToastOptions) => emit('success', options),
  error: (options: ToastOptions) => emit('error', options),
  warning: (options: ToastOptions) => emit('warning', options),
  info: (options: ToastOptions) => emit('info', options),
  clear: () => {
    // Si nunca se mostró un aviso no hay contenedor que limpiar.
    if (!modulePromise) {
      return;
    }
    void modulePromise.then(({ sileo }) => sileo.clear());
  },
};
