import { prisma } from '@/commons/lib/db';

/**
 * Acceso a datos de la bóveda cifrada.
 *
 * Solo persiste: no decide nada sobre el contenido ni sobre quién puede
 * leerlo. Los bytes llegan ya como `Uint8Array` y aquí se convierten al
 * formato que espera Prisma.
 */
export class VaultRepository {
  static async findByUserId(userId: string) {
    return prisma.vault.findUnique({
      where: { userId },
      select: {
        salt: true,
        iv: true,
        encryptedData: true,
        version: true,
        updatedAt: true,
      },
    });
  }

  static async upsert(
    userId: string,
    salt: Uint8Array,
    iv: Uint8Array,
    encryptedData: Uint8Array,
    version: number
  ) {
    return prisma.vault.upsert({
      where: { userId },
      update: {
        salt: Buffer.from(salt),
        iv: Buffer.from(iv),
        encryptedData: Buffer.from(encryptedData),
        version,
      },
      create: {
        userId,
        salt: Buffer.from(salt),
        iv: Buffer.from(iv),
        encryptedData: Buffer.from(encryptedData),
        version,
      },
    });
  }
}
