import { Challenge } from '@/server/models'

export const challenges = new Map<string, Challenge>()

export const credentials = new Map<string, { credentialID: string; credentialPublicKey: string; counter: number }>()
