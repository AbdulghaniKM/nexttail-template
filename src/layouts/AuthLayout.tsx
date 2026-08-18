import type { ReactNode } from 'react';
import { AppLink } from '@/components/ui/AppLink';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { appConfig } from '@/config/app.config';

export interface AuthLayoutProps {
  children: ReactNode;
  tagline?: ReactNode;
}

export function AuthLayout({ children, tagline }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <AppLink href="/" className="text-xl font-semibold text-text">
              {appConfig.app.name}
            </AppLink>
            {tagline && <p className="mt-1 text-sm text-text-secondary">{tagline}</p>}
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            {children}
          </div>
          <div className="mt-6 flex items-center justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
