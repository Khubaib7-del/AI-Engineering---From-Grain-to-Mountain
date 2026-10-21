// Mote: a round little grain of sand. Smooth vector art (crisp at any size),
// big glossy eyes that follow the pointer, blinking, breathing squash-and-stretch,
// and moods: idle, happy, thinking, talking, celebrate, sleepy. Original design.
import { useEffect, useId, useState } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { MoteMood } from '../lib/bubbles';
import { useReduced } from './motion';
import { fontFor, usePalette } from './ui';

// Body: a soft, slightly lopsided pebble, a little wider at the bottom.
const BODY =
  'M50 13C70.5 12.2 86.6 27.4 88.4 48.6C90.3 71.1 74.6 88.6 50.6 88.9C26.9 89.2 10.4 73.4 11.2 51.4C12 29.6 28.2 13.8 50 13Z';
const SPECKS: [number, number, number][] = [
  [27, 38, 1.3],
  [70, 31, 1.1],
  [77, 62, 1.4],
  [24, 70, 1.1],
  [62, 80, 1.2],
  [39, 24, 0.9],
];

type Tone = { hi: string; mid: string; lo: string; rim: string; eye: string; cheek: string; speck: string };

function tones(mode: string, dark: boolean, mote: [string, string, string]): Tone {
  if (mode === 'terminal')
    return { hi: '#FFFFFF', mid: '#E6E6E6', lo: '#BDBDBD', rim: '#FFFFFF', eye: '#000000', cheek: '#9A9A9A', speck: '#8A8A8A' };
  if (mode === 'contrast')
    return { hi: '#FFE9B8', mid: '#F2C477', lo: '#C98F3E', rim: dark ? '#FFFFFF' : '#000000', eye: '#111111', cheek: '#E77F8B', speck: '#9E6C2B' };
  return {
    hi: '#FFEFCB',
    mid: mote[0] ?? '#F3D9A4',
    lo: mote[1] ?? '#D9B26C',
    rim: dark ? '#6E4E22' : '#B4874A',
    eye: '#2A1D10',
    cheek: '#F29AA5',
    speck: mote[2] ?? '#9C7838',
  };
}

function Eyes({ mood, blink, gx, gy, t }: { mood: MoteMood; blink: boolean; gx: number; gy: number; t: Tone }) {
  const dx = Math.max(-1, Math.min(1, gx)) * 3.2;
  const dy = Math.max(-1, Math.min(1, gy)) * 2.6 + (mood === 'thinking' ? -3 : 0);
  const pos = [36.5, 63.5];
  const stroke = { stroke: t.eye, strokeWidth: 3.4, strokeLinecap: 'round' as const, fill: 'none' };
  if (mood === 'happy' || mood === 'celebrate')
    return (
      <G>
        {pos.map(x => (
          <Path key={x} d={`M${x - 6} ${54}Q${x} ${45.5} ${x + 6} ${54}`} {...stroke} />
        ))}
      </G>
    );
  if (mood === 'sleepy' || blink)
    return (
      <G>
        {pos.map(x => (
          <Path key={x} d={`M${x - 5.5 + dx} ${52 + dy}Q${x + dx} ${56.5 + dy} ${x + 5.5 + dx} ${52 + dy}`} {...stroke} />
        ))}
      </G>
    );
  return (
    <G>
      {pos.map(x => (
        <G key={x}>
          <Ellipse cx={x + dx} cy={51 + dy} rx={6.1} ry={7.6} fill={t.eye} />
          <Circle cx={x + dx + 2.1} cy={48 + dy} r={2.5} fill="#FFFFFF" />
          <Circle cx={x + dx - 2} cy={54.2 + dy} r={1.1} fill="#FFFFFF" opacity={0.85} />
        </G>
      ))}
    </G>
  );
}

