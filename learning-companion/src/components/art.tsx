// Ascent art: gradients, Bayer dither and ASCII, all generated in code.
// Web gets subtle cursor/scroll reactions; native draws the same picture statically.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { asciiMountain, asciiRule, ditherPath, grainField, mountainField } from '../lib/dither';
import { useReduced } from './motion';
import { fontFor, usePalette } from './ui';

const web = Platform.OS === 'web';

function useSize() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
    const { width, height } = e.nativeEvent.layout;
    setSize(s => (Math.abs(s.w - width) < 2 && Math.abs(s.h - height) < 2 ? s : { w: width, h: height }));
  };
  return [size, onLayout] as const;
}

/** The page backdrop: the mode's vertical gradient plus a faint dithered haze at the foot. */
export function Backdrop({ haze = true }: { haze?: boolean }) {
  const c = usePalette();
  const [{ w, h }, onLayout] = useSize();
  const cell = 4;
  const bandH = 160;
  const path = useMemo(
    () =>
      haze && w && c.mode !== 'contrast'
        ? ditherPath(Math.ceil(w / cell), Math.ceil(bandH / cell), cell, (u, v) => v * 0.32)
        : '',
    [w, haze, c.mode],
  );
  return (
    <View pointerEvents="none" onLayout={onLayout} style={StyleSheet.absoluteFill}>
      {!!w && (
        <Svg width={w} height={h}>
          <Defs>
            <LinearGradient id="ascent-bg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={c.gradient[0]} />
              <Stop offset="1" stopColor={c.gradient[1]} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={w} height={h} fill="url(#ascent-bg)" />
          {!!path && (
            <Path
              d={path}
              fill={c.artSoft}
              opacity={c.dark ? 0.35 : 0.28}
              transform={`translate(0 ${h - bandH})`}
            />
          )}
        </Svg>
      )}
    </View>
  );
}

