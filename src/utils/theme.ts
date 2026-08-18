import type { ColorPalette, ThemeConfig } from '@/config/types';

export type { ColorPalette };

const camelToKebab = (value: string): string =>
  value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const generateColorVariables = (palette: ColorPalette): string =>
  Object.entries(palette)
    .filter(([, value]) => value)
    .map(([key, value]) => `  --color-${camelToKebab(key)}: ${value};`)
    .join('\n');

/**
 * Pure CSS text for both palettes. Rendered into the document head by the root
 * layout, so the server sends the correct colors and there is no flash.
 */
export const generateCSSVariables = (theme: ThemeConfig): string => {
  const lightVariables = generateColorVariables(theme.light);
  const darkVariables = generateColorVariables(theme.dark);

  return `:root {
${lightVariables}
}

[data-theme='dark'] {
${darkVariables}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
${darkVariables}
  }
}`;
};

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

let transitionTimer: ReturnType<typeof setTimeout> | null = null;

export const applyThemeToDOM = (theme: 'light' | 'dark' | 'system'): void => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Scope transitions to a ~300ms window after a theme swap. Avoids the
  // universal `* { transition }` perf cost on every hover/focus.
  root.classList.add('theme-switching');
  if (transitionTimer) clearTimeout(transitionTimer);
  transitionTimer = setTimeout(() => {
    root.classList.remove('theme-switching');
    transitionTimer = null;
  }, 300);

  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
};

export const getColorValue = (colorKey: keyof ColorPalette): string =>
  `var(--color-${camelToKebab(colorKey)})`;
