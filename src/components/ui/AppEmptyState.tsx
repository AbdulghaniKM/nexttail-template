import type { ReactNode } from 'react';
import { AppIcon } from './AppIcon';

export type EmptyStateVariant = 'neutral' | 'primary' | 'danger' | 'warning' | 'success' | 'info';

export interface AppEmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  variant?: EmptyStateVariant;
  children?: ReactNode;
}

const CONTAINER_CLASS: Record<EmptyStateVariant, string> = {
  neutral: 'bg-muted',
  primary: 'bg-primary/10',
  danger: 'bg-error/10',
  warning: 'bg-warning/10',
  success: 'bg-success/10',
  info: 'bg-info/10',
};

const ICON_CLASS: Record<EmptyStateVariant, string> = {
  neutral: 'text-text-secondary',
  primary: 'text-primary',
  danger: 'text-error',
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
};

export function AppEmptyState({
  icon,
  title,
  description,
  variant = 'neutral',
  children,
}: AppEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {icon && (
        <div
          className={`mb-4 flex size-16 items-center justify-center rounded-2xl ${CONTAINER_CLASS[variant]}`}
        >
          <AppIcon name={icon} size={2} className={ICON_CLASS[variant]} />
        </div>
      )}

      {title && <h2 className="mb-1 text-lg font-semibold text-text">{title}</h2>}
      {description && <p className="mb-6 max-w-md text-sm text-text-secondary">{description}</p>}

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export default AppEmptyState;
