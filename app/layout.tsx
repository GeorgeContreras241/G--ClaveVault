import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';
import { WebApplicationJsonLd } from '@/commons/components/seo/JsonLd';
import { SplitLayout } from '@/commons/components/layout/SplitLayout';
import { siteConfig } from '@/commons/lib/site';
import './globals.css';
import { cn } from '@/commons/lib/utils';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Gestor de contraseñas local y seguro`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Gestor de contraseñas local y seguro`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary',
    title: `${siteConfig.name} | Gestor de contraseñas local y seguro`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        plexSans.variable,
        spaceGrotesk.variable,
        plexMono.variable
      )}
    >
      <body className="font-sans antialiased bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 overflow-hidden">
        <WebApplicationJsonLd />
        <SplitLayout>{children}</SplitLayout>
      </body>
    </html>
  );
}
