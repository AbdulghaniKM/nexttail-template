'use client';

import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useMemo, useState, useSyncExternalStore } from 'react';
import { AppIcon } from '@/components/ui/AppIcon';
import { AppLink } from '@/components/ui/AppLink';
import { routes } from '@/config/routes';
import { getAuthToken, subscribeToAuthToken } from '@/lib/authToken';

export function RouteExplorer() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const hasToken = useSyncExternalStore(subscribeToAuthToken, getAuthToken, () => null) !== null;

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return routes
      .filter(
        (route) =>
          !needle ||
          route.path.toLowerCase().includes(needle) ||
          route.name.toLowerCase().includes(needle),
      )
      .map((route) => ({ ...route, active: route.path === pathname }));
  }, [query, pathname]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      guarded: rows.filter((route) => route.requiresAuth).length,
      dynamic: rows.filter((route) => route.dynamic).length,
    }),
    [rows],
  );

  return (
    <div className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <AppIcon name="icon-[solar--routing-2-linear]" className="size-6 text-primary" />
          <h1 className="text-2xl font-semibold text-text">Route Explorer</h1>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
            dev only
          </span>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Every route in the generated registry — like a Swagger index for your pages. Produced by{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            scripts/generate-routes.mjs
          </code>{' '}
          and returns 404 in production.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-2xl font-bold text-text">{stats.total}</p>
          <p className="text-xs text-text-secondary">routes</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-2xl font-bold text-text">{stats.guarded}</p>
          <p className="text-xs text-text-secondary">guarded</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-2xl font-bold text-text">{stats.dynamic}</p>
          <p className="text-xs text-text-secondary">dynamic</p>
        </div>
      </div>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter by path or name…"
        className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
      />

      <div className="mb-4 flex items-center gap-2 text-xs text-text-secondary">
        <span
          className={`inline-block size-2 rounded-full ${hasToken ? 'bg-success' : 'bg-border'}`}
        />
        Auth token {hasToken ? 'present' : 'absent'} — guarded routes{' '}
        {hasToken ? 'are reachable' : 'redirect to Login'}.
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {rows.map((route) => (
          <li
            key={route.path}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
              route.active ? 'bg-primary/5' : 'bg-surface'
            }`}
          >
            <span
              className={`size-1.5 shrink-0 rounded-full ${route.active ? 'bg-success' : 'bg-border'}`}
              title={route.active ? 'active route' : 'inactive'}
            />
            <code className="shrink-0 font-mono text-text">{route.path}</code>
            <span className="min-w-0 flex-1 truncate text-xs text-text-secondary">
              {route.head || route.name}
            </span>

            {route.requiresAuth && (
              <AppIcon
                name="icon-[heroicons-outline--lock-closed]"
                className="size-3.5 shrink-0 text-error"
                title="requires auth"
              />
            )}
            {route.dynamic && (
              <span
                className="shrink-0 text-[0.625rem] font-medium text-primary"
                title="dynamic — needs params"
              >
                [param]
              </span>
            )}
            {route.devOnly && (
              <span className="shrink-0 text-[0.625rem] font-medium text-warning">dev</span>
            )}
            <span className="shrink-0 text-[0.625rem] text-text-secondary">{route.layout}</span>

            {!route.dynamic && (
              <AppLink
                // Registry paths are strings resolved at build time, so they
                // can't be checked against the typedRoutes union.
                href={route.path as Route}
                className="shrink-0 text-xs font-medium text-primary hover:underline"
              >
                visit →
              </AppLink>
            )}
          </li>
        ))}

        {rows.length === 0 && (
          <li className="bg-surface px-3 py-6 text-center">
            <p className="text-sm text-text-secondary">No routes match “{query}”.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
