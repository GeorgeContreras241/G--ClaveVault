import { SessionService } from '@/server/features/session/SessionService';
import { UserRepository } from '@/server/features/auth/UserRepository';
import { fail, handleRouteError, ok } from '@/server/http';

const userRepo = new UserRepository();

/**
 * Identidad del usuario autenticado.
 *
 * La lectura/escritura de bóvedas vive en `/api/vaults` y
 * `/api/vaults/[id]`; esta ruta ya no expone material cifrado.
 */
export const GET = async () => {
  try {
    const session = await SessionService.validate();
    if (!session) {
      return fail('No autenticado', 401);
    }

    const user = await userRepo.findById(session.userId);
    if (!user) {
      return fail('Usuario no encontrado', 404);
    }

    return ok({ user: user.toJSON() });
  } catch (error) {
    return handleRouteError(error, 'Error al obtener el usuario');
  }
};