/** A dithered mountain picture (ordered Bayer dither). */
export function DitherMountain({
  height = 220,
  cell = 4,
  style,
  light = -0.6,
}: {
  height?: number;
  cell?: number;
  style?: ViewStyle;
  light?: number;
}) {
  const c = usePalette();
  const [{ w }, onLayout] = useSize();
  const path = useMemo(
    () => (w ? ditherPath(Math.ceil(w / cell), Math.ceil(height / cell), cell, mountainField(light)) : ''),
    [w, height, cell, light],
  );
  return (
    <View
      onLayout={onLayout}
      style={[{ height, width: '100%' }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {!!w && (
        <Svg width={w} height={height}>
          <Path d={path} fill={c.art} opacity={c.dark ? 0.85 : 0.9} />
        </Svg>
      )}
    </View>
  );
}

/** A dithered band used behind sections: density rises toward one edge. */
export function DitherBand({
  height = 120,
  flip = false,
  opacity = 0.5,
}: {
  height?: number;
  flip?: boolean;
  opacity?: number;
}) {
  const c = usePalette();
  const [{ w }, onLayout] = useSize();
  const cell = 4;
  const path = useMemo(() => {
    if (!w) return '';
    const g = grainField(5);
    return ditherPath(Math.ceil(w / cell), Math.ceil(height / cell), cell, (u, v) => {
      const t = flip ? 1 - v : v;
      return t * 0.42 + g(u, v) * 0.2;
    });
  }, [w, height, flip]);
  return (
    <View
      pointerEvents="none"
      onLayout={onLayout}
      style={{ height, width: '100%' }}
      accessibilityElementsHidden
    >
      {!!w && (
        <Svg width={w} height={height}>
          <Path d={path} fill={c.artSoft} opacity={opacity} />
        </Svg>
      )}
    </View>
  );
}

/**
 * The landing hero: an ASCII mountain. On web the sun follows the cursor across the
 * page and the stars drift with scroll. Reduce-motion and native keep it still.
 */
export function AsciiMountain({
  rows = 22,
  height,
  interactive = true,
}: {
  rows?: number;
  height?: number;
  interactive?: boolean;
}) {
  const c = usePalette();
  const reduced = useReduced();
  const [{ w }, onLayout] = useSize();
  const [light, setLight] = useState(-0.55);
  const [drift, setDrift] = useState(0);
  const frame = useRef(0);
  const fontSize = w < 520 ? 9 : 12;
  const charW = fontSize * 0.6;
  const cols = w ? Math.max(30, Math.floor(w / charW)) : 0;
  useEffect(() => {
    if (!web || !interactive || reduced || typeof window === 'undefined') return;
    let pending: { l?: number; d?: number } = {};
    const flush = () => {
      frame.current = 0;
      if (pending.l !== undefined) setLight(pending.l);
      if (pending.d !== undefined) setDrift(pending.d);
      pending = {};
    };
    const schedule = () => {
      if (!frame.current) frame.current = requestAnimationFrame(flush);
    };
    const move = (e: PointerEvent) => {
      pending.l = Math.round(((e.clientX / window.innerWidth) * 2 - 1) * 10) / 10;
      schedule();
    };
    const scroll = (e: Event) => {
      const t = e.target as HTMLElement | Document;
      const top = 'scrollTop' in t ? (t as HTMLElement).scrollTop : window.scrollY;
      pending.d = Math.floor(top / 40);
      schedule();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('scroll', scroll, true);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scroll, true);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [interactive, reduced]);
  const lines = useMemo(
    () => (cols ? asciiMountain(cols, rows, light, 7, drift) : []),
    [cols, rows, light, drift],
  );
  return (
    <View
      onLayout={onLayout}
      style={{ width: '100%', height: height ?? rows * Math.round(fontSize * 1.15), overflow: 'hidden' }}
      accessible
      accessibilityRole="image"
      accessibilityLabel="ASCII art of a mountain range"
    >
      <Text
        selectable={false}
        style={{
          ...fontFor('400', true),
          fontSize,
          lineHeight: Math.round(fontSize * 1.15),
          color: c.art,
          letterSpacing: 0,
          ...(web ? ({ whiteSpace: 'pre', userSelect: 'none' } as object) : {}),
        }}
      >
        {lines.join('\n')}
      </Text>
    </View>
  );
}

/** A small ASCII divider between sections. */
export function AsciiRule({
  width = 56,
  seed = 1,
  align = 'left',
}: {
  width?: number;
  seed?: number;
  align?: 'left' | 'center';
}) {
  const c = usePalette();
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      numberOfLines={1}
      selectable={false}
      style={{
        ...fontFor('400', true),
        fontSize: 13,
        lineHeight: 18,
        color: c.faint,
        textAlign: align,
        overflow: 'hidden',
        ...(web ? ({ whiteSpace: 'pre' } as object) : {}),
      }}
    >
      {asciiRule(width, seed)}
    </Text>
  );
}

/** Faint topographic contour lines: background texture only (never a slope). */
export function Contours({
  width,
  height,
  opacity = 0.5,
}: {
  width: number;
  height: number;
  opacity?: number;
}) {
  const c = usePalette();
  const paths = useMemo(() => {
    const out: string[] = [];
    const centres = [
      [0.22, 0.35],
      [0.7, 0.6],
      [0.5, 0.15],
    ];
    centres.forEach(([cx, cy], k) => {
      for (let r = 1; r <= 7; r++) {
        const pts: string[] = [];
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * Math.PI * 2;
          const wob = 1 + Math.sin(a * 3 + k + r * 0.6) * 0.08 + Math.cos(a * 5 + r) * 0.05;
          const rx = r * 46 * wob;
          const ry = r * 30 * wob;
          pts.push(
            `${(cx * width + Math.cos(a) * rx).toFixed(1)} ${(cy * height + Math.sin(a) * ry).toFixed(1)}`,
          );
        }
        out.push(`M${pts.join('L')}Z`);
      }
    });
    return out;
  }, [width, height]);
  if (!width || !height) return null;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {paths.map((d, i) => (
        <Path key={i} d={d} stroke={c.artSoft} strokeWidth={1} fill="none" opacity={opacity} />
      ))}
    </Svg>
  );
}
