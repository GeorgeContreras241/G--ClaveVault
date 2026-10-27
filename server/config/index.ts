/**
 * WebAuthn solo admite dominios como RP ID, nunca direcciones IP.
 * En desarrollo usa siempre `http://localhost:<puerto>` (nunca 127.0.0.1).
 */
export const webauthnConfig = {
  rpName: 'ClaveVault',
  rpID: process.env.RP_ID || 'localhost',
  origin: process.env.ORIGIN || 'http://localhost:3000',
  timeout: 60000,
  challengeTTL: 300000, // 5 minutes

  authenticatorSelection: {
    userVerification: 'required' as const,
    residentKey: 'preferred' as const,
  },

  attestationType: 'none' as const,
} as const;
