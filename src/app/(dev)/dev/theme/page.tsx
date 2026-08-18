import { notFound } from 'next/navigation';
import { isProd } from '@/config/env';
import { definePage } from '@/config/routes';
import { ThemeStudio } from './ThemeStudio';

export const metadata = definePage({
  head: 'Theme Studio',
  layout: 'blank',
  robots: 'noindex, nofollow',
});

export default function ThemePage() {
  if (isProd()) notFound();
  return <ThemeStudio />;
}
