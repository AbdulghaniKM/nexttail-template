'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { AppPageLoader, pageLoader } from '@/components/ui/AppPageLoader';

/**
 * Completes the top progress bar whenever a navigation lands. `AppLink` starts
 * it — pair the two so every in-app transition shows progress.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    pageLoader.done();
  }, [pathname, searchParams]);

  return <AppPageLoader />;
}

export default RouteProgress;
