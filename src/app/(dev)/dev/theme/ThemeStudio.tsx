'use client';

import { useState } from 'react';
import { useAppUi } from '@/hooks/useAppUi';
import { useTheme } from '@/hooks/useTheme';
import type { ThemeMode } from '@/lib/ThemePersistence';

const MODES: readonly ThemeMode[] = ['system', 'light', 'dark'] as const;

const optionClass = (selected: boolean): string =>
  `rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
    selected
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-border text-text-secondary hover:bg-muted'
  }`;

export function ThemeStudio() {
  const { shape, shapes, setShape, reset } = useAppUi();
  const { mode, setTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const snippet = `export const theme: UiThemeConfig = {\n  shape: '${shape}',\n};`;

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-text">Theme studio</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Dev-only. Live-preview shape / theme mode. Colors come from{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">src/config/app.config.ts</code>.
        </p>
      </header>

      <section className="grid gap-6 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-text">Shape</h2>
          <div className="flex flex-wrap gap-2">
            {shapes.map((option) => (
              <button
                key={option}
                type="button"
                className={optionClass(shape === option)}
                onClick={() => setShape(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-text">Theme mode</h2>
          <div className="flex flex-wrap gap-2">
            {MODES.map((option) => (
              <button
                key={option}
                type="button"
                className={optionClass(mode === option)}
                onClick={() => setTheme(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-text">
          Paste into <code>src/theme.ts</code>
        </h2>
        <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs leading-relaxed">
          <code>{snippet}</code>
        </pre>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
            onClick={copySnippet}
          >
            Copy snippet
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-muted"
            onClick={reset}
          >
            Reset
          </button>
          {copied && <span className="self-center text-xs text-success">Copied.</span>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-text">Component gallery</h2>

        <div className="grid gap-6 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wider text-text-secondary uppercase">
              Buttons
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                Primary
              </button>
              <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white">
                Secondary
              </button>
              <button className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-text">
                Muted
              </button>
              <button className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-text">
                Outline
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium tracking-wider text-text-secondary uppercase">
              Surfaces
            </p>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium text-text">Card title</p>
              <p className="mt-0.5 text-xs text-text-secondary">Body copy on a surface.</p>
              <a href="#" className="mt-2 inline-block text-xs text-link hover:text-link-hover">
                A link
              </a>
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-medium tracking-wider text-text-secondary uppercase">
              State colors
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success">
                Success
              </div>
              <div className="rounded-lg bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
                Warning
              </div>
              <div className="rounded-lg bg-error/10 px-3 py-2 text-xs font-medium text-error">
                Error
              </div>
              <div className="rounded-lg bg-info/10 px-3 py-2 text-xs font-medium text-info">
                Info
              </div>
            </div>
          </div>

          <div className="sm:col-span-2">
            <p className="mb-2 text-xs font-medium tracking-wider text-text-secondary uppercase">
              Radius scale (reflects shape)
            </p>
            <div className="flex items-end gap-3">
              <div className="size-12 rounded-sm bg-primary/20" title="rounded-sm" />
              <div className="size-12 rounded-md bg-primary/20" title="rounded-md" />
              <div className="size-12 rounded-lg bg-primary/20" title="rounded-lg" />
              <div className="size-12 rounded-xl bg-primary/20" title="rounded-xl" />
              <div className="size-12 rounded-2xl bg-primary/20" title="rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
