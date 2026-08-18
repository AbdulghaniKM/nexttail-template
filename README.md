# NextTail

A production-ready Next.js 16 starter with Tailwind CSS v4, TypeScript, and a config-driven theme/SEO/route layer. The React sibling of [VueTail](../vuetail-template) — same architecture, App Router idioms. Linted and formatted with the [Oxc](https://oxc.rs) toolchain (Oxlint + Oxfmt).

## Stack

| Layer      | Technology                                                                  |
| ---------- | --------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, React 19, Server Components)                        |
| Styling    | Tailwind CSS v4 with CSS variable theming                                   |
| Language   | TypeScript 6 (strict)                                                       |
| State      | Zustand 5                                                                   |
| Routing    | App Router + generated compile-time route registry                          |
| Validation | Zod 4                                                                       |
| HTTP       | Axios (interceptors, CSRF, auth token plumbing)                             |
| Icons      | Iconify (200k+ icons via `@iconify/tailwind4`)                              |
| Animations | motion (spring physics)                                                     |
| Utilities  | date-fns                                                                    |
| Linting    | [Oxlint](https://oxc.rs/docs/guide/usage/linter)                            |
| Formatting | [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) (Tailwind class sorting) |

## Prerequisites

- **Node.js** 20.9+ (required by Next 16)
- **pnpm** (recommended)

## Quick Start

```bash
pnpm dlx degit AbdulghaniKM/nexttail-template my-app
cd my-app
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and set your values:

```bash
cp .env.example .env.local
```

## Make it yours

After cloning, a few edits turn this template into your own app:

1. **Identity** — edit `src/config/identity.ts` (name, title, description, url). This drives `<title>`, meta description, and SEO tags everywhere.
2. **Theme** — tweak the `light` / `dark` color palettes in `src/config/app.config.ts`.
3. **Favicon** — drop your icon into `public/` and point `icons.favicon` in `src/config/app.config.ts` at it.
4. **API** — set `NEXT_PUBLIC_API_URL` in `.env.local` (defaults to `/api` in dev; production must be an absolute `https://` URL).

## Project Structure

```
src/
├── app/                      # App Router — route groups map to layouts
│   ├── layout.tsx            # Root: pre-boot theme script, config stylesheet, providers
│   ├── globals.css           # Tailwind imports, @theme tokens, scrollbar, keyframes
│   ├── error.tsx             # Route error boundary
│   ├── global-error.tsx      # Root layout error boundary
│   ├── not-found.tsx         # 404
│   ├── sitemap.ts            # sitemap.xml from the route registry
│   ├── robots.ts             # robots.txt from the route registry
│   ├── (default)/            # → DefaultLayout
│   │   ├── page.tsx          # Home (/)
│   │   └── offline/page.tsx  # /offline
│   ├── (auth)/               # → AuthLayout
│   │   └── login/page.tsx    # /login
│   ├── (dashboard)/          # → DashboardLayout
│   │   └── dashboard/page.tsx
│   └── (dev)/                # → blank layout, 404 in production
│       ├── dev/routes/       # Route Explorer
│       └── dev/theme/        # Theme Studio
├── components/
│   ├── providers/
│   │   └── AppProviders.tsx  # Store hydration, axios wiring, toasts, guards
│   ├── system/
│   │   ├── AuthGuard.tsx     # Client guard driven by the route registry
│   │   ├── OfflineWatcher.tsx
│   │   ├── RouteProgress.tsx
│   │   └── StructuredData.tsx # JSON-LD renderer
│   └── ui/                   # UI components — shadcn-style on-demand registry
│       ├── AppEmptyState.tsx # Empty state placeholders
│       ├── AppIcon.tsx       # Iconify class-based icon
│       ├── AppLink.tsx       # next/link + progress bar wiring
│       ├── AppPageLoader.tsx # Top route-loading bar
│       ├── AppSkeleton.tsx   # Skeleton shimmer placeholders
│       ├── AppToast.tsx      # Floating toasts with progress timelines
│       └── ThemeToggle.tsx   # Light/dark toggle
│       #  ↑ these ship by default · add more with `pnpm add-component <Name>`
├── config/
│   ├── app.config.ts         # Centralized app configuration
│   ├── identity.ts           # The 4 values you must edit
│   ├── api-paths.ts          # API endpoint constants
│   ├── env.ts                # Zod-validated environment accessors
│   ├── routes.ts             # definePage / defineDynamicPage + registry helpers
│   ├── routes.gen.ts         # AUTO-GENERATED registry (gitignored)
│   ├── types.ts              # Config type definitions
│   └── index.ts              # Stylesheet, pre-boot script, root metadata + viewport
├── hooks/
│   ├── useAppConfig.ts       # Read-only view over app.config.ts
│   ├── useAppUi.ts           # Shape knob (square / rounded / pill)
│   ├── useSidebar.ts         # Sidebar collapsed / mobile state
│   ├── useTheme.ts           # light / dark / system mode
│   └── useToast.ts           # Toast queue (+ non-React `toast` handle)
├── layouts/                  # DefaultLayout, AuthLayout, DashboardLayout
├── lib/
│   ├── authToken.ts          # In-memory access token — single source of truth
│   ├── ThemePersistence.ts   # localStorage ↔ documentElement sync
│   └── useFormModel.ts       # Zod-backed form state
├── plugins/
│   ├── axios.config.ts       # Pure Axios instance and networking config
│   └── axios.ts              # Interceptors, auth provider, error toasts
├── services/
│   ├── BaseApiService.ts     # Generic REST CRUD base class
│   ├── product.service.ts    # Product API service
│   └── upload.service.ts     # File upload with progress and cancellation
├── stores/
│   ├── factory.ts            # createResourceStore — Zustand collection lifecycle
│   └── product.store.ts
├── types/                    # Shared TypeScript types
├── utils/                    # date, datepicker, display, error, file, fonts, seo, theme, validation
└── theme.ts                  # Shape knob config
```

## Configuration

All app settings live in `src/config/app.config.ts`:

```ts
export const appConfig: AppConfig = {
  api: { baseUrl, timeout },
  app: { name, title, description, version, author, url, language },
  theme: {
    defaultTheme: 'system', // 'light' | 'dark' | 'system'
    light: { primary, secondary, accent, background, surface, ... },
    dark:  { primary, secondary, accent, background, surface, ... },
  },
  typography: { primary, secondary, mono, fonts },
  icons: { favicon },
  seo: { title, description, keywords, openGraph, twitter },
  layout: { containerMaxWidth },
};
```

Unlike a client-side SPA, this config is applied **on the server**. `src/config/index.ts` turns it into:

- `configStyleSheet()` — the color variables for both palettes, `@font-face` blocks, and font-family variables, rendered into `<head>` by the root layout.
- `preBootScript()` — a tiny inline script that stamps `data-theme` / `data-shape` on `<html>` before first paint.
- `rootMetadata()` — the site-wide Next `Metadata` object.

There is no flash of unstyled content and no runtime DOM patching.

## Theming

Fallback tokens live in `src/app/globals.css`; the real values come from `app.config.ts`:

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-surface: #f9fafb;
  /* ... */
}
```

Use theme colors directly in Tailwind classes: `bg-primary`, `text-secondary`, `border-border`.

Switch themes programmatically:

```ts
'use client';
const { theme, setTheme, isDark } = useTheme();
setTheme('dark'); // 'light' | 'dark' | 'system'
```

Border radius is a single knob in `src/theme.ts` (`square` | `rounded` | `pill`), applied via `data-shape` on `<html>`. Preview both live at `/dev/theme`.

## Routing

Next routes by filesystem — the template adds a **generated route registry** on top so the rest of the app can reason about pages.

### `definePage`

```tsx
// src/app/(dashboard)/dashboard/page.tsx
export const metadata = definePage({
  head: 'Dashboard',
  layout: 'dashboard',
  requiresAuth: true,
});
```

- `head` — page title, rendered as `Dashboard · AppName`.
- `description`, `keywords`, `robots`, `canonical`, `image` — SEO overrides on top of the config defaults.
- `layout` — documents which layout the page renders in. Defaults to the route group.
- `requiresAuth` — guards the route; visitors without an access token are sent to `/login?redirect=…`.

`definePage` returns a Next `Metadata` object, so pages stay idiomatic. `scripts/generate-routes.mjs` reads the same call statically and writes `src/config/routes.gen.ts`, which feeds `AuthGuard` and the `/dev/routes` explorer. It runs automatically on `predev`, `prebuild`, and `typecheck`.

### Layouts via route groups

| Group          | Layout            | Example route |
| -------------- | ----------------- | ------------- |
| `(default)/`   | `DefaultLayout`   | `/`           |
| `(auth)/`      | `AuthLayout`      | `/login`      |
| `(dashboard)/` | `DashboardLayout` | `/dashboard`  |
| `(dev)/`       | blank             | `/dev/routes` |

Route groups don't appear in the URL, so `(dashboard)/dashboard/page.tsx` serves `/dashboard`.

### Dev-only pages

Pages under `(dev)/` call `notFound()` when `NODE_ENV === 'production'` and are marked `robots: noindex`. `/dev/routes` lists every registered route with its layout, title, guard state, and a live/inactive marker; `/dev/theme` previews shape and theme mode against a component gallery.

Both are printed in the dev server banner, so you don't have to remember they exist:

```
▲ Next.js 16.3.1 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.0.13:3000
- Routes:        http://localhost:3000/dev/routes  (route registry)
- Theme:         http://localhost:3000/dev/theme   (theme studio)
✓ Ready in 743ms
```

`scripts/dev.mjs` wraps `next dev` to do this — it forwards Next's output verbatim (stdin and stderr stay attached to the terminal) and only appends the two lines once Next reports its URL. A page whose folder you delete simply drops off the banner. Flags pass straight through, so `pnpm dev --port 4000` and friends still work.

## SEO

Every page's metadata is derived from `app.config.ts` — you never hand-write a meta tag.

`definePage` returns a Next `Metadata` object, so a page just exports it:

```tsx
export const metadata = definePage({
  head: 'Pricing',
  description: 'Simple plans that scale with you.',
  keywords: ['pricing', 'plans'],
  image: '/og/pricing.png', // relative paths resolve against the site origin
});
```

What you get without doing anything else:

| Tag                                          | Source                                   |
| -------------------------------------------- | ---------------------------------------- |
| `<title>`                                    | `head` + app name — `Pricing · NextTail` |
| `description`, `keywords`, `robots`          | page override, else `appConfig.seo`      |
| `canonical` **and `og:url`**                 | the page's own URL, resolved per route   |
| `og:title/description/site_name/type/locale` | page override, else config               |
| `twitter:card/site/creator/title/image`      | page override, else config               |
| `theme-color` (light + dark)                 | `appConfig.theme.*.background`           |
| `/sitemap.xml`, `/robots.txt`                | the generated route registry             |

### Canonical URLs

`canonical` defaults to `'./'`, which Next resolves against `metadataBase` **and the current
route** — so `/login` declares `https://your-site.com/login`, not the homepage. Getting this
wrong is the classic Next SEO bug: a hardcoded canonical tells Google every page is a duplicate
of the root and the site drops out of the index. Only pass `canonical` when a page should
deliberately point somewhere else.

