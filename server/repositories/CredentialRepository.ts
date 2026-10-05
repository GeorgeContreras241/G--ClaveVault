import { prisma } from '@/lib/db';
import { WebAuthnCredential } from '@/server/models';

// operacionees db prisma

export class CredentialRepository {

  async findByUserId(userId: string): Promise<WebAuthnCredential[]> {
    const records = await prisma.webAuthnCredential.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    // revisar el typo de record
    return records.map((record: any) => WebAuthnCredential.fromPrisma(record));
  }

  async findByCredentialId(
    credentialId: string
  ): Promise<WebAuthnCredential | null> {
    const record = await prisma.webAuthnCredential.findUnique({
      where: { credentialId },
    });
    return record ? WebAuthnCredential.fromPrisma(record) : null;
  }

  async findByUserIdAndCredentialId(
    userId: string,
    credentialId: string
  ): Promise<WebAuthnCredential | null> {
    const record = await prisma.webAuthnCredential.findFirst({
      where: { userId, credentialId },
    });
    return record ? WebAuthnCredential.fromPrisma(record) : null;
  }

  async save(credential: WebAuthnCredential): Promise<void> {
    await prisma.webAuthnCredential.create({
      data: {
        userId: credential.userId,
        credentialId: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
        transports: credential.transports ?? null,
      },
    });
  }

  async updateCounter(credentialId: string, counter: number): Promise<void> {
    await prisma.webAuthnCredential.update({
      where: { credentialId },
      data: { counter: BigInt(counter) },
    });
  }

  async delete(credentialId: string): Promise<void> {
    await prisma.webAuthnCredential.delete({
      where: { credentialId },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.webAuthnCredential.count({ where: { userId } });
  }
}
