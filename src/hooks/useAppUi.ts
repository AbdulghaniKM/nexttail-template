'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { theme as defaultTheme, type Shape } from '@/theme';

const SHAPE_KEY = 'app-shape';

const SHAPES: readonly Shape[] = ['square', 'rounded', 'pill'] as const;

const isShape = (value: string | null): value is Shape =>
  value !== null && (SHAPES as readonly string[]).includes(value);

const readStoredShape = (): Shape | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SHAPE_KEY);
    return isShape(raw) ? raw : null;
  } catch {
    return null;
  }
};

const writeStoredShape = (shape: Shape): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    // `rounded` is the stylesheet default — storing nothing keeps it authoritative.
    if (shape === 'rounded') localStorage.removeItem(SHAPE_KEY);
    else localStorage.setItem(SHAPE_KEY, shape);
  } catch {
    /* storage unavailable — shape falls back to the config default */
  }
};

const applyShapeToDocument = (shape: Shape): void => {
  if (typeof document === 'undefined') return;
  if (shape === 'rounded') document.documentElement.removeAttribute('data-shape');
  else document.documentElement.setAttribute('data-shape', shape);
};

interface AppUiStore {
  shape: Shape;
  hydrated: boolean;
  setShape: (shape: Shape) => void;
  hydrate: () => void;
  reset: () => void;
}

export const useAppUiStore = create<AppUiStore>((set, get) => ({
  shape: defaultTheme.shape,
  hydrated: false,

  setShape: (shape) => {
    writeStoredShape(shape);
    applyShapeToDocument(shape);
    set({ shape });
  },

  hydrate: () => {
    if (get().hydrated) return;
    set({ shape: readStoredShape() ?? defaultTheme.shape, hydrated: true });
  },

  reset: () => {
    get().setShape(defaultTheme.shape);
  },
}));

/** Mounted once by `AppProviders` — reconciles the shape knob with localStorage. */
export const useAppUiSync = (): void => {
  useEffect(() => {
    useAppUiStore.getState().hydrate();
  }, []);
};

export const useAppUi = () => {
  const shape = useAppUiStore((state) => state.shape);
  const setShape = useAppUiStore((state) => state.setShape);
  const reset = useAppUiStore((state) => state.reset);

  return { shape, shapes: SHAPES, setShape, reset };
};