`metadataBase` comes from `siteUrl()`: `NEXT_PUBLIC_APP_URL` if set (so preview deployments
self-reference correctly), otherwise `identity.ts`'s `url`.

### Guarded pages are `noindex` automatically

`definePage({ requiresAuth: true })` implies `robots: 'noindex, nofollow'` — a page behind a
login has nothing to offer a crawler, and indexing it leaks your URL surface. Pass `robots`
explicitly to override.

### Dynamic routes

`defineDynamicPage` is the `definePage` equivalent for `[param]` routes, where the title and
share image come from data. It returns a `generateMetadata` function:

```tsx
// app/(default)/products/[id]/page.tsx
export const generateMetadata = defineDynamicPage<{ id: string }>(async ({ params }) => {
  const product = await productService.findOne((await params).id);
  return {
    head: product.name,
    description: product.description,
    image: product.imageUrl,
    type: 'article',
  };
});
```

### sitemap.xml & robots.txt

Both are generated from the route registry, so adding a page updates them:

- [`app/sitemap.ts`](src/app/sitemap.ts) lists `indexableRoutes()` — everything except dev-only,
  guarded, `noindex`, and dynamic routes.
- [`app/robots.ts`](src/app/robots.ts) disallows `nonIndexableRoutes()` and advertises the sitemap.

