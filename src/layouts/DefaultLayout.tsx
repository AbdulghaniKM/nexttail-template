import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/AppLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { appConfig } from '@/config/app.config';

export interface DefaultLayoutProps {
  children: ReactNode;
  nav?: ReactNode;
}

export function DefaultLayout({ children, nav }: DefaultLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <AppLink href="/" className="text-base font-semibold text-text">
            {appConfig.app.name}
          </AppLink>
          <nav className="flex items-center gap-2">
            {nav}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <main id="main" className="flex-1">
        {children}
      </main>
    </div>
  );
}

export default DefaultLayout;
