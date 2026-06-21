import { prisma } from '@/lib/db'
import { User } from '@/server/models'

// operacionees db prisma

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { email } })
    return record ? User.fromPrisma(record) : null
  }

  async findById(id: string): Promise<User | null> {
    const record = await prisma.user.findUnique({ where: { id } })
    return record ? User.fromPrisma(record) : null
  }

  async create(email: string): Promise<User> {
    const record = await prisma.user.create({ data: { email } })
    return User.fromPrisma(record)
  }

  async exists(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } })
    return count > 0
  }
}
