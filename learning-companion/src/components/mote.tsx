// Mote: a small round grain of sand drawn in dithered pixels. Original design.
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { threshold } from '../lib/dither';
import type { MoteMood } from '../lib/bubbles';
import { useReduced } from './motion';
import { fontFor, usePalette } from './ui';

const G = 16;
type Cell = [number, number];
const cellsToPath = (cells: Cell[]) => cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('');

/** Body mask: a slightly faceted, bottom-heavy grain. */
function inside(x: number, y: number) {
  const cx = 7.5;
  const cy = 8.6;
  const dx = (x + 0.5 - cx) / 6.7;
  const dy = (y + 0.5 - cy) / (y < cy ? 6.3 : 5.9);
  const facet = Math.abs(dx) + Math.abs(dy) * 0.9;
  return dx * dx + dy * dy <= 1 && facet < 1.32;
}

function bodyPaths() {
  const tones: Cell[][] = [[], [], []];
  const outline: Cell[] = [];
  for (let y = 0; y < G; y++)
    for (let x = 0; x < G; x++) {
      if (!inside(x, y)) continue;
      const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
      if (edge) {
        outline.push([x, y]);
        continue;
      }
      // Light from the top-left: 1 = lit, 0 = shade. Ordered dither between three tones.
      const nx = (x + 0.5 - 7.5) / 6.7;
      const ny = (y + 0.5 - 8.6) / 6.2;
      const lit = Math.max(0, Math.min(1, 0.62 - nx * 0.45 - ny * 0.55));
      const t = threshold(x, y);
      tones[lit > 0.66 + (t - 0.5) * 0.3 ? 0 : lit > 0.33 + (t - 0.5) * 0.3 ? 1 : 2].push([x, y]);
    }
  return { tones: tones.map(cellsToPath), outline: cellsToPath(outline) };
}
const BODY = bodyPaths();

function eyes(mood: MoteMood, blink: boolean, gx: number, gy: number): string {
  const cells: Cell[] = [];
  const ox = Math.max(-1, Math.min(1, gx));
  const oy = Math.max(-1, Math.min(1, gy));
  for (const ex of mood === 'celebrate' ? [4, 9] : [5, 9]) {
    const x = ex + ox;
    const y = 7 + oy;
    if (mood === 'celebrate') {
      cells.push([x, y + 1], [x + 1, y], [x + 2, y + 1]);
    } else if (mood === 'sleepy' || blink) {
      cells.push([x, y + 2], [x + 1, y + 2]);
    } else {
      cells.push([x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1], [x, y + 2], [x + 1, y + 2]);
    }
  }
  return cellsToPath(cells);
}

export function Mote({
  size = 56,
  mood = 'idle',
  gazeX = 0,
  gazeY = 0,
  still = false,
}: {
  size?: number;
  mood?: MoteMood;
  gazeX?: number;
  gazeY?: number;
  still?: boolean;
}) {
  const c = usePalette();
  const reduced = useReduced();
  const [blink, setBlink] = useState(false);
  const y = useSharedValue(0);
  const animate = !reduced && !still;

  useEffect(() => {
    if (!animate || mood !== 'idle') return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          setBlink(true);
          t = setTimeout(() => {
            setBlink(false);
            loop();
          }, 140);
        },
        2600 + Math.random() * 2600,
      );
    };
    loop();
    return () => clearTimeout(t);
  }, [animate, mood]);

  useEffect(() => {
    cancelAnimation(y);
    if (!animate) {
      y.set(0);
      return;
    }
    if (mood === 'celebrate')
      y.set(
        withRepeat(withSequence(withTiming(-10, { duration: 180 }), withTiming(0, { duration: 220 })), 4),
      );
    else if (mood === 'sleepy') y.set(withRepeat(withTiming(1.5, { duration: 1800 }), -1, true));
    else y.set(withRepeat(withTiming(-3, { duration: 1300 }), -1, true));
  }, [animate, mood, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
  const eyePath = useMemo(() => eyes(mood, blink, gazeX, gazeY), [mood, blink, gazeX, gazeY]);
  const outline = c.mode === 'terminal' ? '#FFFFFF' : c.dark ? '#E9D3A3' : '#3B2C14';
  const eye = c.mode === 'terminal' ? '#000000' : '#1B140B';
  const mouth =
    mood === 'celebrate'
      ? 'M7 11h2v2h-2z'
      : mood === 'sleepy'
        ? 'M7 12h2v1h-2z'
        : 'M7 12h1v1h-1zM8 12h1v1h-1z';
  const sparkles = 'M1 3h1v1h-1zM14 2h1v1h-1zM0 9h1v1h-1zM15 8h1v1h-1zM3 0h1v1h-1zM12 0h1v1h-1z';
  return (
    <Animated.View style={[{ width: size, height: size }, style]} accessible={false} pointerEvents="none">
      <Svg width={size} height={size} viewBox={`-1 -2 ${G + 2} ${G + 2}`}>
        <Path d={BODY.tones[0]} fill={c.mote[0]} />
        <Path d={BODY.tones[1]} fill={c.mote[1]} />
        <Path d={BODY.tones[2]} fill={c.mote[2]} />
        <Path d={BODY.outline} fill={outline} />
        {mood !== 'sleepy' && c.mode !== 'terminal' && (
          <Path d="M4 10h1v1h-1zM11 10h1v1h-1z" fill="#E59AA0" />
        )}
        <Path d={eyePath} fill={eye} />
        <Path d={mouth} fill={eye} />
        {mood === 'celebrate' && <Path d={sparkles} fill={c.accent} />}
        {mood === 'sleepy' && (
          <SvgText
            x={12.5}
            y={2}
            fontSize={4}
            fill={c.muted}
            fontFamily={String(fontFor('600', true).fontFamily)}
          >
            z
          </SvgText>
        )}
      </Svg>
    </Animated.View>
  );
}

/** A static Mote for empty states and the map marker. */
export function MoteBadge({ size = 40 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Mote size={size} still />
    </View>
  );
}
