export class Challenge {
  constructor(
    public readonly email: string,
    public readonly value: string,
    public readonly createdAt: Date = new Date()
  ) {}

  isExpired(maxAgeMs: number = 300000): boolean {
    return Date.now() - this.createdAt.getTime() > maxAgeMs
  }

  toJSON() {
    return {
      email: this.email,
      createdAt: this.createdAt.toISOString()
    }
  }
}
