'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useEffect, type ReactNode } from 'react';
import { AuthGuard } from '@/components/system/AuthGuard';
import { OfflineWatcher } from '@/components/system/OfflineWatcher';
import { RouteProgress } from '@/components/system/RouteProgress';
import { AppToast } from '@/components/ui/AppToast';
import { isDev } from '@/config/env';
import { useAppUiSync } from '@/hooks/useAppUi';
import { useSidebarSync } from '@/hooks/useSidebar';
import { useThemeSync } from '@/hooks/useTheme';
import { toast } from '@/hooks/useToast';
import { clearAuthToken, getAuthToken } from '@/lib/authToken';
import { registerErrorToasts, setAuthProvider } from '@/plugins/axios';

/**
 * Wires the in-memory auth token (src/lib/authToken.ts) into axios: attach it as
 * a Bearer token on every request, and on an unrecoverable 401 clear it and send
 * the visitor to Login. To enable silent refresh, add
 * `refreshToken: async () => { ...; return newAccessToken; }`.
 */
function useAxiosWiring(): void {
  const router = useRouter();

  useEffect(() => {
    setAuthProvider({
      getToken: getAuthToken,
      onUnauthorized: () => {
        clearAuthToken();
        router.replace('/login');
      },
    });

    // Dispatch 4xx/5xx axios errors to the toast layer. Opt out by removing
    // this call or replacing it with your own reporter.
    registerErrorToasts({
      onError: (message, options) => toast.error(message, options),
    });
  }, [router]);
}

/**
 * Surfaces unhandled promise rejections. Dev: a toast, so issues are obvious.
 * Prod: console only — swap in Sentry or your own reporter.
 */
function useUnhandledRejectionReporter(): void {
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      console.error('[unhandledrejection]', event.reason);
      if (!isDev()) return;
      const reason = event.reason;
      toast.error(reason instanceof Error ? reason.message : String(reason), {
        title: 'Unhandled promise rejection',
      });
    };

    window.addEventListener('unhandledrejection', onRejection);
    return () => window.removeEventListener('unhandledrejection', onRejection);
  }, []);
}

export function AppProviders({ children }: { children: ReactNode }) {
  useThemeSync();
  useAppUiSync();
  useSidebarSync();
  useAxiosWiring();
  useUnhandledRejectionReporter();

  return (
    <>
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      <Suspense fallback={null}>
        <AuthGuard />
      </Suspense>
      <Suspense fallback={null}>
        <OfflineWatcher />
      </Suspense>
      {children}
      <AppToast />
    </>
  );
}

export default AppProviders;
