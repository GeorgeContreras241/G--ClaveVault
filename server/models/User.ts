export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(email: string): User {
    return new User(
      crypto.randomUUID(),
      email.toLowerCase().trim(),
      new Date()
    )
  }

  static fromPrisma(data: { id: string; email: string; createdAt: Date; updatedAt: Date }): User {
    return new User(data.id, data.email, data.createdAt, data.updatedAt)
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      createdAt: this.createdAt.toISOString()
    }
  }
}
