// The assistant panel, laid out like an editor's chat sidebar: a slim header
// with Chat / History tabs and actions, the thread, and a composer with the
// unit context, a live model picker and send / stop.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, ZoomIn } from 'react-native-reanimated';
import { findUnit } from '../../lib/content';
import type { MoteMood } from '../../lib/bubbles';
import { useAssistant, type ChatMessage } from '../../ui/assistant-api';
import { Icon, Txt, fontFor, usePalette } from '../ui';
import { MotionPress, useReduced } from '../motion';
import { Mote } from '../mote';
import { Markdown } from './markdown';
import { AssistantSetup } from './assistant-setup';
import { HistoryView, IconBtn, ModelPopover, SettingsView, ThinkingDots, pointer } from './chat-parts';
import { closeChat, setChatView, toggleMaximized, useChatUi } from './chat-store';

const web = Platform.OS === 'web';

function promptsFor(unitId?: string): { icon: string; text: string }[] {
  const found = unitId ? findUnit(unitId) : undefined;
  if (!found)
    return [
      { icon: 'sunny-outline', text: 'What should I study today?' },
      { icon: 'bulb-outline', text: 'Explain the difference between AI, ML and deep learning' },
      { icon: 'calendar', text: 'How do I stay consistent with 8 hours a week?' },
      { icon: 'route', text: 'Which role fits me: AI Engineer, FDE or MLOps?' },
    ];
  const { unit } = found;
  return [
    { icon: 'bulb-outline', text: `Explain “${unit.title}” in plain words` },
    { icon: 'school-outline', text: unit.covers[0] ? `Quiz me on ${unit.covers[0]}` : 'Quiz me on this unit' },
    { icon: 'hammer', text: `Help me start the practice: ${unit.practice.title}` },
    { icon: 'route', text: 'Why does this unit matter for an AI engineer?' },
  ];
}

function copyText(t: string) {
  if (web && typeof navigator !== 'undefined' && navigator.clipboard) return navigator.clipboard.writeText(t);
  return Promise.resolve();
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  if (!web) return null;
  return (
    <IconBtn
      icon={done ? 'checkmark' : 'copy'}
      label={done ? 'Copied' : 'Copy'}
      size={28}
      iconSize={14}
      onPress={() =>
        void copyText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        })
      }
    />
  );
}

function Message({
  m,
  last,
  model,
  onRegenerate,
}: {
  m: ChatMessage;
  last: boolean;
  model?: string;
  onRegenerate: () => void;
}) {
  const c = usePalette();
  const reduced = useReduced();
  const [hover, setHover] = useState(false);
  const enter = reduced ? undefined : FadeInDown.duration(220);
  if (m.role === 'user')
    return (
      <Animated.View
        entering={enter}
        style={{ alignItems: 'flex-end', gap: 4 }}
        // @ts-expect-error web hover events on View
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <View
          style={{
            maxWidth: '88%',
            backgroundColor: c.soft,
            borderRadius: c.mode === 'terminal' ? 4 : 14,
            borderBottomRightRadius: 4,
            paddingVertical: 9,
            paddingHorizontal: 13,
          }}
        >
          <Txt size={15} raw selectable style={{ lineHeight: 23 }}>
            {m.text}
          </Txt>
        </View>
        <View style={{ height: 28, opacity: hover ? 1 : 0, flexDirection: 'row' }}>
          <CopyBtn text={m.text} />
        </View>
      </Animated.View>
    );
  const streaming = m.status === 'streaming';
  return (
    <Animated.View
      entering={enter}
      style={{ gap: 8 }}
      // @ts-expect-error web hover events on View
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Mote size={22} mood={streaming ? (m.text ? 'talking' : 'thinking') : 'idle'} still={!streaming} />
        <Txt raw size={13} weight="600">
          Mote
        </Txt>
        {!!model && (
          <Txt raw size={12} mono color={c.faint} numberOfLines={1} style={{ flexShrink: 1 }}>
            {model}
          </Txt>
        )}
      </View>
      <View style={{ paddingLeft: 2 }}>
        {m.text ? (
          <Markdown text={m.text + (streaming ? ' ▍' : '')} />
        ) : streaming ? (
          <ThinkingDots />
        ) : null}
        {m.status === 'error' && (
          <View
            style={{
              marginTop: 8,
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              padding: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: c.danger,
            }}
          >
            <Icon name="warning" size={14} color={c.danger} />
            <Txt size={13} raw color={c.danger} style={{ flex: 1 }}>
              The reply failed.
            </Txt>
            <Pressable onPress={onRegenerate} style={pointer()}>
              <Txt size={13} raw weight="600" color={c.danger}>
                Retry
              </Txt>
            </Pressable>
          </View>
        )}
      </View>
      {!streaming && m.text && (
        <View style={{ flexDirection: 'row', gap: 2, height: 28, opacity: hover || last || !web ? 1 : 0 }}>
          <CopyBtn text={m.text} />
          {last && (
            <IconBtn testID="chat-regenerate" icon="refresh" label="Regenerate" size={28} iconSize={14} onPress={onRegenerate} />
          )}
        </View>
      )}
    </Animated.View>
  );
}

