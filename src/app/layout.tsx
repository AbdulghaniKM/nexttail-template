import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '@/components/providers/AppProviders';
import {
  appConfig,
  configStyleSheet,
  preBootScript,
  preloadedFontSources,
  rootMetadata,
  rootViewport,
} from '@/config';
import './globals.css';

export const metadata: Metadata = rootMetadata();
export const viewport: Viewport = rootViewport();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={appConfig.app.language ?? 'en'} suppressHydrationWarning>
      <head>
        {/* Stamps data-theme / data-shape before first paint — no flash. */}
        <script dangerouslySetInnerHTML={{ __html: preBootScript() }} />
        {/* Colors, @font-face, and font variables, all derived from app.config.ts. */}
        <style id="app-theme-variables" dangerouslySetInnerHTML={{ __html: configStyleSheet() }} />
        {preloadedFontSources().map((source) => (
          <link key={source} rel="preload" href={source} as="font" crossOrigin="anonymous" />
        ))}
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
