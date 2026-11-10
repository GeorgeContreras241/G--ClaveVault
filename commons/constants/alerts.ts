import type { SileoOptions } from 'sileo';
import type { ToastMessage } from '@/types';

/**
 * Catálogo único de alertas de sileo.
 *
 * Reglas:
 * - Los textos viven aquí; los componentes no escriben `title`/`description`.
 * - `alerts.*` son mensajes fijos: `sileo.success(alerts.copyFailed)`.
 * - Las funciones son mensajes que dependen de datos (nombres, errores,
 *   callbacks de botones) y devuelven un `SileoOptions`.
 * - No se define `fill` ni `styles`: los colores por estado y el tema los
 *   aplica `<Toaster theme="dark" />` en `AppProviders.tsx`.
 */

const CONFLICT_TITLE = 'La bóveda cambió en otra sesión';
const CONFLICT_HINT = 'Vuelve a abrir la bóveda para sincronizarla.';

export const alerts = {
  // --- Portapapeles ---
  copyFailed: { title: 'Error al copiar al portapapeles' },

  // --- Generación de contraseñas ---
  selectCharType: { title: 'Selecciona al menos un tipo de carácter' },
  passwordGenerated: {
    title: 'Se ha generado una nueva contraseña.',
    duration: 600,
  },

  // --- Alta / edición de contraseñas ---
  passwordAdded: { title: 'Contraseña agregada correctamente.', duration: 600 },
  passwordSaved: { title: 'Cambios guardados correctamente.', duration: 600 },
  passwordDeleted: { title: 'Contraseña eliminada.', duration: 5000 },
  vaultLockedAdd: {
    title: 'No se pudo guardar la contraseña',
    description: 'La bóveda no está desbloqueada. Vuelve a abrirla.',
    duration: 5000,
  },
  vaultLockedEdit: {
    title: 'No se pudieron guardar los cambios',
    description: 'La bóveda no está desbloqueada. Vuelve a abrirla.',
    duration: 5000,
  },
  vaultLockedServer: {
    title: 'No se pudo guardar en el servidor',
    description: 'La bóveda no está desbloqueada. Vuelve a abrirla.',
    duration: 5000,
  },

  // --- Autenticación ---
  registerCompleted: {
    title: 'Registro completado',
    description: 'Bienvenido a ClaveVault.',
    duration: 1500,
  },
  registerSuccess: {
    title: 'Registro exitoso',
    description: 'Ya puedes acceder con tu huella o llave.',
    duration: 4000,
  },
  onlineUnavailable: {
    title: 'Modo online aún no disponible',
    description:
      'Estamos trabajando en ello. Próximamente podrás acceder desde cualquier dispositivo.',
    duration: 4000,
  },

  // --- Bóvedas ---
  vaultCreated: {
    title: 'Bóveda creada.',
    description: 'Ya puedes empezar a guardar contraseñas.',
    duration: 1500,
  },
  localVaultError: { title: 'Error al crear la bóveda local' },
  decryptError: { title: 'Error al descifrar el archivo' },
  passwordRequired: {
    title: 'Error Fatal',
    description: 'La contraseña es requerida',
    duration: 5000,
  },

  // --- Exportar ---
  exportKeyError: {
    title: 'Error al exportar los datos',
    description: 'No se pudo derivar la clave',
    duration: 5000,
  },
  exportSaltError: {
    title: 'Error al exportar',
    description: 'Salt no disponible',
    duration: 5000,
  },
  encryptError: {
    title: 'Error al encriptar',
    description: 'No se pudo encriptar los datos',
    duration: 5000,
  },
  exportFormatError: {
    title: 'Error al exportar',
    description: 'La bóveda tiene un formato inválido',
    duration: 5000,
  },
  exportFileError: {
    title: 'Error al exportar los datos',
    description: 'No se pudo generar el archivo',
    duration: 5000,
  },
  exportSuccess: { title: 'Bóveda exportada correctamente.', duration: 1000 },

  // --- Importar ---
  importReadError: {
    title: 'Error al cargar',
    description: 'No se pudo leer el archivo',
    duration: 5000,
  },
  importInvalidFormat: {
    title: 'Archivo inválido',
    description: 'El archivo no tiene el formato de bóveda esperado',
    duration: 5000,
  },
  importDeriveError: { title: 'Error al derivar la clave', duration: 5000 },
  importProcessError: { title: 'Error al procesar el archivo', duration: 5000 },

  // --- Genérico ---
  genericError: {
    title: 'Error',
    description: 'Error al procesar el archivo',
    duration: 5000,
    button: { title: 'Aceptar', onClick: () => {} },
  },
} satisfies Record<string, SileoOptions>;

/** Éxito de copiado: el título cambia según qué se copió. */
export const copiedToClipboard = (title: string): SileoOptions => ({
  title,
  duration: 600,
});

/** Error de guardado que distingue conflicto de versión. */
export const saveFailed = ({
  conflict,
  fallbackTitle,
  error,
  conflictHint = true,
}: {
  conflict: boolean;
  fallbackTitle: string;
  error?: string;
  /** Añade el texto de sincronización cuando hay conflicto. */
  conflictHint?: boolean;
}): SileoOptions => ({
  title: conflict ? CONFLICT_TITLE : fallbackTitle,
  description: conflict && conflictHint ? CONFLICT_HINT : error,
  duration: 5000,
});

/** Confirmación para borrar una contraseña. */
export const confirmDeletePassword = (
  onConfirm: () => void,
  entryTitle?: string
): SileoOptions => ({
  title: 'Eliminar contraseña',
  description: entryTitle
    ? `Se eliminará "${entryTitle}". Esta acción no se puede deshacer.`
    : 'Esta acción no se puede deshacer.',
  duration: 8000,
  button: { title: 'Eliminar', onClick: onConfirm },
});

/** Confirmación para crear una bóveda vacía sin archivo. */
export const confirmEmptyVault = (onConfirm: () => void): SileoOptions => ({
  title: 'Confirmar',
  description: '¿Continuar sin archivo? Se creará una bóveda vacía.',
  duration: 8000,
  button: { title: 'Aceptar', onClick: onConfirm },
});

/** Error de validación cuyo texto viene del validador. */
export const validationError = (message: string): SileoOptions => ({
  title: message,
});

/** Bóveda eliminada; incluye el nombre. */
export const vaultDeleted = (name: string): SileoOptions => ({
  title: 'Bóveda eliminada.',
  description: `«${name}» se borró correctamente.`,
  duration: 2000,
});

/** Fallo al descifrar; el detalle viene del error de criptografía. */
export const decryptFailed = (description?: string): ToastMessage => ({
  title: 'Error al descifrar los datos',
  description,
  duration: 5000,
});