To add dynamic URLs, fetch their ids in `sitemap.ts` and push the concrete paths onto `entries`.

### Structured data

```tsx
import { StructuredData } from '@/components/system/StructuredData';

<StructuredData
  data={{ '@type': 'Product', name: product.name, offers: { '@type': 'Offer', price } }}
/>;
```

`@context` is added for you. Render it anywhere in a Server Component.

## Server vs Client

The template keeps the boundary explicit:

- **Server by default** — pages, layouts, and anything that only reads `appConfig`.
- **`'use client'`** — hooks (`useTheme`, `useToast`, `useSidebar`, `useAppUi`, `useFormModel`), the interactive UI components, stores, and `AppProviders`.

A page that needs a single interactive control stays a Server Component and imports a small client child — see `app/(default)/offline/page.tsx` + `RetryButton.tsx`. That pattern is what lets every page keep its `export const metadata`.

## Components

NextTail ships as a lean starter with an **on-demand component registry** (shadcn-style). Only
a small default set lives in `src/components/ui/` out of the box — **AppEmptyState, AppIcon,
AppLink, AppPageLoader, AppSkeleton, AppToast, ThemeToggle**. Everything else is copied into
your project only when you ask for it:

```bash
pnpm add-component AppButton      # add a component (resolves + installs its deps)
pnpm add-component list           # list everything available in the registry
pnpm add-hook useAuth             # add a hook
pnpm nexttail:verify              # check installed files still match the registry
```