function Header({ docked, mood }: { docked: boolean; mood: MoteMood }) {
  const c = usePalette();
  const a = useAssistant();
  const ui = useChatUi();
  const ready = a.status === 'ready' || (a.status === 'error' && !!a.config) || a.status === 'checking';
  const tabs: { id: 'chat' | 'history'; label: string }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'history', label: 'History' },
  ];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 10,
        paddingRight: 8,
        height: 48,
        borderBottomWidth: 1,
        borderColor: c.line,
      }}
    >
      <View style={{ marginRight: 4 }}>
        <Mote size={26} mood={mood} />
      </View>
      {ui.view === 'settings' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flex: 1 }}>
          <IconBtn icon="chevron-back" label="Back to chat" onPress={() => setChatView('chat')} />
          <Txt raw size={14} weight="600">
            Settings
          </Txt>
        </View>
      ) : (
        <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 2, flex: 1 }}>
          {tabs.map(t => {
            const on = ui.view === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setChatView(t.id)}
                style={({ hovered }: { pressed: boolean; hovered?: boolean }) => ({
                  height: 30,
                  paddingHorizontal: 10,
                  borderRadius: c.mode === 'terminal' ? 3 : 7,
                  justifyContent: 'center',
                  backgroundColor: on ? c.soft : hovered ? c.soft : 'transparent',
                  ...pointer(),
                })}
              >
                <Txt raw size={13.5} weight={on ? '600' : '500'} color={on ? c.ink : c.muted}>
                  {t.label}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      )}
      {ready && ui.view === 'chat' && a.messages.length > 0 && (
        <IconBtn icon="new-chat" label="New chat" testID="chat-new" onPress={a.clear} />
      )}
      {ready && (
        <IconBtn
          icon="options-outline"
          label="Model and key settings"
          testID="chat-settings"
          active={ui.view === 'settings'}
          onPress={() => setChatView(ui.view === 'settings' ? 'chat' : 'settings')}
        />
      )}
      {docked && (
        <IconBtn
          icon={ui.maximized ? 'minimize' : 'maximize-2'}
          label={ui.maximized ? 'Restore panel' : 'Maximise panel'}
          onPress={toggleMaximized}
        />
      )}
      <IconBtn testID="chat-close" icon="close" label="Close assistant (Esc)" onPress={closeChat} />
    </View>
  );
}

