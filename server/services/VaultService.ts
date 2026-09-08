import { prisma } from '@/lib/db'

export class VaultService {
    static async findByUserId(userId: string) {
        const vault = await prisma.vault.findUnique({
            where: { userId },
            select: {
                salt: true,
                iv: true,
                encryptedData: true,
                version: true,
                updatedAt: true,
            }
        })
        return vault
    }

    static async upsert(userId: string, salt: Uint8Array, iv: Uint8Array, encryptedData: Uint8Array, version: number = 1) {
        return prisma.vault.upsert({
            where: { userId },
            update: { salt: Buffer.from(salt), iv: Buffer.from(iv), encryptedData: Buffer.from(encryptedData), version },
            create: { userId, salt: Buffer.from(salt), iv: Buffer.from(iv), encryptedData: Buffer.from(encryptedData), version },
        })
    }
}
