export class WebAuthnCredential {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly credentialId: string,
    public readonly publicKey: Uint8Array,
    public readonly counter: number,
    public readonly createdAt: Date
  ) { }

  static create(data: {
    userId: string
    credentialId: string
    publicKey: Uint8Array
    counter: number
  }): WebAuthnCredential {
    return new WebAuthnCredential(
      crypto.randomUUID(),
      data.userId,
      data.credentialId,
      data.publicKey,
      data.counter,
      new Date()
    )
  }

  static fromPrisma(data: {
    id: string
    userId: string
    credentialId: string
    publicKey: Buffer
    counter: bigint
    createdAt: Date
  }): WebAuthnCredential {
    return new WebAuthnCredential(
      data.id,
      data.userId,
      data.credentialId,
      new Uint8Array(data.publicKey),
      Number(data.counter),
      data.createdAt
    )
  }

  incrementCounter(): WebAuthnCredential {
    return new WebAuthnCredential(
      this.id,
      this.userId,
      this.credentialId,
      this.publicKey,
      this.counter + 1,
      this.createdAt
    )
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      credentialId: this.credentialId,
      counter: this.counter,
      createdAt: this.createdAt.toISOString()
    }
  }
}
