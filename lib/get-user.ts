import { prisma } from '@/lib/db'
import { SessionService } from '@/server/services'

export async function getUser() {
  const session = await SessionService.validate()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  })
  return user
}
