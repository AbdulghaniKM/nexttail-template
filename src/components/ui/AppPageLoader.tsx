'use client';

import { useEffect, useRef } from 'react';
import { create } from 'zustand';

interface PageLoaderStore {
  active: boolean;
  progress: number;
  fading: boolean;
  start: () => void;
  done: () => void;
}

const usePageLoaderStore = create<PageLoaderStore>((set, get) => ({
  active: false,
  progress: 0,
  fading: false,
  start: () => set({ active: true, fading: false, progress: 0.1 }),
  done: () => {
    if (!get().active) return;
    set({ progress: 1, fading: true });
  },
}));

/** Imperative handle — usable outside React (`pageLoader.start()` / `.done()`). */
export const pageLoader = {
  start: () => usePageLoaderStore.getState().start(),
  done: () => usePageLoaderStore.getState().done(),
};

const TRICKLE_INTERVAL_MS = 200;
const FADE_OUT_MS = 250;

/**
 * Thin progress bar pinned to the top of the viewport. Driven by
 * `pageLoader.start()` / `pageLoader.done()` — `RouteProgress` wires it to
 * navigations, and you can drive it manually for long-running work.
 */
export function AppPageLoader() {
  const active = usePageLoaderStore((state) => state.active);
  const progress = usePageLoaderStore((state) => state.progress);
  const fading = usePageLoaderStore((state) => state.fading);

  const trickleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || fading) return;

    trickleTimer.current = setInterval(() => {
      usePageLoaderStore.setState((state) =>
        state.progress < 0.9 ? { progress: state.progress + (0.9 - state.progress) * 0.15 } : state,
      );
    }, TRICKLE_INTERVAL_MS);

    return () => {
      if (trickleTimer.current) clearInterval(trickleTimer.current);
    };
  }, [active, fading]);

  useEffect(() => {
    if (!fading) return;

    fadeTimer.current = setTimeout(() => {
      usePageLoaderStore.setState({ active: false, progress: 0, fading: false });
    }, FADE_OUT_MS);

    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [fading]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[10001] h-0.5 bg-primary/20"
      role="progressbar"
      aria-label="Loading"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progress * 100}%`, opacity: fading ? 0 : 1 }}
      />
    </div>
  );
}

export default AppPageLoader;
