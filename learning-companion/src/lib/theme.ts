// Colour modes for the "Ascent" identity. Pure (no React) so tests can import it.
export const THEME_MODES = ['system', 'dawn', 'dusk', 'terminal', 'contrast'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];
/** A concrete mode after "system" is resolved. */
export type ResolvedMode = Exclude<ThemeMode, 'system'>;
/** Values older notebooks and backups may still hold. */
export type LegacyTheme = 'light' | 'dark';

export const THEME_LABEL: Record<ThemeMode, string> = {
  system: 'System',
  dawn: 'Dawn',
  dusk: 'Dusk',
  terminal: 'Terminal',
  contrast: 'High contrast',
};
export const THEME_HINT: Record<ThemeMode, string> = {
  system: 'Dawn by day, Dusk when your device is dark',
  dawn: 'Warm paper and pale sky',
  dusk: 'Deep night blue, ice accents',
  terminal: 'Black, white and ASCII',
  contrast: 'Maximum legibility (WCAG AAA)',
};

/** Accept any stored value; old light/dark map onto Dawn/Dusk, anything unknown falls back to system. */
export function normalizeTheme(value: unknown): ThemeMode {
  if (value === 'light') return 'dawn';
  if (value === 'dark') return 'dusk';
  return (THEME_MODES as readonly unknown[]).includes(value) ? (value as ThemeMode) : 'system';
}
export const isThemeValue = (value: unknown) =>
  value === 'light' || value === 'dark' || (THEME_MODES as readonly unknown[]).includes(value);

export function resolveTheme(mode: unknown, system: 'light' | 'dark' | null | undefined): ResolvedMode {
  const m = normalizeTheme(mode);
  if (m !== 'system') return m;
  return system === 'light' ? 'dawn' : 'dusk';
}
export const isDarkMode = (m: ResolvedMode) => m === 'dusk' || m === 'terminal';

// --- WCAG helpers (used by tests to keep every palette at AA or better) ---
const channel = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export function luminance(hex: string) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, x => x + x) : h.slice(0, 6), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
