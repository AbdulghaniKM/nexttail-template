import { AppLink } from '@/components/ui/AppLink';
import { definePage } from '@/config/routes';

export const metadata = definePage({
  head: 'Sign in',
  layout: 'auth',
});

export default function LoginPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-text">Sign in</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Login page stub. Wire this up to your auth flow — post credentials, then call{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">setAuthToken(token)</code> from{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">src/lib/authToken.ts</code>.
      </p>
      <AppLink href="/" className="text-sm text-primary hover:underline">
        ← Back home
      </AppLink>
    </div>
  );
}
