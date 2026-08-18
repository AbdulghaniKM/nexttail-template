import type { CSSProperties, HTMLAttributes } from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number | string;

export interface AppIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Iconify name. Pass `collection:name` (converted to the Iconify-Tailwind class form for you). */
  name?: string;
  size?: IconSize;
  color?: string;
}

const SIZE_CLASS: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const isNumericSize = (size: IconSize): boolean =>
  typeof size === 'number' || (typeof size === 'string' && /^\d/.test(size));

const toIconClass = (name?: string): string => {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.startsWith('icon-[')) return trimmed;
  // Convert `collection:name` → `collection--name` (Iconify-Tailwind form).
  return `icon-[${trimmed.replace(/:/g, '--')}]`;
};

const toFontSize = (size: IconSize): string | undefined => {
  if (typeof size === 'number') return `${size}rem`;
  if (typeof size === 'string' && /^\d/.test(size)) {
    return /[a-z%]+$/i.test(size) ? size : `${size}rem`;
  }
  return undefined;
};

export function AppIcon({
  name,
  size = 'md',
  color,
  className = '',
  style,
  ...rest
}: AppIconProps) {
  const sizeClass = isNumericSize(size) ? '' : (SIZE_CLASS[size as string] ?? SIZE_CLASS.md);
  const colorClass = color?.startsWith('text-') ? color : '';

  const inlineStyle: CSSProperties = { ...style };
  const fontSize = toFontSize(size);
  if (fontSize) inlineStyle.fontSize = fontSize;
  if (color && !color.startsWith('text-')) inlineStyle.color = color;

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center leading-none ${toIconClass(name)} ${sizeClass} ${colorClass} ${className}`}
      style={inlineStyle}
      {...rest}
    />
  );
}

export default AppIcon;
