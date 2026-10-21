// Desktop: a VS Code-style side panel docked to the right. The page shrinks to
// make room (nothing is covered), the divider drags to resize, and it can be
// maximised. Phone: a full-height sheet that slides up and back down.
import { useEffect, useState } from 'react';
import { PanResponder, Platform, View, useWindowDimensions } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, {
  Easing,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssistant } from '../../ui/assistant-api';
import { useReduced } from '../motion';
import { usePalette, useWide } from '../ui';
import { ChatPanel } from './chat-panel';
import { chatUi, closeChat, setDockWidth, toggleChat, useChatUi } from './chat-store';

/** Keeps the assistant's unit context in step with the page. */
function useUnitContext() {
  const pathname = usePathname();
  const { context } = useAssistant();
  const unitId = /^\/unit\/([^/?#]+)/.exec(pathname)?.[1];
  useEffect(() => {
    context.setUnit(unitId ? decodeURIComponent(unitId) : undefined);
  }, [unitId, context]);
}

/** Ctrl/Cmd+I toggles the panel; Esc closes it (web). */
function useShortcuts() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleChat();
      } else if (e.key === 'Escape' && chatUi().open) closeChat();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

const EASE = Easing.bezier(0.2, 0.8, 0.2, 1);

export function ChatDock() {
  const c = usePalette();
  const ui = useChatUi();
  const reduced = useReduced();
  const { width: winW } = useWindowDimensions();
  const target = ui.open ? (ui.maximized ? winW : Math.min(ui.width, winW - 360)) : 0;
  const w = useSharedValue(0);
  const [mounted, setMounted] = useState(ui.open);
  const [dragging, setDragging] = useState(false);
  const [start] = useState({ w: 0 });
  useUnitContext();
  useShortcuts();

  if (ui.open && !mounted) setMounted(true);
  useEffect(() => {
    if (dragging) w.set(target);
    else w.set(reduced ? target : withTiming(target, { duration: 280, easing: EASE }));
    if (!ui.open) {
      const t = setTimeout(() => setMounted(false), reduced ? 0 : 300);
      return () => clearTimeout(t);
    }
  }, [target, ui.open, reduced, dragging, w]);

  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        start.w = chatUi().width;
        setDragging(true);
      },
      onPanResponderMove: (_, g) => setDockWidth(start.w - g.dx),
      onPanResponderRelease: (_, g) => {
        setDockWidth(start.w - g.dx, true);
        setDragging(false);
      },
      onPanResponderTerminate: () => setDragging(false),
    }),
  );

  const style = useAnimatedStyle(() => ({ width: w.get() }));
  const inner = ui.maximized ? winW : Math.min(ui.width, winW - 360);
  return (
    <Animated.View
      style={[
        {
          height: '100%',
          overflow: 'hidden',
          backgroundColor: c.bg,
          borderLeftWidth: mounted ? 1 : 0,
          borderColor: c.line,
        },
        ui.maximized && { position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 90 },
        style,
      ]}
    >
      {mounted && (
        <View style={{ width: inner, height: '100%', position: 'absolute', left: 0, top: 0 }}>
          <ChatPanel key={ui.nonce} draft={ui.draft} docked />
        </View>
      )}
      {mounted && !ui.maximized && (
        <View
          {...pan.panHandlers}
          accessibilityLabel="Resize the assistant panel"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            zIndex: 5,
            backgroundColor: dragging ? c.accent : 'transparent',
            ...(Platform.OS === 'web' ? ({ cursor: 'col-resize' } as object) : {}),
          }}
          nativeID="chat-resize"
        />
      )}
    </Animated.View>
  );
}

export function ChatSheet() {
  const c = usePalette();
  const ui = useChatUi();
  const insets = useSafeAreaInsets();
  const reduced = useReduced();
  useUnitContext();
  useShortcuts();
  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 80 }}
    >
      {ui.open && (
        <Animated.View
          accessibilityViewIsModal
          entering={reduced ? undefined : SlideInDown.duration(300).easing(EASE)}
          exiting={reduced ? undefined : SlideOutDown.duration(240).easing(EASE)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: c.bg,
          }}
        >
          <ChatPanel key={ui.nonce} draft={ui.draft} />
        </Animated.View>
      )}
    </View>
  );
}

/** Kept for older imports: renders the right container for the screen size. */
export function ChatHost() {
  const wide = useWide();
  return wide ? <ChatDock /> : <ChatSheet />;
}
