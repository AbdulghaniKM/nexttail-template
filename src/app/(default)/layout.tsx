import type { ReactNode } from 'react';
import { DefaultLayout } from '@/layouts/DefaultLayout';

export default function DefaultGroupLayout({ children }: { children: ReactNode }) {
  return <DefaultLayout>{children}</DefaultLayout>;
}
