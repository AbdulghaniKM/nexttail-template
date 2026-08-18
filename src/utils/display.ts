export function display(value: unknown, fallback = '—'): string {
  if (value == null) return fallback;
  const text = String(value).trim();
  if (!text || text === 'N/A' || text === 'n/a') return fallback;
  return text;
}
