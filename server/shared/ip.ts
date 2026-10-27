import { isIP } from 'node:net';

/**
 * Extrae la IP del cliente detrás del proxy.
 *
 * No se usa el primer valor de `x-forwarded-for`: un cliente puede enviar
 * esa cabecera con una IP arbitraria y el proxy la añade al final. Tomamos
 * el último valor válido, que es el que añade el proxy de confianza más
 * cercano. Si no hay proxy (o no reescribe la cabecera), el rate limiting
 * sigue siendo best-effort: nunca debe ser la única defensa.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const candidates = forwarded
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && isIP(part) !== 0);

    if (candidates.length > 0) {
      // `TRUSTED_PROXY_HOPS` = número de proxies propios que añaden su IP.
      // Por defecto 1 (el caso habitual: un edge/proxy delante de la app).
      const configuredHops = Number(process.env.TRUSTED_PROXY_HOPS ?? '1');
      const hops =
        Number.isInteger(configuredHops) && configuredHops > 0
          ? configuredHops
          : 1;
      const index = Math.max(0, candidates.length - hops);
      return candidates[index];
    }
  }

  const real = request.headers.get('x-real-ip')?.trim();
  if (real && isIP(real) !== 0) {
    return real;
  }

  return 'unknown';
}
