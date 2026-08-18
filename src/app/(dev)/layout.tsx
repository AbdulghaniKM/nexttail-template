import type { ReactNode } from 'react';

/** Blank layout — dev tooling pages render without app chrome. */
export default function DevGroupLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
