/**
 * Extrae la IP real del cliente detrás del proxy/load balancer.
 *
 * `x-forwarded-for` puede traer una lista (cliente, proxy, proxy...);
 * nos quedamos con la primera, que es la del origen.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const real = request.headers.get('x-real-ip');
  if (real) {
    return real.trim();
  }

  return 'unknown';
}
