'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { isGuardedPath } from '@/config/routes';
import { getAuthToken, subscribeToAuthToken } from '@/lib/authToken';

const useAuthToken = (): string | null =>
  useSyncExternalStore(subscribeToAuthToken, getAuthToken, () => null);

/**
 * Client-side guard for routes marked `requiresAuth: true` via `definePage`.
 *
 * The access token lives in memory (see `src/lib/authToken.ts`), so the server
 * cannot see it — the check has to run here rather than in middleware. Add a
 * middleware check too once you move to an httpOnly session cookie.
 */
export function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthToken();

  useEffect(() => {
    if (!isGuardedPath(pathname)) return;
    if (token) return;
    router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [pathname, token, router]);

  return null;
}

export default AuthGuard;
