import type { Metadata, Viewport } from 'next';
import { generateFontFaceCSS, generateFontVariablesCSS, fontPreloadSources } from '@/utils/fonts';
import { buildMetadata } from '@/utils/seo';
import { generateCSSVariables } from '@/utils/theme';
import { appConfig } from './app.config';
import { THEME_STORAGE_KEY } from '@/lib/ThemePersistence';
import type { AppConfig } from './types';

export { appConfig };
export type { AppConfig };

/**
 * Every stylesheet rule derived from `app.config.ts` — color variables for both
 * palettes, `@font-face` blocks, and the font-family variables. Rendered into
 * the document head by the root layout, so the server already sends the right
 * theme and there is no flash of unstyled content.
 */
export const configStyleSheet = (): string =>
  [
    generateCSSVariables(appConfig.theme),
    generateFontFaceCSS(appConfig.typography.fonts),
    generateFontVariablesCSS(appConfig.typography),
  ]
    .filter(Boolean)
    .join('\n\n');

/** Sources for `<link rel="preload" as="font">`, for fonts flagged `preload`. */
export const preloadedFontSources = (): string[] => fontPreloadSources(appConfig.typography.fonts);

/** Site-wide metadata for the root layout. Pages override it with `definePage`. */
export const rootMetadata = (): Metadata => buildMetadata();

/**
 * Viewport settings for the root layout. `themeColor` comes from the palettes,
 * so mobile browser chrome matches the app in both schemes.
 */
export const rootViewport = (): Viewport => ({
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: appConfig.theme.light.background },
    { media: '(prefers-color-scheme: dark)', color: appConfig.theme.dark.background },
  ],
  colorScheme: 'light dark',
});

const SHAPE_STORAGE_KEY = 'app-shape';

/**
 * Runs before first paint to stamp `data-theme` / `data-shape` on <html> from
 * localStorage. Kept dependency-free and self-contained — it executes before
 * any bundle loads. Keep its storage keys aligned with `ThemePersistence` and
 * `useAppUi`.
 */
export const preBootScript = (): string => `(function () {
  try {
    var raw = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = null;
    if (raw === 'light' || raw === 'dark') theme = raw;
    else if (raw && raw.charAt(0) === '"') {
      var unquoted = raw.slice(1, -1);
      if (unquoted === 'light' || unquoted === 'dark') theme = unquoted;
    }
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else if (${JSON.stringify(appConfig.theme.defaultTheme ?? 'system')} === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');

    var shape = localStorage.getItem('${SHAPE_STORAGE_KEY}');
    if (shape) document.documentElement.setAttribute('data-shape', shape);
  } catch (error) {}
})();`;
