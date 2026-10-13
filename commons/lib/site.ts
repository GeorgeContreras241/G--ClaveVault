const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'http://localhost:3000';

export const siteConfig = {
  name: 'ClaveVault',
  shortName: 'ClaveVault',
  description:
    'Gestor de contraseñas local y seguro. Almacena, organiza y protege tus credenciales con cifrado en el navegador, sin enviar datos a servidores.',
  url: siteUrl,
  locale: 'es_ES',
  keywords: [
    'gestor de contraseñas',
    'contraseñas locales',
    'cifrado',
    'bóveda de credenciales',
    'offline',
    'privacidad',
  ],
} as const;
