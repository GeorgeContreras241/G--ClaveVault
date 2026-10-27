/**
 * Diagnóstico del entorno antes de llamar a la API WebAuthn.
 *
 * WebAuthn solo funciona en contextos seguros y con un RP ID que sea un
 * dominio: las direcciones IP (`127.0.0.1`, `[::1]`) no son válidas. Sin
 * esta comprobación, `navigator.credentials` falla con un `SecurityError`
 * que en la UI se percibe como "el botón no hace nada".
 */

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
const IPV6 = /^\[[0-9a-f:.]+\]$/i;

export function isIpHostname(hostname: string): boolean {
  return IPV4.test(hostname) || IPV6.test(hostname);
}

/** Devuelve un mensaje accionable si el entorno no puede usar WebAuthn. */
export function getWebAuthnEnvironmentError(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!window.isSecureContext) {
    return 'WebAuthn necesita un contexto seguro (HTTPS). En local, abre la app en http://localhost:3000.';
  }

  if (isIpHostname(window.location.hostname)) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `WebAuthn no admite direcciones IP como "${window.location.hostname}". Abre la app en http://localhost${port}.`;
  }

  if (typeof window.PublicKeyCredential === 'undefined') {
    return 'Este navegador no soporta WebAuthn. Usa Chrome o Edge.';
  }

  return null;
}

/** Traduce los errores habituales de WebAuthn a texto accionable. */
export function describeWebAuthnError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'No se pudo completar la operación WebAuthn.';
  }

  if (error.name === 'SecurityError') {
    return 'El dominio actual no es válido para WebAuthn. Abre la app en http://localhost:3000 (no en 127.0.0.1).';
  }

  if (error.name === 'NotAllowedError') {
    return 'No hay un autenticador válido o se canceló la operación. En DevTools → WebAuthn crea un autenticador virtual con "Supports user verification" activado.';
  }

  return error.message || 'No se pudo completar la operación WebAuthn.';
}
