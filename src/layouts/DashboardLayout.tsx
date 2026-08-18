'use client';

import type { ReactNode } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { appConfig } from '@/config/app.config';
import { useSidebar } from '@/hooks/useSidebar';

export interface DashboardLayoutProps {
  children: ReactNode;
  nav?: ReactNode;
  headerStart?: ReactNode;
  headerEnd?: ReactNode;
}

export function DashboardLayout({ children, nav, headerStart, headerEnd }: DashboardLayoutProps) {
  const { collapsed, toggle } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-e border-border bg-surface transition-[width] duration-200 md:block ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-3">
          {!collapsed && (
            <span className="truncate text-sm font-semibold text-text">{appConfig.app.name}</span>
          )}
          <button
            type="button"
            className="ms-auto flex size-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-muted hover:text-text"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggle}
          >
            <AppIcon
              name={
                collapsed
                  ? 'icon-[solar--alt-arrow-right-linear]'
                  : 'icon-[solar--alt-arrow-left-linear]'
              }
              size={1}
            />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">{nav}</nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/50 bg-surface/70 px-4 backdrop-blur-xl">
          {headerStart}
          <div className="ms-auto flex items-center gap-2">
            {headerEnd}
            <ThemeToggle />
          </div>
        </header>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <main id="main" className="min-h-0 flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
