import { prisma } from '@/lib/db'
import { WebAuthnCredential } from '@/server/models'

// operacionees db prisma

export class CredentialRepository {
  async findByUserId(userId: string): Promise<WebAuthnCredential[]> {
    const records = await prisma.webAuthnCredential.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return records.map(record => WebAuthnCredential.fromPrisma(record))
  }

  async findByCredentialId(credentialId: string): Promise<WebAuthnCredential | null> {
    const record = await prisma.webAuthnCredential.findUnique({
      where: { credentialId }
    })
    return record ? WebAuthnCredential.fromPrisma(record) : null
  }

  async save(credential: WebAuthnCredential): Promise<void> {
    await prisma.webAuthnCredential.create({
      data: {
        userId: credential.userId,
        credentialId: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
      }
    })
  }

  async updateCounter(credentialId: string, counter: number): Promise<void> {
    await prisma.webAuthnCredential.update({
      where: { credentialId },
      data: { counter: BigInt(counter) }
    })
  }

  async delete(credentialId: string): Promise<void> {
    await prisma.webAuthnCredential.delete({
      where: { credentialId }
    })
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.webAuthnCredential.count({ where: { userId } })
  }
}
