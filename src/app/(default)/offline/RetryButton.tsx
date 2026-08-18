'use client';

export function RetryButton() {
  const retry = () => {
    if (navigator.onLine) window.location.reload();
  };

  return (
    <button
      type="button"
      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      onClick={retry}
    >
      Retry
    </button>
  );
}
