// Mote lives bottom-right on every in-app screen and speaks the next step.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gaze, moteMood, nextStepBubbles, type Bubble, type MoteMood } from '../lib/bubbles';
import { useLearning } from '../lib/store';
import { useNextSteps } from '../ui/assistant-api';
import { Mote } from './mote';
import { useReduced } from './motion';
import { Icon, Label, Txt, usePalette, useWide } from './ui';
import { notePointer, onPointer, openChat, useChatUi } from './chat/chat-store';

const HIDDEN = ['/start', '/signin', '/signup', '/welcome', '/privacy', '/download', '/account'];
const TAB_ROUTES = ['/today', '/map', '/progress', '/library'];
const SIZE = 60;

function BubbleCloud({ b, onPress }: { b: Bubble; onPress: () => void }) {
  const c = usePalette();
  const now = b.key === 'now';
  return (
    <Pressable
      testID={`mote-bubble-${b.key}`}
      accessibilityRole="link"
      accessibilityLabel={`${b.prefix}: ${b.text}. Open`}
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({
        alignSelf: 'flex-end',
        maxWidth: 300,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: c.mode === 'terminal' ? 4 : 20,
        borderBottomRightRadius: now ? 6 : c.mode === 'terminal' ? 4 : 20,
        backgroundColor: now ? c.surface : c.raised,
        borderWidth: now ? 1.5 : 1,
        borderColor: now ? c.accent : c.line,
        gap: 4,
        opacity: pressed ? 0.85 : now ? 1 : 0.97,
        transform: [{ translateY: hovered ? -1 : 0 }],
        boxShadow:
          c.mode === 'contrast'
            ? 'none'
            : c.dark
              ? '0 10px 30px rgba(0,0,0,.45)'
              : '0 10px 28px rgba(30,40,70,.16)',
      })}
    >
      <Label color={now ? c.accentText : c.muted}>
        {c.mode === 'terminal' ? `${b.prefix.toLowerCase()}:` : b.prefix}
      </Label>
      <Txt size={16} weight={now ? '600' : '500'}>
        {b.text}
      </Txt>
    </Pressable>
  );
}

