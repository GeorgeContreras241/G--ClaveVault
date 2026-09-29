import { SessionService } from '@/server/services';
import { CsrfError, CsrfService } from '@/server/services/CsrfService';
import { handleRouteError, ok } from '@/server/http';

export async function POST(request: Request) {
  try {
    // Cierra sesión solo quien demuestra ser el dueño de la cookie y del
    // token CSRF; el `Origin` ya lo comprueba `proxy.ts` para todo POST.
    CsrfService.assertToken(request.headers);

    await SessionService.destroy();

    return ok();
  } catch (error) {
    if (error instanceof CsrfError) {
      return CsrfService.toResponse(error);
    }
    return handleRouteError(error, 'Error al cerrar sesión');
  }
}