Installed items are recorded in `nexttail.json` with their SHA, so `verify` detects drift and re-adding a file you've edited asks before overwriting.

### AppIcon

```tsx
<AppIcon name="heroicons-outline:check" size="lg" />
<AppIcon name="icon-[solar--sun-linear]" size={1.5} className="text-primary" />
```

Accepts either `collection:name` or the raw Iconify-Tailwind class. Sizes: `xs`–`xl`, or a number in `rem`.

### AppToast

```ts
'use client';
const { success, error, warning, info } = useToast();
success('Changes saved!');
error('Something went wrong', { title: 'Error', duration: 8000 });
```

Outside React (interceptors, plain modules) use the non-reactive handle:

```ts
import { toast } from '@/hooks/useToast';
toast.error('Upload failed');
```

### AppLink

`next/link` wired to the top progress bar. Use it for in-app navigation so slow transitions show progress instead of appearing frozen.

### AppEmptyState / AppSkeleton

```tsx
<AppEmptyState icon="icon-[solar--box-linear]" title="Nothing here" description="Add your first item." variant="primary">
  <button>Create</button>
</AppEmptyState>

<AppSkeleton variant="text" lines={3} />
<AppSkeleton variant="circle" width={3} height={3} />
```

## State

`createResourceStore` builds a Zustand store with the full collection lifecycle on top of any service that satisfies `ResourceCollectionClient`:

```ts
export const useProductStore = createResourceStore<Product, ProductExtras>(
  'products',
  productService,
  (set) => ({
    featured: [],
    fetchFeatured: async () => set({ featured: await productService.getFeatured() }),
  }),
);
```

```tsx
'use client';
const items = useProductStore((state) => state.items);
const fetchAll = useProductStore((state) => state.fetchAll);
```

You get `items`, `selected`, `isLoading`, `isSaving`, `error`, `pagination`, `queryParams`, `lastFetched`, plus `fetchAll`, `fetchOne`, `create`, `update`, `remove`, `setQuery`, `nextPage`, `prevPage`, `findById`, `isEmpty()`, `isStale()`, and `reset()`. Redux DevTools is attached in development.