export function MoteHost() {
  const c = usePalette();
  const pathname = usePathname();
  const wide = useWide();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduced = useReduced();
  const { state, loaded } = useLearning();
  const steps = useNextSteps();
  const chat = useChatUi();
  const [dismissed, setDismissed] = useState<string>();
  const [collapsed, setCollapsed] = useState(false);
  const [look, setLook] = useState({ x: 0 as -1 | 0 | 1, y: 0 as -1 | 0 | 1 });
  const [mood, setMood] = useState<MoteMood>('idle');
  const lastActive = useRef(0);
  const celebrateUntil = useRef(0);
  const passedCount = useMemo(
    () => Object.values(state.units ?? {}).filter(u => u.passedAt).length,
    [state.units],
  );
  const prevPassed = useRef<number | null>(null);
  useEffect(() => {
    if (!loaded) return;
    if (prevPassed.current !== null && passedCount > prevPassed.current) {
      celebrateUntil.current = Date.now() + 2600;
      setMood('celebrate');
      setCollapsed(false);
      const t = setTimeout(() => setMood('idle'), 2700);
      prevPassed.current = passedCount;
      return () => clearTimeout(t);
    }
    prevPassed.current = passedCount;
  }, [passedCount, loaded]);

  const onTabs = TAB_ROUTES.some(r => pathname.startsWith(r));
  const bottom = insets.bottom + (!wide && onTabs ? 84 : 20);
  const right = wide ? 28 : 16;
  const centre = { x: width - right - SIZE / 2, y: height - bottom - SIZE / 2 };

  useEffect(() => {
    lastActive.current = lastActive.current || Date.now();
    const wake = () => setMood(m => (m === 'sleepy' ? 'idle' : m));
    const off = onPointer(p => {
      lastActive.current = p.at;
      wake();
      setLook(gaze(p.x - centre.x, p.y - centre.y, 40));
    });
    let detach = () => {};
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const move = (e: PointerEvent) => notePointer(e.clientX, e.clientY);
      const key = () => {
        lastActive.current = Date.now();
        wake();
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('keydown', key);
      window.addEventListener('scroll', key, true);
      detach = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('keydown', key);
        window.removeEventListener('scroll', key, true);
      };
    }
    const t = setInterval(
      () => setMood(moteMood(Date.now(), lastActive.current, celebrateUntil.current)),
      10_000,
    );
    return () => {
      off();
      detach();
      clearInterval(t);
    };
  }, [centre.x, centre.y]);

  const onboarded = !!state.profile?.onboarded;
  const bubbles: Bubble[] = useMemo(() => {
    if (!onboarded)
      return (
        [
          {
            key: 'now',
            prefix: 'Now',
            text: 'Set up your path. It takes about a minute.',
            href: '/start',
            id: 'setup',
          } as Bubble,
          ...nextStepBubbles(steps)
            .slice(0, 1)
            .map(b => ({
              ...b,
              key: 'then' as const,
              prefix: 'Then' as const,
              text: `Your first unit: ${b.text.replace(/^Watch /, '')}`,
            })),
        ] as Bubble[]
      ).filter(b => b.id !== dismissed);
    return nextStepBubbles(steps, dismissed);
  }, [steps, dismissed, onboarded]);

  if (!loaded || HIDDEN.some(h => pathname.startsWith(h)) || chat.open) return null;
  if (pathname === '/' && Platform.OS !== 'web') return null;
  const celebrating = mood === 'celebrate';
  const showBubbles = !collapsed && (bubbles.length > 0 || celebrating);
  const go = (href?: string) => href && router.push(href as never);

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        right,
        bottom,
        alignItems: 'flex-end',
        gap: 10,
        zIndex: 60,
        maxWidth: Math.min(340, width - 32),
      }}
    >
      {showBubbles && (
        <Animated.View
          entering={reduced ? undefined : FadeInDown.duration(260)}
          exiting={reduced ? undefined : FadeOut.duration(140)}
          style={{ gap: 8, alignItems: 'flex-end' }}
        >
          {celebrating ? (
            <View
              accessibilityLiveRegion="polite"
              style={{ padding: 14, borderRadius: 20, backgroundColor: c.accent, maxWidth: 300 }}
            >
              <Txt size={16} weight="600" color={c.onAccent}>
                Unit passed. Nice climbing!
              </Txt>
            </View>
          ) : (
            bubbles.map(b => <BubbleCloud key={b.key} b={b} onPress={() => go(b.href)} />)
          )}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Pressable
              testID="mote-tell-more"
              accessibilityRole="button"
              accessibilityLabel="Tell me more: open the assistant"
              onPress={() => openChat()}
              style={({ pressed }) => ({
                minHeight: 40,
                paddingHorizontal: 14,
                borderRadius: 999,
                justifyContent: 'center',
                backgroundColor: c.ink,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Txt size={15} raw weight="600" color={c.bg}>
                Tell me more
              </Txt>
            </Pressable>
            <Pressable
              testID="mote-dismiss"
              accessibilityRole="button"
              accessibilityLabel="Dismiss Mote's tips"
              onPress={() => {
                setDismissed(onboarded ? steps.now.id : 'setup');
                setCollapsed(true);
              }}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: c.surface,
                borderWidth: 1,
                borderColor: c.edge,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Icon name="close" size={16} color={c.ink} />
            </Pressable>
          </View>
        </Animated.View>
      )}
      <Pressable
        testID="mote"
        accessibilityRole="button"
        accessibilityLabel={
          showBubbles ? 'Mote, your guide. Hide tips' : 'Mote, your guide. Show the next step'
        }
        onPress={() => {
          lastActive.current = Date.now();
          setMood(m => (m === 'sleepy' ? 'idle' : m));
          if (collapsed) {
            setDismissed(undefined);
            setCollapsed(false);
          } else setCollapsed(true);
        }}
        onLongPress={() => openChat()}
        style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}
      >
        <Mote size={SIZE} mood={mood} gazeX={look.x} gazeY={look.y} />
      </Pressable>
    </View>
  );
}
