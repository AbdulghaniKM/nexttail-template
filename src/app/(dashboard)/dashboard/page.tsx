import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppLink } from '@/components/ui/AppLink';
import { definePage } from '@/config/routes';

export const metadata = definePage({
  head: 'Dashboard',
  layout: 'dashboard',
  requiresAuth: true,
});

export default function DashboardPage() {
  return (
    <AppEmptyState
      icon="icon-[solar--widget-5-linear]"
      title="Dashboard"
      description="A guarded page — `requiresAuth: true` in definePage. Without an access token in memory, AuthGuard sends you to Login."
      variant="primary"
    >
      <AppLink
        href="/dev/routes"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        Inspect the route registry
      </AppLink>
    </AppEmptyState>
  );
}