function Mouth({ mood, open, t }: { mood: MoteMood; open: boolean; t: Tone }) {
  if (mood === 'celebrate' || (mood === 'happy' && open))
    return (
      <G>
        <Path d="M42.5 62.5Q50 74 57.5 62.5Z" fill={t.eye} />
        <Path d="M46 67.6Q50 70.6 54 67.6Q50 65.6 46 67.6Z" fill="#F07C8A" />
      </G>
    );
  if (mood === 'talking')
    return open ? (
      <Ellipse cx={50} cy={65.5} rx={3.6} ry={3.4} fill={t.eye} />
    ) : (
      <Path d="M46 64.5Q50 67.5 54 64.5" stroke={t.eye} strokeWidth={2.6} strokeLinecap="round" fill="none" />
    );
  if (mood === 'thinking') return <Circle cx={53} cy={65.5} r={2.2} fill={t.eye} />;
  if (mood === 'sleepy') return <Ellipse cx={50} cy={65.5} rx={2.3} ry={1.6} fill={t.eye} />;
  return <Path d="M45 63.6Q50 68.8 55 63.6" stroke={t.eye} strokeWidth={2.8} strokeLinecap="round" fill="none" />;
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
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const y = useSharedValue(0);
  const sx = useSharedValue(1);
  const sy = useSharedValue(1);
  const rot = useSharedValue(0);
  const animate = !reduced && !still;
  const t = tones(c.mode, c.dark, c.mote);

  // Blink at a natural, irregular rhythm (sometimes a double blink).
  useEffect(() => {
    if (reduced || mood === 'sleepy' || mood === 'happy' || mood === 'celebrate') return;
    let timer: ReturnType<typeof setTimeout>;
    const loop = () => {
      timer = setTimeout(
        () => {
          setBlink(true);
          timer = setTimeout(() => {
            setBlink(false);
            if (Math.random() < 0.2)
              timer = setTimeout(() => {
                setBlink(true);
                timer = setTimeout(() => {
                  setBlink(false);
                  loop();
                }, 110);
              }, 160);
            else loop();
          }, 120);
        },
        2400 + Math.random() * 3200,
      );
    };
    loop();
    return () => clearTimeout(timer);
  }, [reduced, mood]);

  // Talking: the mouth flaps while a reply streams.
  useEffect(() => {
    if (mood !== 'talking' || reduced) return;
    const i = setInterval(() => setMouthOpen(o => !o), 150);
    return () => clearInterval(i);
  }, [mood, reduced]);

  useEffect(() => {
    [y, sx, sy, rot].forEach(v => cancelAnimation(v));
    if (!animate) {
      y.set(0);
      sx.set(1);
      sy.set(1);
      rot.set(0);
      return;
    }
    const ease = Easing.inOut(Easing.sin);
    if (mood === 'celebrate') {
      y.set(withRepeat(withSequence(withTiming(-size * 0.16, { duration: 200, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) })), 4));
      sy.set(withRepeat(withSequence(withTiming(1.06, { duration: 200 }), withTiming(0.9, { duration: 120 }), withTiming(1, { duration: 100 })), 4));
      sx.set(withRepeat(withSequence(withTiming(0.95, { duration: 200 }), withTiming(1.1, { duration: 120 }), withTiming(1, { duration: 100 })), 4));
      rot.set(withRepeat(withSequence(withTiming(-6, { duration: 210 }), withTiming(6, { duration: 210 })), 4, true));
    } else if (mood === 'sleepy') {
      sy.set(withRepeat(withTiming(0.96, { duration: 2200, easing: ease }), -1, true));
      sx.set(withRepeat(withTiming(1.03, { duration: 2200, easing: ease }), -1, true));
      rot.set(withTiming(-5, { duration: 600 }));
    } else if (mood === 'thinking') {
      rot.set(withRepeat(withSequence(withTiming(-5, { duration: 900, easing: ease }), withTiming(4, { duration: 900, easing: ease })), -1, true));
      y.set(withRepeat(withTiming(-size * 0.03, { duration: 900, easing: ease }), -1, true));
    } else if (mood === 'talking') {
      y.set(withRepeat(withTiming(-size * 0.035, { duration: 300, easing: ease }), -1, true));
      sy.set(withRepeat(withTiming(1.025, { duration: 300, easing: ease }), -1, true));
    } else if (mood === 'happy') {
      y.set(withSequence(withSpring(-size * 0.1, { stiffness: 400, damping: 12 }), withSpring(0, { stiffness: 300, damping: 14 })));
      rot.set(withSequence(withTiming(-7, { duration: 160 }), withSpring(0, { stiffness: 220, damping: 8 })));
    } else {
      // Idle: slow breathing with a gentle bob.
      y.set(withRepeat(withTiming(-size * 0.045, { duration: 1500, easing: ease }), -1, true));
      sy.set(withRepeat(withTiming(1.025, { duration: 1500, easing: ease }), -1, true));
      sx.set(withRepeat(withTiming(0.985, { duration: 1500, easing: ease }), -1, true));
    }
  }, [animate, mood, size, y, sx, sy, rot]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: y.get() + (1 - sy.get()) * size * 0.4 },
      { rotate: `${rot.get()}deg` },
      { scaleX: sx.get() },
      { scaleY: sy.get() },
    ],
  }));
  const shadow = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + y.get() / (size * 0.9) }],
    opacity: 0.18 + y.get() / (size * 2.2),
  }));

  const showShadow = size >= 40;
  return (
    <View style={{ width: size, height: size }} accessible={false} pointerEvents="none">
      {showShadow && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: size * 0.26,
              right: size * 0.26,
              bottom: size * 0.04,
              height: size * 0.07,
              borderRadius: size,
              backgroundColor: c.dark ? '#000' : '#3B2C14',
            },
            shadow,
          ]}
        />
      )}
      <Animated.View style={[{ width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id={`b${uid}`} cx="38%" cy="32%" r="72%">
              <Stop offset="0" stopColor={t.hi} />
              <Stop offset="0.55" stopColor={t.mid} />
              <Stop offset="1" stopColor={t.lo} />
            </RadialGradient>
            <LinearGradient id={`s${uid}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {/* Little feet */}
          <Ellipse cx={39} cy={88.5} rx={7.5} ry={4.2} fill={t.lo} stroke={t.rim} strokeWidth={2} />
          <Ellipse cx={61} cy={88.5} rx={7.5} ry={4.2} fill={t.lo} stroke={t.rim} strokeWidth={2} />
          <Path d={BODY} fill={`url(#b${uid})`} stroke={t.rim} strokeWidth={2.4} />
          {SPECKS.map(([x, yy, r]) => (
            <Circle key={`${x}-${yy}`} cx={x} cy={yy} r={r} fill={t.speck} opacity={0.45} />
          ))}
          {/* Shine */}
          <Path d="M27 34C30 24 40 18.5 49 18.5C42 22 35 28 31.5 37C30 40.5 25.8 38.5 27 34Z" fill={`url(#s${uid})`} />
          {mood !== 'sleepy' && (
            <G opacity={c.mode === 'terminal' ? 0.5 : 0.6}>
              <Ellipse cx={25.5} cy={62} rx={6} ry={3.6} fill={t.cheek} />
              <Ellipse cx={74.5} cy={62} rx={6} ry={3.6} fill={t.cheek} />
            </G>
          )}
          <Eyes mood={mood} blink={blink} gx={gazeX} gy={gazeY} t={t} />
          <Mouth mood={mood} open={mood === 'talking' ? mouthOpen : mood === 'celebrate'} t={t} />
          {mood === 'celebrate' && (
            <G fill={c.mode === 'terminal' ? '#FFFFFF' : '#FFC94A'}>
              <Path d="M10 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
              <Path d="M88 12l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" />
              <Circle cx={92} cy={40} r={2} />
            </G>
          )}
          {mood === 'thinking' && (
            <G fill={c.mode === 'terminal' ? '#FFFFFF' : c.dark ? '#DCE3EE' : '#5A6170'}>
              <Circle cx={82} cy={20} r={2.4} />
              <Circle cx={89} cy={12} r={3.2} />
            </G>
          )}
          {mood === 'sleepy' && (
            <SvgText x={76} y={20} fontSize={16} fill={c.muted} fontFamily={String(fontFor('600', true).fontFamily)}>
              z
            </SvgText>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}

/** A static Mote for empty states and the map marker. */
export function MoteBadge({ size = 40 }: { size?: number }) {
  return <Mote size={size} still />;
}
