import type { MetadataRoute } from 'next';
import { getCachedSitemapEntries } from '@/lib/cache/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getCachedSitemapEntries();
}
