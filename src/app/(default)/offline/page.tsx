import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { definePage } from '@/config/routes';
import { RetryButton } from './RetryButton';

export const metadata = definePage({
  head: "You're offline",
  layout: 'default',
  robots: 'noindex',
});

export default function OfflinePage() {
  return (
    <AppEmptyState
      icon="icon-[solar--wi-fi-router-minimalistic-linear]"
      title="You're offline"
      description="Check your connection and try again."
      variant="warning"
    >
      <RetryButton />
    </AppEmptyState>
  );
}
