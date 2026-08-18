import type { MetadataRoute } from 'next';
import { indexableRoutes } from '@/config/routes';
import { siteUrl } from '@/utils/seo';

/**
 * Sitemap built from the generated route registry, so adding a page adds it here.
 *
 * `indexableRoutes()` drops dev-only pages, guarded pages, anything marked
 * `noindex`, and dynamic routes — a `[param]` segment isn't a URL. Add those by
 * fetching their ids and pushing the concrete paths onto `entries`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().replace(/\/$/, '');

  const entries: MetadataRoute.Sitemap = indexableRoutes().map((route) => ({
    url: `${base}${route.path === '/' ? '' : route.path}`,
    changeFrequency: 'weekly',
    priority: route.path === '/' ? 1 : 0.7,
  }));

  return entries;
}
