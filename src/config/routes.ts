import type { Metadata } from 'next';
import { buildMetadata, pageTitle, type OpenGraphType } from '@/utils/seo';
import { routes } from './routes.gen';

export type LayoutName = 'default' | 'auth' | 'dashboard' | 'blank';

export interface PageDefinition {
  /** Page title. Rendered as `<head> · AppName`. */
  head?: string;
  /** Meta description override. Falls back to the app description. */
  description?: string;
  /** Layout the page renders inside. Defaults to the route group it lives in. */
  layout?: LayoutName;
  /** Guard the page — visitors without an auth token are bounced to Login. */
  requiresAuth?: boolean;
  keywords?: string[];
  /** Defaults to the config value, or `noindex, nofollow` when `requiresAuth`. */
  robots?: string;
  /** Defaults to this page's own URL. Set it only to point elsewhere. */
  canonical?: string;
  /** Social share image. Relative paths resolve against the site origin. */
  image?: string;
  type?: OpenGraphType;
  publishedTime?: string;
  modifiedTime?: string;
}

export interface RouteRecord {
  path: string;
  name: string;
  head: string;
  layout: LayoutName;
  /** The page's `robots` override, or '' when it inherits the config default. */
  robots: string;
  requiresAuth: boolean;
  dynamic: boolean;
  devOnly: boolean;
}

export { routes };

// A page behind a login has nothing to offer a crawler, and indexing it leaks
// the URL surface. Guarded pages opt out unless the page says otherwise.
const GUARDED_ROBOTS = 'noindex, nofollow';

const metadataFor = (definition: PageDefinition): Metadata =>
  buildMetadata({
    title: pageTitle(definition.head),
    description: definition.description,
    keywords: definition.keywords,
    robots: definition.robots ?? (definition.requiresAuth ? GUARDED_ROBOTS : undefined),
    canonical: definition.canonical,
    image: definition.image,
    type: definition.type,
    publishedTime: definition.publishedTime,
    modifiedTime: definition.modifiedTime,
  });

/**
 * Declares a page's title, layout, and auth requirement, and returns the Next
 * `Metadata` for it. `scripts/generate-routes.mjs` reads the same call at build
 * time to produce `routes.gen.ts` — the registry behind the auth guard and the
 * `/dev/routes` explorer.
 *
 *   export const metadata = definePage({ head: 'Dashboard', requiresAuth: true });
 */
export const definePage = (definition: PageDefinition = {}): Metadata => metadataFor(definition);

/**
 * The `definePage` equivalent for dynamic routes, where the title and share
 * image come from data. Returns a `generateMetadata` function.
 *
 *   export const generateMetadata = defineDynamicPage<{ id: string }>(
 *     async ({ params }) => {
 *       const product = await productService.findOne((await params).id);
 *       return { head: product.name, description: product.description };
 *     },
 *   );
 */
export const defineDynamicPage =
  <Params extends Record<string, string | string[]>>(
    load: (context: { params: Promise<Params> }) => Promise<PageDefinition>,
  ) =>
  async (context: { params: Promise<Params> }): Promise<Metadata> =>
    metadataFor(await load(context));

/** Every route the guard should protect. */
export const guardedRoutes = (): RouteRecord[] => routes.filter((route) => route.requiresAuth);

const isNoIndex = (route: RouteRecord): boolean =>
  route.devOnly || route.requiresAuth || route.robots.includes('noindex');

/**
 * Routes a crawler should reach — the source of truth for `sitemap.ts`.
 * Dynamic routes are excluded: a `[param]` segment isn't a URL.
 */
export const indexableRoutes = (): RouteRecord[] =>
  routes.filter((route) => !isNoIndex(route) && !route.dynamic);

/** Routes a crawler should be told to skip — the source of truth for `robots.ts`. */
export const nonIndexableRoutes = (): RouteRecord[] => routes.filter(isNoIndex);

const segmentsOf = (path: string): string[] => path.split('/').filter(Boolean);

/** Whether a concrete pathname matches a registry path, including `[param]` segments. */
export const routeMatchesPath = (routePath: string, pathname: string): boolean => {
  const routeSegments = segmentsOf(routePath);
  const pathnameSegments = segmentsOf(pathname);

  const catchAllIndex = routeSegments.findIndex((segment) => segment.startsWith('[...'));
  if (catchAllIndex === -1 && routeSegments.length !== pathnameSegments.length) return false;
  if (catchAllIndex !== -1 && pathnameSegments.length < catchAllIndex) return false;

  return routeSegments.every((segment, index) => {
    if (segment.startsWith('[...')) return true;
    if (segment.startsWith('[')) return pathnameSegments[index] !== undefined;
    return segment === pathnameSegments[index];
  });
};

/** The registry entry for a pathname, or undefined when it isn't a known page. */
export const findRoute = (pathname: string): RouteRecord | undefined =>
  routes.find((route) => routeMatchesPath(route.path, pathname));

/** Whether a pathname requires an authenticated session. */
export const isGuardedPath = (pathname: string): boolean =>
  guardedRoutes().some((route) => routeMatchesPath(route.path, pathname));
