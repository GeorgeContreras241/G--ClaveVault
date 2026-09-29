import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/server/services';
import { CsrfService, CSRF_COOKIE_NAME } from '@/server/services/CsrfService';
import { readOnlyJar } from '@/server/utils/cookies';

/** Zona privada: requiere sesión válida. */
function isProtected(pathname: string): boolean {
  return pathname === '/passwords' || pathname.startsWith('/passwords/');
}

/**
 * Capa transversal de seguridad.
 *
 * 1. **Origen**: toda petición que modifica estado (POST/PUT/PATCH/DELETE)
 *    debe venir del propio dominio. Se aplica a `app/` y a `app/api/`, es
 *    decir, tanto a la navegación como a los endpoints.
 * 2. **Sesión**: la zona privada redirige a `/online` si no hay sesión.
 * 3. **Cookie CSRF**: si el cliente aún no tiene `csrf_token`, se emite aquí
 *    para que pueda leerla y devolverla en `X-CSRF-Token`.
 */
export async function proxy(request: NextRequest) {
  if (CsrfService.isMutating(request.method)) {
    try {
      CsrfService.assertOrigin(request.headers);
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Origen no permitido', field: 'origin' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  if (isProtected(request.nextUrl.pathname)) {
    const session = await SessionService.validate(
      readOnlyJar((name) => request.cookies.get(name)?.value)
    );

    if (!session) {
      return NextResponse.redirect(new URL('/online', request.url));
    }
  }

  const response = NextResponse.next();

  CsrfService.ensureForResponse(
    request.cookies.get(CSRF_COOKIE_NAME)?.value,
    (value, options) => {
      response.cookies.set(CSRF_COOKIE_NAME, value, options);
    }
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|video/|robots.txt|sitemap.xml).*)',
  ],
};