function Composer({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
}) {
  const c = usePalette();
  const a = useAssistant();
  const [focus, setFocus] = useState(false);
  const [height, setHeight] = useState(24);
  const [picker, setPicker] = useState(false);
  const input = useRef<TextInput>(null);
  const can = !!value.trim() && !a.streaming;
  const found = a.context.unitId ? findUnit(a.context.unitId) : undefined;
  useEffect(() => {
    const t = setTimeout(() => input.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);
  const closePicker = useCallback(() => setPicker(false), []);
  return (
    <View style={{ paddingHorizontal: 12, paddingBottom: 10, paddingTop: 6, gap: 6 }}>
      <View
        style={{
          borderWidth: 1,
          borderColor: focus ? c.edge : c.line,
          borderRadius: c.mode === 'terminal' ? 4 : 14,
          backgroundColor: c.surface,
          paddingTop: 10,
          paddingHorizontal: 12,
          paddingBottom: 8,
          gap: 8,
          ...(web
            ? ({
                transition: 'border-color .18s ease, box-shadow .18s ease',
                boxShadow: focus ? `0 0 0 3px ${c.accentSoft}` : c.dark ? '0 1px 0 rgba(255,255,255,.03)' : '0 1px 2px rgba(20,30,60,.06)',
              } as object)
            : {}),
        }}
      >
        <TextInput
          ref={input}
          testID="chat-input"
          nativeID="chat-input"
          accessibilityLabel="Message Mote"
          value={value}
          onChangeText={t => {
            if (!t) setHeight(24);
            onChange(t);
          }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={found ? `Ask about ${a.context.unitId}…` : 'Ask Mote anything…'}
          placeholderTextColor={c.faint}
          multiline
          onContentSizeChange={e => setHeight(Math.max(24, Math.min(180, e.nativeEvent.contentSize.height)))}
          onKeyPress={e => {
            const ne = e.nativeEvent as { key: string; shiftKey?: boolean };
            if (web && ne.key === 'Enter' && !ne.shiftKey) {
              (e as unknown as { preventDefault: () => void }).preventDefault();
              setHeight(24);
              onSend();
            }
          }}
          style={{
            height: web ? height : undefined,
            minHeight: 24,
            maxHeight: 180,
            padding: 0,
            fontSize: 15,
            lineHeight: 22,
            color: c.ink,
            ...fontFor('400'),
            ...(web ? ({ outlineStyle: 'none', resize: 'none' } as object) : {}),
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              height: 26,
              paddingHorizontal: 8,
              borderRadius: 7,
              borderWidth: 1,
              borderColor: c.line,
              flexShrink: 1,
            }}
            accessibilityLabel={found ? `Context: ${a.context.unitId} ${found.unit.title}` : 'Context: your plan'}
          >
            <Icon name="at" size={12} color={c.muted} />
            <Txt raw size={12} color={c.muted} numberOfLines={1} style={{ flexShrink: 1 }}>
              {found ? `${a.context.unitId} · ${found.unit.title}` : 'Your plan'}
            </Txt>
          </View>
          <View style={{ flex: 1 }} />
          <View style={{ position: 'relative' }}>
            {picker && <ModelPopover onClose={closePicker} />}
            <Pressable
              testID="chat-model"
              accessibilityRole="button"
              accessibilityLabel={`Model: ${a.config?.model}. Change model`}
              accessibilityState={{ expanded: picker }}
              onPress={() => setPicker(p => !p)}
              style={({ hovered }: { pressed: boolean; hovered?: boolean }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                height: 28,
                paddingHorizontal: 8,
                borderRadius: 7,
                maxWidth: 190,
                backgroundColor: picker || hovered ? c.soft : 'transparent',
                ...pointer(),
              })}
            >
              <Icon name="cpu" size={13} color={c.muted} />
              <Txt raw size={12.5} mono color={c.muted} numberOfLines={1} style={{ flexShrink: 1 }}>
                {a.config?.model ?? 'model'}
              </Txt>
              <Icon name={picker ? 'chevron-up' : 'chevron-down'} size={13} color={c.muted} />
            </Pressable>
          </View>
          {a.streaming ? (
            <Animated.View entering={ZoomIn.duration(140)} key="stop">
              <MotionPress
                testID="chat-stop"
                accessibilityRole="button"
                accessibilityLabel="Stop the reply"
                onPress={a.stop}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: c.mode === 'terminal' ? 4 : 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.ink,
                  ...pointer(),
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c.bg }} />
              </MotionPress>
            </Animated.View>
          ) : (
            <Animated.View entering={ZoomIn.duration(140)} key="send">
              <MotionPress
                testID="chat-send"
                accessibilityRole="button"
                accessibilityLabel="Send (Enter)"
                disabled={!can}
                onPress={() => {
                  setHeight(24);
                  onSend();
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: c.mode === 'terminal' ? 4 : 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: can ? c.accent : c.soft,
                  ...pointer(can),
                  ...(web ? ({ transition: 'background-color .18s ease' } as object) : {}),
                }}
              >
                <Icon name="arrow-up" size={16} color={can ? c.onAccent : c.faint} />
              </MotionPress>
            </Animated.View>
          )}
        </View>
      </View>
      <Txt raw size={11.5} color={c.faint} style={{ textAlign: 'center' }}>
        {web ? 'Enter to send · Shift+Enter new line · ' : ''}Answers can be wrong
      </Txt>
    </View>
  );
}

function EmptyState({ onPick, wide }: { onPick: (t: string) => void; wide: boolean }) {
  const c = usePalette();
  const a = useAssistant();
  const prompts = useMemo(() => promptsFor(a.context.unitId), [a.context.unitId]);
  const [mood, setMood] = useState<MoteMood>('happy');
  useEffect(() => {
    const t = setTimeout(() => setMood('idle'), 1200);
    return () => clearTimeout(t);
  }, []);
  return (
    <Animated.View entering={FadeIn.duration(260)} style={{ flex: 1, justifyContent: 'center', gap: 22, paddingVertical: 24 }}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Mote size={84} mood={mood} />
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Txt size={20} raw weight="600" style={{ textAlign: 'center' }}>
            {a.context.unitId ? 'Stuck on this unit?' : 'Hi, I’m Mote'}
          </Txt>
          <Txt size={14} raw color={c.muted} style={{ textAlign: 'center', maxWidth: 320, lineHeight: 20 }}>
            {a.context.unitId
              ? 'I can see the lesson you’re on, so ask about it directly.'
              : 'Ask about your plan, a concept, or what to do next.'}
          </Txt>
        </View>
      </View>
      <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: 8 }}>
        {prompts.map((p, i) => (
          <Animated.View
            key={p.text}
            entering={FadeInUp.delay(80 + i * 50).duration(240)}
            style={{ flexBasis: wide ? '48%' : undefined, flexGrow: 1 }}
          >
            <MotionPress
              accessibilityRole="button"
              accessibilityLabel={p.text}
              onPress={() => onPick(p.text)}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 10,
                minHeight: 52,
                padding: 12,
                borderRadius: c.mode === 'terminal' ? 4 : 12,
                borderWidth: 1,
                borderColor: c.line,
                backgroundColor: c.surface,
                ...pointer(),
              }}
            >
              <Icon name={p.icon} size={15} color={c.accentText} />
              <Txt size={13.5} raw style={{ flex: 1, lineHeight: 19 }}>
                {p.text}
              </Txt>
            </MotionPress>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
}

