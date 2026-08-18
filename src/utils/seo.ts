import type { Metadata } from 'next';
import { appConfig } from '@/config/app.config';
import { env, getAppUrl } from '@/config/env';

export type OpenGraphType = 'website' | 'article' | 'profile';

export interface StructuredData {
  '@context'?: string;
  '@type'?: string;
  [key: string]: unknown;
}

export interface SeoOverrides {
  title?: string;
  description?: string;
  keywords?: string[];
  robots?: string;
  /**
   * Absolute or root-relative canonical URL. Defaults to `'./'`, which Next
   * resolves against `metadataBase` **and the current route** — so every page
   * declares itself canonical without repeating its own path.
   */
  canonical?: string;
  image?: string;
  type?: OpenGraphType;
  publishedTime?: string;
  modifiedTime?: string;
}

const seoDefaults = appConfig.seo;

/**
 * The origin every absolute URL is built from. `NEXT_PUBLIC_APP_URL` wins so a
 * preview deployment self-references correctly; `identity.ts` is the fallback so
 * the template is correct after editing one file.
 */
export const siteUrl = (): string => env.NEXT_PUBLIC_APP_URL || appConfig.app.url || getAppUrl();

/** Resolves a path against the site origin. Absolute URLs pass through. */
export const absoluteUrl = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, siteUrl()).toString();
};

/**
 * Builds a Next `Metadata` object from `app.config.ts`, with per-page overrides.
 * `buildMetadata()` with no argument is the site-wide default used by the root layout.
 */
export const buildMetadata = (overrides: SeoOverrides = {}): Metadata => {
  const title = overrides.title ?? seoDefaults?.title ?? appConfig.app.title;
  const description =
    overrides.description ?? seoDefaults?.description ?? appConfig.app.description;
  const keywords = overrides.keywords ?? seoDefaults?.keywords;
  const robots = overrides.robots ?? seoDefaults?.robots;
  const image = absoluteUrl(overrides.image);
  const url = overrides.canonical ?? './';

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    keywords,
    robots,
    applicationName: appConfig.app.name,
    authors: appConfig.app.author ? [{ name: appConfig.app.author }] : undefined,
    icons: appConfig.icons.favicon ? { icon: appConfig.icons.favicon } : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: seoDefaults?.openGraph?.siteName ?? appConfig.app.name,
      type: overrides.type ?? seoDefaults?.openGraph?.type ?? 'website',
      locale: seoDefaults?.openGraph?.locale ?? 'en_US',
      images: image ? [image] : undefined,
      publishedTime: overrides.publishedTime,
      modifiedTime: overrides.modifiedTime,
    },
    twitter: {
      card: seoDefaults?.twitter?.card ?? 'summary_large_image',
      site: seoDefaults?.twitter?.site,
      creator: seoDefaults?.twitter?.creator,
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
};

/** Page `<title>` in the app's title format — `Page · AppName`. */
export const pageTitle = (head?: string): string =>
  head ? `${head} · ${appConfig.app.name}` : appConfig.app.title;

/** Serialized JSON-LD for a `<script type="application/ld+json">` tag. */
export const structuredDataJson = (data: StructuredData | StructuredData[]): string =>
  JSON.stringify(
    (Array.isArray(data) ? data : [data]).map((entry) => ({
      '@context': 'https://schema.org',
      ...entry,
    })),
  );