## Forms

```tsx
'use client';
const form = useFormModel({ email: '', password: '' }, loginSchema);

<input value={form.fields.email} onChange={(e) => form.setField('email', e.target.value)} />;
{
  form.errors.email && <p>{form.errors.email}</p>;
}
<button disabled={form.isSubmitting} onClick={() => form.submit(async (payload) => login(payload))}>
  Sign in
</button>;
```

The Zod schema is the single source of truth for both the payload type and the messages.

## Environment Variables

| Variable              | Description                           | Default                 |
| --------------------- | ------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL (required in production) | `/api`                  |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used for SEO)         | `http://localhost:3000` |

Both are parsed through a Zod schema in `src/config/env.ts` at import time — a bad value fails the build rather than surfacing at runtime. See `.env.example`.

## Authentication & token storage

The auth **access token** is the single source of truth in [`src/lib/authToken.ts`](src/lib/authToken.ts) and is held **in memory by default** — never in `localStorage` or a JS-readable cookie.

**Why in-memory?** A token in `localStorage` is readable by any script on the page, so a single XSS (a compromised dependency, a third-party widget) can exfiltrate the whole session. An in-memory token can't be read that way.

**The tradeoff:** a full page reload drops the token, so the user appears logged out on refresh. The production-grade pattern is to pair this with a **silent refresh** — keep the long-lived _refresh_ token in an `httpOnly` + `SameSite` cookie set by your backend, and on load exchange it for a fresh access token:

```ts
// src/components/providers/AppProviders.tsx — extend the AuthProvider
setAuthProvider({
  getToken: getAuthToken,
  refreshToken: async () => {
    const { token } = await apiPost<{ token: string }>('/auth/refresh'); // sends the httpOnly cookie
    setAuthToken(token);
    return token;
  },
  onUnauthorized: () => {
    /* clear + redirect (already wired) */
  },
});
```

The axios interceptor (`src/plugins/axios.ts`) de-duplicates concurrent refreshes and retries the original request automatically once a new token arrives.

**Everything goes through `authToken.ts`** — `AuthGuard`, the axios request interceptor, and the route explorer. To switch strategies, change only that one file; a commented `localStorage` example is included there.

**Note on middleware:** because the token lives in memory, the server can't see it, so the guard runs on the client. Once you move to an httpOnly session cookie, add a `middleware.ts` check as well — `isGuardedPath(pathname)` from `src/config/routes.ts` gives you the guarded list.

## Code quality

Linting and formatting use the Oxc toolchain — fast, no ESLint/Prettier dependency tree.

| File                               | Purpose                                                           |
| ---------------------------------- | ----------------------------------------------------------------- |
| `[.oxlintrc.json](.oxlintrc.json)` | Lint rules (TypeScript, React, unicorn, oxc presets)              |
| `[.oxfmtrc.json](.oxfmtrc.json)`   | Format options + Tailwind class sorting via `src/app/globals.css` |

**Editor:** install the [Oxc VS Code extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) and set it as the default formatter for JS/TS/TSX.

```bash
pnpm lint          # Lint (warnings for no-console, no-explicit-any, etc.)
pnpm lint:fix      # Lint with auto-fix
pnpm format        # Format the repo with Oxfmt
pnpm format:check  # Fail CI if anything is unformatted
pnpm check         # lint + format:check + typecheck
```

## Scripts

```bash
pnpm dev              # Start dev server (regenerates routes, prints dev tooling URLs)
pnpm build            # Production build (regenerates the route registry first)
pnpm start            # Serve the production build
pnpm routes           # Regenerate src/config/routes.gen.ts by hand
pnpm typecheck        # tsc --noEmit
pnpm lint             # Run Oxlint
pnpm lint:fix         # Run Oxlint with auto-fix
pnpm format           # Format with Oxfmt
pnpm format:check     # Check formatting (CI)
pnpm check            # lint + format:check + typecheck
pnpm add-component    # Add a UI component from the registry
pnpm add-hook         # Add a hook from the registry
pnpm nexttail:verify  # Verify registry / install integrity
```

## License

MIT
