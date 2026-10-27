import { prisma } from '@/commons/lib/db';

/**
 * Acceso a datos de las bóvedas cifradas.
 *
 * Solo persiste: no decide nada sobre el contenido ni sobre quién puede
 * leerlo. Todas las búsquedas incluyen `userId` para que una bóveda ajena
 * sea indistinguible de una inexistente.
 */
const SUMMARY_SELECT = {
  id: true,
  name: true,
  version: true,
  createdAt: true,
  updatedAt: true,
} as const;

const FULL_SELECT = {
  ...SUMMARY_SELECT,
  salt: true,
  iv: true,
  encryptedData: true,
} as const;

export class VaultRepository {
  static async listByUserId(userId: string) {
    return prisma.vault.findMany({
      where: { userId },
      select: SUMMARY_SELECT,
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async findByIdAndUserId(id: string, userId: string) {
    return prisma.vault.findFirst({
      where: { id, userId },
      select: FULL_SELECT,
    });
  }

  static async create(
    userId: string,
    name: string,
    salt: Uint8Array,
    iv: Uint8Array,
    encryptedData: Uint8Array
  ) {
    return prisma.vault.create({
      data: {
        userId,
        name,
        salt: Buffer.from(salt),
        iv: Buffer.from(iv),
        encryptedData: Buffer.from(encryptedData),
      },
      select: SUMMARY_SELECT,
    });
  }

  /**
   * Actualiza solo si la versión esperada coincide. Devuelve cuántas filas
   * cambió: `0` significa que no existe, no es del usuario o hay conflicto.
   */
  static async updateWithVersion(
    id: string,
    userId: string,
    expectedVersion: number,
    salt: Uint8Array,
    iv: Uint8Array,
    encryptedData: Uint8Array
  ) {
    return prisma.vault.updateMany({
      where: { id, userId, version: expectedVersion },
      data: {
        salt: Buffer.from(salt),
        iv: Buffer.from(iv),
        encryptedData: Buffer.from(encryptedData),
        version: { increment: 1 },
      },
    });
  }

  static async deleteByIdAndUserId(id: string, userId: string) {
    return prisma.vault.deleteMany({ where: { id, userId } });
  }

  static async countByUserId(userId: string) {
    return prisma.vault.count({ where: { userId } });
  }

  static async existsByUserIdAndName(userId: string, name: string) {
    const count = await prisma.vault.count({ where: { userId, name } });
    return count > 0;
  }
}
