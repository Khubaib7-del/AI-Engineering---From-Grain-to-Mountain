// Desktop: a side panel docked right. Phone: a full-height sheet.
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { usePathname } from 'expo-router';
import Animated, { FadeIn, SlideInDown, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAssistant } from '../../ui/assistant-api';
import { useReduced } from '../motion';
import { usePalette, useWide } from '../ui';
import { ChatPanel } from './chat-panel';
import { closeChat, useChatUi } from './chat-store';

export function ChatHost() {
  const c = usePalette();
  const wide = useWide();
  const insets = useSafeAreaInsets();
  const reduced = useReduced();
  const ui = useChatUi();
  const pathname = usePathname();
  const { context } = useAssistant();
  const unitId = /^\/unit\/([^/?#]+)/.exec(pathname)?.[1];
  useEffect(() => {
    context.setUnit(unitId ? decodeURIComponent(unitId) : undefined);
  }, [unitId, context]);
  if (!ui.open) return null;
  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 80 }}
      pointerEvents="box-none"
    >
      {wide && (
        <Animated.View
          entering={reduced ? undefined : FadeIn.duration(160)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: c.dark ? 'rgba(0,0,0,.45)' : 'rgba(20,22,26,.18)',
          }}
        >
          <Pressable accessibilityLabel="Close assistant" onPress={closeChat} style={{ flex: 1 }} />
        </Animated.View>
      )}
      <Animated.View
        accessibilityViewIsModal
        entering={reduced ? undefined : wide ? SlideInRight.duration(240) : SlideInDown.duration(260)}
        style={{
          position: 'absolute',
          top: wide ? 12 : 0,
          right: wide ? 12 : 0,
          bottom: wide ? 12 : 0,
          left: wide ? undefined : 0,
          width: wide ? 460 : undefined,
          paddingTop: wide ? 0 : insets.top,
          paddingBottom: wide ? 0 : insets.bottom,
          backgroundColor: c.bg,
          borderRadius: wide ? 20 : 0,
          borderWidth: wide ? 1 : 0,
          borderColor: c.line,
          overflow: 'hidden',
          boxShadow: wide ? '0 24px 80px rgba(0,0,0,.35)' : undefined,
        }}
      >
        <ChatPanel draft={ui.draft} />
      </Animated.View>
    </View>
  );
}
