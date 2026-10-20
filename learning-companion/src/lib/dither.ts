// Procedural dither + ASCII art. Pure functions: the same seed draws the same
// picture on web and native, and tests can check them.

/** n×n Bayer threshold matrix (n a power of two), values in [0, 1). */
export function bayer(n: number): number[][] {
  let m = [[0]];
  while (m.length < n) {
    const s = m.length;
    const next: number[][] = Array.from({ length: s * 2 }, () => Array(s * 2).fill(0));
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++) {
        const v = m[y][x] * 4;
        next[y][x] = v;
        next[y][x + s] = v + 2;
        next[y + s][x] = v + 3;
        next[y + s][x + s] = v + 1;
      }
    m = next;
  }
  const total = n * n;
  return m.map(r => r.map(v => (v + 0.5) / total));
}
const B8 = bayer(8);
export const threshold = (x: number, y: number) => B8[((y % 8) + 8) % 8][((x % 8) + 8) % 8];

/** Deterministic value noise in [0, 1). */
export function hash(x: number, y: number, seed = 1) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function smooth1(x: number, seed: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash(i, 0, seed) * (1 - u) + hash(i + 1, 0, seed) * u;
}
/** A mountain ridge: height in [0, 1] for x in [0, 1]. Two peaks, a saddle, fine detail. */
export function ridge(x: number, seed = 7) {
  const peak = (c: number, w: number, h: number) => h * Math.max(0, 1 - Math.abs(x - c) / w) ** 1.35;
  const base = Math.max(peak(0.62, 0.42, 0.92), peak(0.3, 0.32, 0.66), peak(0.9, 0.25, 0.5), 0.12);
  const detail = (smooth1(x * 9, seed) - 0.5) * 0.08 + (smooth1(x * 23, seed + 3) - 0.5) * 0.035;
  return Math.min(1, Math.max(0, base + detail));
}

/**
 * Ordered-dither a field into one SVG path of square cells. `field(u, v)` returns
 * ink density in [0, 1] for normalised coordinates. One <Path> is cheap on native.
 */
export function ditherPath(
  cols: number,
  rows: number,
  cell: number,
  field: (u: number, v: number) => number,
): string {
  const parts: string[] = [];
  for (let y = 0; y < rows; y++) {
    let run = -1;
    for (let x = 0; x <= cols; x++) {
      const on = x < cols && field((x + 0.5) / cols, (y + 0.5) / rows) > threshold(x, y);
      if (on && run < 0) run = x;
      if (!on && run >= 0) {
        parts.push(`M${run * cell} ${y * cell}h${(x - run) * cell}v${cell}h${-(x - run) * cell}z`);
        run = -1;
      }
    }
  }
  return parts.join('');
}

/** Density field for the dithered mountain: lit faces thin, shadow faces dense, a soft horizon haze. */
export function mountainField(light = -0.6, seed = 7) {
  return (u: number, v: number) => {
    const h = ridge(u, seed);
    const top = 1 - h;
    if (v < top) {
      // sky: a faint gradient toward the horizon
      return Math.max(0, (v - 0.55) * 0.35);
    }
    const slope = (ridge(u + 0.004, seed) - ridge(u - 0.004, seed)) / 0.008;
    const lit = Math.max(-1, Math.min(1, slope * light));
    const depth = Math.min(1, (v - top) / 0.5);
    const snow = v - top < 0.06 && h > 0.6 ? -0.35 : 0;
    return Math.max(0, Math.min(1, 0.45 + lit * 0.3 + depth * 0.25 + snow));
  };
}

/** Grains: a sparse dust of sand that thickens toward the bottom. */
export function grainField(seed = 3) {
  return (u: number, v: number) =>
    hash(Math.floor(u * 400), Math.floor(v * 400), seed) < 0.5 ? v * 0.55 : 0;
}

const RAMP = ' .,:-=+*#%@';
/**
 * ASCII mountain, `rows` lines of `cols` characters. `light` in [-1, 1] moves the
 * sun from left to right; `lift` raises snow; `t` drifts the stars.
 */
export function asciiMountain(cols: number, rows: number, light = -0.5, seed = 7, t = 0): string[] {
  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    const v = (y + 0.5) / rows;
    for (let x = 0; x < cols; x++) {
      const u = (x + 0.5) / cols;
      const h = ridge(u, seed) * 0.86;
      const top = 1 - h;
      if (v < top) {
        const star = hash(x + Math.floor(t), y, seed + 11);
        line += star > 0.985 ? (star > 0.995 ? '+' : '.') : ' ';
        continue;
      }
      const slope = (ridge(u + 0.01, seed) - ridge(u - 0.01, seed)) / 0.02;
      const shade =
        0.42 +
        Math.max(-1, Math.min(1, slope * light)) * 0.34 +
        Math.min(1, (v - top) * 1.6) * 0.2 +
        (hash(x, y, seed + 5) - 0.5) * 0.18;
      const edge = v - top < 1 / rows;
      if (edge) line += slope > 0.25 ? '/' : slope < -0.25 ? '\\' : '_';
      else if (v - top < 2.2 / rows && h > 0.55) line += hash(x, y, seed) > 0.5 ? '^' : '.';
      else line += RAMP[Math.max(1, Math.min(RAMP.length - 1, Math.round(shade * (RAMP.length - 1))))];
    }
    lines.push(line);
  }
  return lines;
}

/** A small ASCII divider: `·  ·  /\  ·  ·` style, fixed width. */
export function asciiRule(width = 48, seed = 1) {
  const motifs = ['/\\', '/\\/\\', '^', '.'];
  let s = '';
  let i = 0;
  while (s.length < width) {
    const r = hash(i, 0, seed);
    s += r > 0.86 ? motifs[Math.floor(r * 10) % motifs.length] : r > 0.5 ? '·' : ' ';
    i++;
  }
  return s.slice(0, width);
}
