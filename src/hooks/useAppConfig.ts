import { appConfig } from '@/config/app.config';

/**
 * Read-only view over `app.config.ts`. The config is a module constant, so this
 * is safe in both Server and Client Components.
 */
export const useAppConfig = () => ({
  config: appConfig,
  app: appConfig.app,
  theme: appConfig.theme,
  typography: appConfig.typography,
  icons: appConfig.icons,
  seo: appConfig.seo,
  layout: appConfig.layout,
  appName: appConfig.app.name,
  appTitle: appConfig.app.title,
  appDescription: appConfig.app.description,
  appUrl: appConfig.app.url,
  primaryFont: appConfig.typography.primary.family,
  secondaryFont: appConfig.typography.secondary?.family,
  monoFont: appConfig.typography.mono?.family,
  containerMaxWidth: appConfig.layout?.containerMaxWidth ?? '1280px',
});
