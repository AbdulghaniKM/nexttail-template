import type { FontConfig, FontFamilyConfig, TypographyConfig } from '@/config/types';

const FORMAT_BY_EXTENSION: Record<string, string> = {
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  otf: 'opentype',
  eot: 'embedded-opentype',
};

const sourceUrl = (source: string): string => {
  const extension = source.split('.').pop()?.toLowerCase() ?? '';
  const format = FORMAT_BY_EXTENSION[extension];
  return format ? `url('${source}') format('${format}')` : `url('${source}')`;
};

const toWeightValue = (weight: FontConfig['weight']): string => {
  if (weight === undefined) return '400';
  if (Array.isArray(weight)) return weight.join(' ');
  return String(weight);
};

/** `@font-face` blocks for every font declared in the typography config. */
export const generateFontFaceCSS = (fonts: FontConfig[] = []): string =>
  fonts
    .map((font) => {
      const sources = (Array.isArray(font.src) ? font.src : [font.src]).map(sourceUrl).join(', ');
      return `@font-face {
  font-family: '${font.name}';
  src: ${sources};
  font-weight: ${toWeightValue(font.weight)};
  font-style: ${font.style ?? 'normal'};
  font-display: ${font.display ?? 'swap'};
}`;
    })
    .join('\n\n');

const familyStack = (family: FontFamilyConfig): string => {
  const fallbacks = family.fallbacks?.length ? `, ${family.fallbacks.join(', ')}` : '';
  return `'${family.family}'${fallbacks}`;
};

const variableName = (family: FontFamilyConfig, fallbackName: string): string => {
  const raw = family.cssVariable ?? fallbackName;
  return raw.startsWith('font-') ? `--${raw}` : `--font-${raw}`;
};

/** `:root` custom properties for the primary / secondary / mono families. */
export const generateFontVariablesCSS = (typography: TypographyConfig): string => {
  const declarations: string[] = [];

  const push = (family: FontFamilyConfig | undefined, fallbackName: string) => {
    if (!family) return;
    declarations.push(`  ${variableName(family, fallbackName)}: ${familyStack(family)};`);
    declarations.push(`  --font-${slugify(family.family)}: ${familyStack(family)};`);
  };

  push(typography.primary, 'font-primary');
  push(typography.secondary, 'font-secondary');
  push(typography.mono, 'font-mono');

  return `:root {\n${declarations.join('\n')}\n}`;
};

/** Descriptors for `<link rel="preload">` tags, for fonts flagged `preload`. */
export const fontPreloadSources = (fonts: FontConfig[] = []): string[] =>
  fonts
    .filter((font) => font.preload)
    .flatMap((font) => (Array.isArray(font.src) ? font.src : [font.src]));

export const slugify = (value: string): string => value.toLowerCase().replace(/\s+/g, '-');

export const getFontVariable = (fontName: string): string => `var(--font-${slugify(fontName)})`;

/**
 * Client-side loader for a font added after boot (e.g. a locale-specific face).
 * Config fonts are emitted as `@font-face` by the root layout and need no call.
 */
const loadedFonts = new Set<string>();

export const loadFont = async (config: FontConfig): Promise<void> => {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined') return;
  if (loadedFonts.has(config.name)) return;

  const sources = (Array.isArray(config.src) ? config.src : [config.src])
    .map((source) => `url(${source})`)
    .join(', ');

  const fontFace = new FontFace(config.name, sources, {
    weight: toWeightValue(config.weight),
    style: config.style ?? 'normal',
    display: config.display ?? 'swap',
  });

  await fontFace.load();
  document.fonts.add(fontFace);
  loadedFonts.add(config.name);
};
