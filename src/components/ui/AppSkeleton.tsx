import type { CSSProperties } from 'react';

export interface AppSkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  lines?: number;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const toSize = (value: string | number | undefined): string | undefined => {
  if (value == null) return undefined;
  return typeof value === 'number' ? `${value}rem` : value;
};

const shapeClassFor = (variant: NonNullable<AppSkeletonProps['variant']>): string => {
  if (variant === 'circle') return 'rounded-full';
  if (variant === 'rect') return 'rounded-lg';
  return 'h-3 rounded';
};

export function AppSkeleton({
  variant = 'text',
  lines = 1,
  width,
  height,
  className = '',
}: AppSkeletonProps) {
  if (variant === 'text' && lines > 1) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={`app-skeleton block h-3 rounded bg-muted ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  const style: CSSProperties = {};
  const resolvedWidth = toSize(width);
  const resolvedHeight = toSize(height);
  if (resolvedWidth) style.width = resolvedWidth;
  if (resolvedHeight) style.height = resolvedHeight;

  return (
    <span
      className={`app-skeleton block bg-muted ${shapeClassFor(variant)} ${className}`}
      style={style}
    />
  );
}

export default AppSkeleton;
