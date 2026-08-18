import type { MetadataRoute } from 'next';
import { nonIndexableRoutes } from '@/config/routes';
import { siteUrl } from '@/utils/seo';

/**
 * robots.txt derived from the route registry — every guarded, dev-only, or
 * `noindex` page is disallowed automatically, and the sitemap is advertised.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl().replace(/\/$/, '');
  const disallow = nonIndexableRoutes().map((route) => route.path);

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: disallow.length > 0 ? disallow : undefined,
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
