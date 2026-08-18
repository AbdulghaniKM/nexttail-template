import { notFound } from 'next/navigation';
import { definePage } from '@/config/routes';
import { isProd } from '@/config/env';
import { RouteExplorer } from './RouteExplorer';

export const metadata = definePage({
  head: 'Route Explorer',
  layout: 'blank',
  robots: 'noindex, nofollow',
});

export default function RoutesPage() {
  if (isProd()) notFound();
  return <RouteExplorer />;
}
