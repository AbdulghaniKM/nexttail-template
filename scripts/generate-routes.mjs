/**
 * Compile-time route registry for the App Router.
 *
 * Scans `src/app` for `page.tsx` files, derives each URL from the folder
 * structure, reads the static fields out of the `definePage({ ... })` call, and
 * writes `src/config/routes.gen.ts`.
 *
 * Next already routes by filesystem — this registry exists so the rest of the
 * app can *reason* about routes: the auth guard reads `requiresAuth`, and the
 * `/dev/routes` explorer lists everything with its layout and title.
 *
 * Runs automatically via the `predev` / `prebuild` / `typecheck` npm scripts.
 * You shouldn't need to edit this file — configure pages with `definePage`.
 */

import fs from 'node:fs';
import path from 'node:path';

const APP_DIR = path.join('src', 'app');
const OUTPUT = path.join('src', 'config', 'routes.gen.ts');

const FIELDS = [
  'head',
  'description',
  'layout',
  'requiresAuth',
  'keywords',
  'robots',
  'canonical',
  'image',
];
const LAYOUTS = ['default', 'auth', 'dashboard', 'blank'];

// Route group -> layout it renders. Keep aligned with `src/app/(group)/layout.tsx`.
const LAYOUT_BY_GROUP = {
  '(default)': 'default',
  '(auth)': 'auth',
  '(dashboard)': 'dashboard',
  '(dev)': 'blank',
};

const DEV_ONLY_GROUPS = ['(dev)'];

const warnings = [];
const warn = (message) => warnings.push(message);

// ─── filesystem scan ─────────────────────────────────────────────────────────

function collectPageFiles(dir, base = dir) {
  const found = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // `_folder` is a Next private folder — never routable.
      if (entry.name.startsWith('_')) continue;
      found.push(...collectPageFiles(full, base));
    } else if (entry.isFile() && /^page\.(tsx|jsx|ts|js)$/.test(entry.name)) {
      found.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }

  return found;
}

// ─── path / name derivation ──────────────────────────────────────────────────

const isRouteGroup = (segment) => segment.startsWith('(') && segment.endsWith(')');
const isParallelOrIntercept = (segment) => segment.startsWith('@') || segment.startsWith('(.');

/** `(dashboard)/dashboard/page.tsx` -> `/dashboard`, `users/[id]/page.tsx` -> `/users/[id]` */
function fileToRoutePath(relative) {
  const segments = relative
    .split('/')
    .slice(0, -1)
    .filter((segment) => !isRouteGroup(segment) && !isParallelOrIntercept(segment));
  return segments.length ? `/${segments.join('/')}` : '/';
}

/** `/` -> `index`, `/users/[id]` -> `users-[id]` */
function routePathToName(routePath) {
  const segments = routePath.split('/').filter(Boolean);
  return segments.length ? segments.join('-') : 'index';
}

function groupOf(relative) {
  return relative.split('/').find(isRouteGroup);
}

// ─── definePage extraction ───────────────────────────────────────────────────

function readDefinePage(source, where) {
  const match = source.match(/definePage\(\s*(\{[\s\S]*?\})\s*\)/);
  if (!match) return {};
  const config = match[1];

  // The closing quote must match the opening one, so an apostrophe inside a
  // double-quoted title doesn't truncate the value.
  const readString = (key) =>
    config.match(new RegExp(`${key}\\s*:\\s*(["'\`])((?:\\\\.|(?!\\1).)*)\\1`))?.[2];
  const readBoolean = (key) => {
    const found = config.match(new RegExp(`${key}\\s*:\\s*(true|false)`));
    return found ? found[1] === 'true' : undefined;
  };

  // Strip string values first so a colon inside a title isn't read as a key.
  const withoutStrings = config.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, "''");
  const declaredKeys = [...withoutStrings.matchAll(/([A-Za-z_$][\w$]*)\s*:/g)].map((m) => m[1]);

  for (const key of declaredKeys) {
    if (!FIELDS.includes(key)) {
      warn(
        `definePage in ${where}: unknown field "${key}" — valid fields are ${FIELDS.join(', ')}.`,
      );
    }
  }

  const head = readString('head');
  const layout = readString('layout');
  const robots = readString('robots');
  const requiresAuth = readBoolean('requiresAuth');

  if (layout !== undefined && !LAYOUTS.includes(layout)) {
    warn(
      `definePage in ${where}: invalid layout "${layout}" — expected one of ${LAYOUTS.join(', ')}.`,
    );
  }
  for (const key of ['head', 'layout', 'robots']) {
    if (declaredKeys.includes(key) && readString(key) === undefined) {
      warn(
        `definePage in ${where}: "${key}" is not a static string literal and was ignored — use a plain quoted string.`,
      );
    }
  }
  if (declaredKeys.includes('requiresAuth') && requiresAuth === undefined) {
    warn(`definePage in ${where}: "requiresAuth" must be a literal true/false and was ignored.`);
  }

  return { head, layout, robots, requiresAuth };
}

// ─── build the registry ──────────────────────────────────────────────────────

function buildRoutes() {
  return collectPageFiles(APP_DIR)
    .map((relative) => {
      const source = fs.readFileSync(path.join(APP_DIR, relative), 'utf8');
      const where = `app/${relative}`;
      const definition = readDefinePage(source, where);
      const group = groupOf(relative);
      const routePath = fileToRoutePath(relative);

      return {
        path: routePath,
        name: routePathToName(routePath),
        head: definition.head ?? '',
        layout: definition.layout ?? LAYOUT_BY_GROUP[group] ?? 'default',
        robots: definition.robots ?? '',
        requiresAuth: definition.requiresAuth ?? false,
        dynamic: routePath.includes('['),
        devOnly: DEV_ONLY_GROUPS.includes(group),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function render(routes) {
  const entries = routes
    .map(
      (route) =>
        `  {\n` +
        `    path: '${route.path}',\n` +
        `    name: '${route.name}',\n` +
        `    head: ${JSON.stringify(route.head)},\n` +
        `    layout: '${route.layout}',\n` +
        `    robots: ${JSON.stringify(route.robots)},\n` +
        `    requiresAuth: ${route.requiresAuth},\n` +
        `    dynamic: ${route.dynamic},\n` +
        `    devOnly: ${route.devOnly},\n` +
        `  },`,
    )
    .join('\n');

  return (
    `// AUTO-GENERATED by scripts/generate-routes.mjs — do not edit.\n` +
    `import type { RouteRecord } from './routes';\n\n` +
    `export const routes: RouteRecord[] = [\n${entries}\n];\n`
  );
}

function main() {
  if (!fs.existsSync(APP_DIR)) {
    console.error(`[routes] ${APP_DIR} not found — nothing to scan.`);
    process.exit(1);
  }

  const routes = buildRoutes();
  const content = render(routes);

  for (const message of warnings) console.warn(`[routes] ${message}`);

  let current = '';
  try {
    current = fs.readFileSync(OUTPUT, 'utf8');
  } catch {
    /* first run — file doesn't exist yet */
  }
  if (current === content) return;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, content, 'utf8');
  console.log(`[routes] wrote ${OUTPUT} — ${routes.length} route(s).`);
}

main();
