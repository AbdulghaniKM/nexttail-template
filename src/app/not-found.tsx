import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppLink } from '@/components/ui/AppLink';
import { DefaultLayout } from '@/layouts/DefaultLayout';

export default function NotFound() {
  return (
    <DefaultLayout>
      <AppEmptyState
        icon="icon-[solar--compass-square-linear]"
        title="Page not found"
        description="We couldn't find the page you're looking for. It may have been moved, renamed, or never existed."
        variant="neutral"
      >
        <AppLink
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          Go home
        </AppLink>
      </AppEmptyState>
    </DefaultLayout>
  );
}
