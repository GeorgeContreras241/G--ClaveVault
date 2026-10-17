import { prisma } from '@/commons/lib/db';
import { SessionService } from '@/server/features/session/SessionService';

export async function getUser() {
  const session = await SessionService.validate();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  return user;
}
