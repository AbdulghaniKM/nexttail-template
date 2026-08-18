import type { ReactNode } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { DashboardNav } from './DashboardNav';

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout nav={<DashboardNav />}>{children}</DashboardLayout>;
}
