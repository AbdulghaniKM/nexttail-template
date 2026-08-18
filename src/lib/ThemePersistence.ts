import { appConfig } from '@/config/app.config';
import { applyThemeToDOM, getSystemTheme } from '@/utils/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'app-theme';

function readPersistedLightOrDarkPreference(): 'light' | 'dark' | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (!raw) return null;
  const normalized = raw.startsWith('"') ? raw.slice(1, -1) : raw;
  return normalized === 'light' || normalized === 'dark' ? normalized : null;
}

function persistAppearancePreference(mode: ThemeMode | null): void {
  if (typeof localStorage === 'undefined') return;
  if (mode === null || mode === 'system') {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } else {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }
}

/**
 * Reads/writes theme choice in localStorage and keeps `documentElement` in sync.
 * The pre-boot script in the root layout stays self-contained; keep its key
 * aligned with `THEME_STORAGE_KEY`.
 */
export class ThemePersistence {
  private constructor() {}

  static readPersistedLightOrDark(): 'light' | 'dark' | null {
    return readPersistedLightOrDarkPreference();
  }

  static readPersistedAppearancePreference(): ThemeMode | null {
    return readPersistedLightOrDarkPreference();
  }

  static writeAppearancePreference(mode: ThemeMode | null): void {
    persistAppearancePreference(mode);
  }

  static resolveEffectiveAppearance(mode: ThemeMode | null | undefined): 'light' | 'dark' {
    if (mode === 'light' || mode === 'dark') return mode;
    return getSystemTheme();
  }

  static applyAppearanceToDocument(mode: ThemeMode): void {
    applyThemeToDOM(mode);
  }

  static synchronizeDocumentWithApplicationConfig(): void {
    if (typeof document === 'undefined') return;
    const storedPreference = readPersistedLightOrDarkPreference();
    const requestedMode = storedPreference ?? appConfig.theme.defaultTheme ?? 'system';
    const effectiveAppearance = requestedMode === 'system' ? getSystemTheme() : requestedMode;
    applyThemeToDOM(effectiveAppearance);
  }
}
