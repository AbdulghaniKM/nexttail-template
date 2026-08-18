'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { appConfig } from '@/config/app.config';
import { ThemePersistence, type ThemeMode } from '@/lib/ThemePersistence';
import { getColorValue, getSystemTheme, type ColorPalette } from '@/utils/theme';

interface ThemeStore {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  hydrated: boolean;
  setTheme: (mode: ThemeMode) => void;
  hydrate: () => void;
  syncSystem: (prefersDark: boolean) => void;
}

const configuredMode: ThemeMode = appConfig.theme.defaultTheme ?? 'system';

// Server render and first client render share this state, so markup matches.
// `hydrate()` reconciles it with localStorage right after mount.
export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: configuredMode,
  resolved: configuredMode === 'dark' ? 'dark' : 'light',
  hydrated: false,

  setTheme: (mode) => {
    const resolved = ThemePersistence.resolveEffectiveAppearance(mode);
    ThemePersistence.writeAppearancePreference(mode === 'system' ? null : mode);
    ThemePersistence.applyAppearanceToDocument(mode);
    set({ mode, resolved });
  },

  hydrate: () => {
    if (get().hydrated) return;
    const storedMode = ThemePersistence.readPersistedAppearancePreference() ?? configuredMode;
    set({
      mode: storedMode,
      resolved: ThemePersistence.resolveEffectiveAppearance(storedMode),
      hydrated: true,
    });
  },

  syncSystem: (prefersDark) => {
    if (get().mode !== 'system') return;
    set({ resolved: prefersDark ? 'dark' : 'light' });
  },
}));

/**
 * Mounted once by `AppProviders`. Reconciles the store with the persisted
 * preference and keeps `system` mode following the OS setting.
 */
export const useThemeSync = (): void => {
  useEffect(() => {
    useThemeStore.getState().hydrate();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onSchemeChange = (event: MediaQueryListEvent) => {
      useThemeStore.getState().syncSystem(event.matches);
      if (useThemeStore.getState().mode === 'system') {
        ThemePersistence.applyAppearanceToDocument('system');
      }
    };

    mediaQuery.addEventListener('change', onSchemeChange);
    return () => mediaQuery.removeEventListener('change', onSchemeChange);
  }, []);
};

export const useTheme = () => {
  const mode = useThemeStore((state) => state.mode);
  const theme = useThemeStore((state) => state.resolved);
  const setTheme = useThemeStore((state) => state.setTheme);

  return {
    theme,
    mode,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    setTheme,
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
    getColor: (colorKey: keyof ColorPalette) => getColorValue(colorKey),
    colors: appConfig.theme[theme],
    systemTheme: getSystemTheme,
  };
};