export function ChatPanel({ draft, docked = false }: { draft?: string; docked?: boolean }) {
  const c = usePalette();
  const a = useAssistant();
  const ui = useChatUi();
  const [text, setText] = useState(draft ?? '');
  const [width, setWidth] = useState(400);
  const [atBottom, setAtBottom] = useState(true);
  const [banner, setBanner] = useState<string>();
  const scroll = useRef<ScrollView>(null);
  const stick = useRef(true);
  const visible = a.messages.filter(m => m.role !== 'system');
  const lastMsg = visible.at(-1);
  const connected = !!a.config && a.status !== 'unconfigured';
  const mood: MoteMood = a.streaming ? (lastMsg?.text ? 'talking' : 'thinking') : a.status === 'checking' ? 'thinking' : 'idle';

  useEffect(() => {
    if (stick.current) scroll.current?.scrollToEnd({ animated: !a.streaming });
  }, [a.messages, a.streaming]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const near = contentSize.height - contentOffset.y - layoutMeasurement.height < 60;
    stick.current = near;
    if (near !== atBottom) setAtBottom(near);
  };

  const send = (t = text) => {
    const v = t.trim();
    if (!v || a.streaming) return;
    setText('');
    stick.current = true;
    void a.send(v);
  };
  const regenerate = () => {
    const lastUser = [...a.messages].reverse().find(m => m.role === 'user');
    if (lastUser) void a.send(lastUser.text);
  };

  const onConnected = useCallback(() => {
    setChatView('chat');
    setBanner('Connected');
    setTimeout(() => setBanner(undefined), 2600);
  }, []);

  let body: React.ReactNode;
  if (!connected)
    body = (
      <ScrollView contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        <AssistantSetup onDone={onConnected} />
      </ScrollView>
    );
  else if (ui.view === 'settings') body = <SettingsView onBack={() => setChatView('chat')} />;
  else if (ui.view === 'history') body = <HistoryView currentUnit={a.context.unitId} />;
  else
    body = (
      <>
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scroll}
            onScroll={onScroll}
            scrollEventThrottle={32}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 20, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {visible.length === 0 ? (
              <EmptyState onPick={send} wide={width >= 420} />
            ) : (
              visible.map((m, i) => (
                <Message
                  key={m.id}
                  m={m}
                  model={a.config?.model}
                  last={i === visible.length - 1 && m.role === 'assistant'}
                  onRegenerate={regenerate}
                />
              ))
            )}
          </ScrollView>
          {!atBottom && visible.length > 0 && (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(120)}
              style={{ position: 'absolute', bottom: 8, alignSelf: 'center' }}
            >
              <MotionPress
                accessibilityRole="button"
                accessibilityLabel="Scroll to the latest message"
                onPress={() => {
                  stick.current = true;
                  scroll.current?.scrollToEnd({ animated: true });
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: c.raised,
                  borderWidth: 1,
                  borderColor: c.line,
                  boxShadow: c.dark ? '0 6px 20px rgba(0,0,0,.5)' : '0 6px 20px rgba(20,30,60,.14)',
                  ...pointer(),
                }}
              >
                <Icon name="arrow-down" size={15} color={c.ink} />
              </MotionPress>
            </Animated.View>
          )}
        </View>
        <Composer value={text} onChange={setText} onSend={() => send()} />
      </>
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }} testID="chat-panel" onLayout={e => setWidth(e.nativeEvent.layout.width)}>
      <Header docked={docked} mood={mood} />
      {banner && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOut.duration(200)}
          style={{
            position: 'absolute',
            top: 56,
            alignSelf: 'center',
            zIndex: 10,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
            paddingHorizontal: 12,
            height: 32,
            borderRadius: 16,
            backgroundColor: c.ink,
          }}
        >
          <Icon name="checkmark-circle" size={14} color={c.bg} />
          <Txt raw size={13} weight="600" color={c.bg}>
            {banner} · {a.config?.model}
          </Txt>
        </Animated.View>
      )}
      <View style={{ flex: 1 }}>{body}</View>
    </View>
  );
}
