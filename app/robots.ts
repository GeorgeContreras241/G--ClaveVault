import type { MetadataRoute } from 'next';
import { siteConfig } from '@/commons/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
