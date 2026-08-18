'use client';

import { useTheme } from '@/hooks/useTheme';
import { AppIcon } from './AppIcon';

const ICON_BY_THEME = {
  light: 'icon-[solar--sun-linear]',
  dark: 'icon-[solar--moon-linear]',
} as const;

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Theme: ${theme}`}
      className="inline-flex size-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      onClick={toggleTheme}
    >
      <AppIcon name={ICON_BY_THEME[theme]} size={1.125} />
    </button>
  );
}

export default ThemeToggle;
