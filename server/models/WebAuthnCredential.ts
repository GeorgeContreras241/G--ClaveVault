export class WebAuthnCredential {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly credentialId: string,
    public readonly publicKey: Uint8Array,
    public readonly counter: number,
    public readonly createdAt: Date,
    public readonly transports?: string
  ) {}

  static create(data: {
    userId: string
    credentialId: string
    publicKey: Uint8Array
    counter: number
    transports?: string
  }): WebAuthnCredential {
    return new WebAuthnCredential(
      crypto.randomUUID(),
      data.userId,
      data.credentialId,
      data.publicKey,
      data.counter,
      new Date(),
      data.transports
    )
  }

  static fromPrisma(data: {
    id: string
    userId: string
    credentialId: string
    publicKey: Uint8Array | Buffer
    counter: bigint
    createdAt: Date
    transports?: string | null
  }): WebAuthnCredential {
    return new WebAuthnCredential(
      data.id,
      data.userId,
      data.credentialId,
      data.publicKey instanceof Uint8Array ? data.publicKey : new Uint8Array(data.publicKey),
      Number(data.counter),
      data.createdAt,
      data.transports ?? undefined
    )
  }

  incrementCounter(): WebAuthnCredential {
    return new WebAuthnCredential(
      this.id,
      this.userId,
      this.credentialId,
      this.publicKey,
      this.counter + 1,
      this.createdAt,
      this.transports
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
