/**
 * Error de dominio de las bóvedas.
 *
 * `handleRouteError` lo traduce a una respuesta HTTP con su código, igual
 * que hace `RegistrationError` con los errores de autenticación.
 */
export class VaultError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'VaultError';
  }
}
