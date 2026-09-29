import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Política de seguridad de contenido.
 *
 * Se deja `'unsafe-inline'` en `script-src` porque Next.js inyecta sus
 * scripts de hidratación inline; aun así la directiva ya bloquea cargar
 * scripts desde dominios de terceros, que es el vector típico de XSS.
 * `frame-ancestors 'none'` impide que la bóveda se incruste en iframes
 * ajenos (clickjacking), complementando `X-Frame-Options`.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  // `'unsafe-inline'` es necesario porque Next.js inyecta sus scripts de
  // hidratación inline; `'unsafe-eval'` solo en desarrollo, ya que lo
  // requiere el overlay de errores de Next.
  `script-src 'self' 'unsafe-inline'${isProduction ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  // En desarrollo HMR se comunica por WebSocket.
  isProduction ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
  "manifest-src 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  allowedDevOrigins: ['192.168.0.105'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // La API devuelve siempre datos sensibles o de sesión.
        source: '/api/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        // El vídeo de fondo es el único asset grande de la app.
        source: '/video/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
