/**
 * Dev server wrapper.
 *
 * Runs `next dev` untouched and slots the dev-tooling URLs into its startup
 * banner, so the route registry and theme studio are discoverable instead of
 * being something you have to already know about.
 *
 *   ▲ Next.js 16.3.1 (Turbopack)
 *   - Local:         http://localhost:3000
 *   - Network:       http://192.168.0.13:3000
 *   - Routes:        http://localhost:3000/dev/routes  (route registry)
 *   - Theme:         http://localhost:3000/dev/theme   (theme studio)
 *   ✓ Ready in 743ms
 *
 * Only stdout is piped — stdin and stderr stay attached to the terminal. Lines
 * are forwarded verbatim while the banner is being read, then the stream is
 * passed straight through, so Next's own output is never rewritten.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const DEV_GROUP_DIR = path.join('src', 'app', '(dev)');

const DEV_PAGES = [
  { segment: path.join('dev', 'routes'), label: 'Routes', note: 'route registry' },
  { segment: path.join('dev', 'theme'), label: 'Theme', note: 'theme studio' },
];

// Next aligns its banner URLs at column 17 — `- Local:` plus padding.
const URL_COLUMN = 17;
// If Next's banner ever stops short of a closing line, print ours anyway.
const BANNER_TIMEOUT_MS = 3000;

// Built from a char code so the escape byte never appears literally in source.
const ESCAPE = String.fromCharCode(27);
const ANSI_PATTERN = new RegExp(`${ESCAPE}\\[[0-9;]*m`, 'g');
const dim = (text) => `${ESCAPE}[2m${text}${ESCAPE}[22m`;

const availablePages = () =>
  DEV_PAGES.filter((page) => fs.existsSync(path.join(DEV_GROUP_DIR, page.segment, 'page.tsx'))).map(
    (page) => ({ ...page, route: `/${page.segment.split(path.sep).join('/')}` }),
  );

/** The extra banner lines, aligned with each other and with Next's own. */
const devToolingBanner = (localUrl) => {
  const pages = availablePages();
  if (pages.length === 0) return '';

  const base = localUrl.replace(/\/$/, '');
  const urlWidth = Math.max(...pages.map((page) => base.length + page.route.length));

  return pages
    .map((page) => {
      const label = `- ${page.label}:`.padEnd(URL_COLUMN, ' ');
      const url = `${base}${page.route}`.padEnd(urlWidth, ' ');
      return `${label}${url}  ${dim(`(${page.note})`)}`;
    })
    .join('\n');
};

const isBannerUrlLine = (line) => /^\s*[-•]?\s*(Local|Network):\s+https?:\/\//.test(line);
const localUrlIn = (line) => line.match(/Local:\s+(https?:\/\/\S+)/)?.[1];

const child = spawn('next', ['dev', ...process.argv.slice(2)], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: process.platform === 'win32',
  // Next drops color when stdout isn't a TTY; keep it since we pipe it through.
  env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
});

const write = (text) => process.stdout.write(text);

let pending = '';
let localUrl = '';
let bannerPrinted = false;
let bannerTimer = null;

const printDevToolingBanner = () => {
  if (bannerPrinted) return;
  bannerPrinted = true;
  if (bannerTimer) clearTimeout(bannerTimer);
  const lines = devToolingBanner(localUrl);
  if (lines) write(`${lines}\n`);
};

/**
 * Forwards one line. Once Next has printed its Local URL, the tooling lines go
 * out as soon as the banner's URL block ends — directly under Local/Network.
 */
const forwardLine = (line) => {
  const plain = line.replace(ANSI_PATTERN, '');

  if (!localUrl) {
    localUrl = localUrlIn(plain) ?? '';
    if (localUrl) bannerTimer = setTimeout(printDevToolingBanner, BANNER_TIMEOUT_MS);
    write(`${line}\n`);
    return;
  }

  if (isBannerUrlLine(plain)) {
    write(`${line}\n`);
    return;
  }

  printDevToolingBanner();
  write(`${line}\n`);
};

child.stdout.on('data', (chunk) => {
  // Once the banner is out there is nothing left to inject — stop buffering.
  if (bannerPrinted) {
    write(chunk);
    return;
  }

  pending += chunk.toString();
  const lines = pending.split('\n');
  pending = lines.pop() ?? '';
  lines.forEach(forwardLine);
});

child.stdout.on('end', () => {
  if (pending) write(pending);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', (code, signal) => {
  if (bannerTimer) clearTimeout(bannerTimer);
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
