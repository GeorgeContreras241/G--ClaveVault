import { cacheLife, cacheTag } from 'next/cache';
import { siteConfig } from '@/lib/site';

export async function getCachedSiteConfig() {
  'use cache';
  cacheLife('max');
  cacheTag('site-config');

  return siteConfig;
}

export async function getCachedSitemapEntries() {
  'use cache';
  cacheLife('days');
  cacheTag('sitemap', 'site-config');

  const config = await getCachedSiteConfig();
  const lastModified = new Date();

  return [
    {
      url: config.url,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: `${config.url}/offline`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];
}
