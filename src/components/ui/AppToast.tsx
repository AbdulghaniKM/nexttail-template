'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useToastStore, type Toast } from '@/hooks/useToast';
import { AppIcon } from './AppIcon';

export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface AppToastProps {
  position?: ToastPosition;
}

const POSITION_CLASS: Record<ToastPosition, string> = {
  'top-left': 'inset-x-0 top-0 items-start sm:inset-x-auto sm:start-4 sm:top-4',
  'top-right': 'inset-x-0 top-0 items-end sm:inset-x-auto sm:end-4 sm:top-4',
  'bottom-left': 'inset-x-0 bottom-0 items-start sm:inset-x-auto sm:start-4 sm:bottom-4',
  'bottom-right': 'inset-x-0 bottom-0 items-end sm:inset-x-auto sm:end-4 sm:bottom-4',
};

const CONTAINER_CLASS: Record<Toast['type'], string> = {
  success: 'bg-surface border border-success/20 text-text',
  error: 'bg-surface border border-error/20 text-text',
  warning: 'bg-surface border border-warning/20 text-text',
  info: 'bg-surface border border-info/20 text-text',
};

const ICON_BG_CLASS: Record<Toast['type'], string> = {
  success: 'bg-success/15 text-success',
  error: 'bg-error/15 text-error',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/15 text-info',
};

const PROGRESS_CLASS: Record<Toast['type'], string> = {
  success: 'bg-success/40',
  error: 'bg-error/40',
  warning: 'bg-warning/40',
  info: 'bg-info/40',
};

const TOAST_ICON: Record<Toast['type'], string> = {
  success: 'icon-[heroicons-outline--check-circle]',
  error: 'icon-[heroicons-outline--x-circle]',
  warning: 'icon-[heroicons--exclamation-triangle]',
  info: 'icon-[heroicons-outline--information-circle]',
};

export function AppToast({ position = 'top-right' }: AppToastProps) {
  const toasts = useToastStore((state) => state.toasts);
  const remove = useToastStore((state) => state.remove);
  const pause = useToastStore((state) => state.pause);
  const resume = useToastStore((state) => state.resume);

  const isTop = position.startsWith('top');
  const enterOffset = isTop ? -12 : 12;
  const exitOffset = isTop ? -8 : 8;

  return (
    <div
      className={`pointer-events-none fixed z-[10000] flex flex-col gap-2.5 p-4 sm:max-w-sm ${POSITION_CLASS[position]}`}
      role="log"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`pointer-events-auto relative w-full overflow-hidden rounded-xl shadow-lg sm:max-w-sm ${CONTAINER_CLASS[toast.type]}`}
            role="alert"
            initial={{ opacity: 0, y: enterOffset, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: exitOffset, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => pause(toast.id)}
            onMouseLeave={() => resume(toast.id)}
            onFocusCapture={() => pause(toast.id)}
            onBlurCapture={() => resume(toast.id)}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${ICON_BG_CLASS[toast.type]}`}
              >
                <AppIcon name={TOAST_ICON[toast.type]} size={0.75} />
              </span>
              <div className="min-w-0 flex-1">
                {toast.title && <p className="text-sm leading-snug font-semibold">{toast.title}</p>}
                <p className={`text-sm leading-relaxed ${toast.title ? 'opacity-80' : ''}`}>
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg opacity-60 transition-opacity hover:opacity-100"
                aria-label="Dismiss notification"
                onClick={() => remove(toast.id)}
              >
                <AppIcon name="icon-[heroicons-outline--x-mark]" size={0.875} />
              </button>
            </div>
            {toast.duration != null && toast.duration > 0 && (
              <div
                className={`h-0.5 origin-left ${PROGRESS_CLASS[toast.type]}`}
                style={{
                  animation: `toast-progress ${toast.duration}ms linear forwards`,
                  animationPlayState: toast.paused ? 'paused' : 'running',
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default AppToast;
