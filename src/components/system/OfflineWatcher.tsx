'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const OFFLINE_PATH = '/offline';

/** Routes to `/offline` when the connection drops, and back home when it returns. */
export function OfflineWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onOffline = () => {
      if (pathname !== OFFLINE_PATH) router.push(OFFLINE_PATH);
    };
    const onOnline = () => {
      if (pathname === OFFLINE_PATH) router.push('/');
    };

    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, [pathname, router]);

  return null;
}

export default OfflineWatcher;
