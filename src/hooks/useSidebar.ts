'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

const STORAGE_KEY = 'app-sidebar-collapsed';

const readStoredCollapsed = (): boolean => {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const writeStoredCollapsed = (collapsed: boolean): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    if (collapsed) localStorage.setItem(STORAGE_KEY, '1');
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — the sidebar simply starts expanded next visit */
  }
};

interface SidebarStore {
  collapsed: boolean;
  mobileOpen: boolean;
  hydrated: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleMobile: () => void;
  closeMobile: () => void;
  hydrate: () => void;
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  collapsed: false,
  mobileOpen: false,
  hydrated: false,

  toggle: () => get().setCollapsed(!get().collapsed),

  setCollapsed: (collapsed) => {
    writeStoredCollapsed(collapsed);
    set({ collapsed });
  },

  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),

  closeMobile: () => set({ mobileOpen: false }),

  hydrate: () => {
    if (get().hydrated) return;
    set({ collapsed: readStoredCollapsed(), hydrated: true });
  },
}));

/** Mounted once by `AppProviders` — reconciles the collapsed flag with localStorage. */
export const useSidebarSync = (): void => {
  useEffect(() => {
    useSidebarStore.getState().hydrate();
  }, []);
};

export const useSidebar = () => {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const mobileOpen = useSidebarStore((state) => state.mobileOpen);
  const toggle = useSidebarStore((state) => state.toggle);
  const toggleMobile = useSidebarStore((state) => state.toggleMobile);
  const closeMobile = useSidebarStore((state) => state.closeMobile);

  return { collapsed, mobileOpen, isExpanded: !collapsed, toggle, toggleMobile, closeMobile };
};
