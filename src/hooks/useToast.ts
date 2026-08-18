'use client';

import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
  /** True while the dismissal timer is paused (hover/focus) — freezes the progress bar. */
  paused?: boolean;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}

interface TimerRecord {
  timeoutId: ReturnType<typeof setTimeout>;
  remaining: number;
  startedAt: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  remove: (id: string) => void;
  clear: () => void;
  pause: (id: string) => void;
  resume: (id: string) => void;
}

const timers = new Map<string, TimerRecord>();

let toastIdCounter = 0;

const generateId = (): string => `toast-${Date.now()}-${toastIdCounter++}`;

const clearTimer = (id: string): void => {
  const timer = timers.get(id);
  if (!timer) return;
  clearTimeout(timer.timeoutId);
  timers.delete(id);
};

export const useToastStore = create<ToastStore>((set, get) => {
  const startTimer = (id: string, duration: number) => {
    const timeoutId = setTimeout(() => get().remove(id), duration);
    timers.set(id, { timeoutId, remaining: duration, startedAt: Date.now() });
  };

  const setPaused = (id: string, paused: boolean) =>
    set((state) => ({
      toasts: state.toasts.map((toast) => (toast.id === id ? { ...toast, paused } : toast)),
    }));

  const add: ToastStore['add'] = (toast) => {
    const id = generateId();
    const created: Toast = { ...toast, id, duration: toast.duration ?? 5000 };
    set((state) => ({ toasts: [...state.toasts, created] }));
    if (created.duration && created.duration > 0) startTimer(id, created.duration);
    return id;
  };

  return {
    toasts: [],
    add,

    success: (message, options) => add({ type: 'success', message, ...options }),
    error: (message, options) => add({ type: 'error', message, ...options }),
    warning: (message, options) => add({ type: 'warning', message, ...options }),
    info: (message, options) => add({ type: 'info', message, ...options }),

    remove: (id) => {
      clearTimer(id);
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    },

    clear: () => {
      timers.forEach(({ timeoutId }) => clearTimeout(timeoutId));
      timers.clear();
      set({ toasts: [] });
    },

    pause: (id) => {
      const timer = timers.get(id);
      if (!timer) return;
      clearTimeout(timer.timeoutId);
      timers.set(id, {
        ...timer,
        remaining: Math.max(0, timer.remaining - (Date.now() - timer.startedAt)),
      });
      setPaused(id, true);
    },

    resume: (id) => {
      const timer = timers.get(id);
      if (!timer || timer.remaining <= 0) return;
      startTimer(id, timer.remaining);
      setPaused(id, false);
    },
  };
});

/**
 * Toast queue. The store is a module singleton, so `toast.success(...)` works
 * from anywhere — event handlers, effects, or the axios error interceptor.
 */
export const useToast = () => useToastStore();

/** Non-reactive handle for use outside React (interceptors, plain modules). */
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    useToastStore.getState().success(message, options),
  error: (message: string, options?: ToastOptions) =>
    useToastStore.getState().error(message, options),
  warning: (message: string, options?: ToastOptions) =>
    useToastStore.getState().warning(message, options),
  info: (message: string, options?: ToastOptions) =>
    useToastStore.getState().info(message, options),
  clear: () => useToastStore.getState().clear(),
};
