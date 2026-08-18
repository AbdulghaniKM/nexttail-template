'use client';

import { useEffect } from 'react';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { isDev } from '@/config/env';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Dev: the overlay already shows this. Prod: replace with Sentry or your reporter.
    console.error('[route:error]', error);
  }, [error]);

  return (
    <AppEmptyState
      icon="icon-[solar--shield-warning-linear]"
      title="Something went wrong"
      description={
        isDev()
          ? error.message
          : 'An unexpected error occurred on our end. Please try again in a moment.'
      }
      variant="danger"
    >
      <button
        type="button"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        onClick={reset}
      >
        Try again
      </button>
    </AppEmptyState>
  );
}
