// The assistant panel: header with model + context chips, streaming thread with
// markdown, suggested prompts grounded in the current unit, stop / regenerate.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { findUnit } from '../../lib/content';
import { useAssistant, type ChatMessage } from '../../ui/assistant-api';
import { Icon, Label, Txt, fontFor, usePalette } from '../ui';
import { Mote } from '../mote';
import { Markdown } from './markdown';
import { AssistantSetup } from './assistant-setup';
import { closeChat } from './chat-store';

function promptsFor(unitId?: string): string[] {
  const found = unitId ? findUnit(unitId) : undefined;
  if (!found)
    return [
      'What should I study today?',
      'Explain the difference between AI, ML and deep learning',
      'How do I stay consistent with 8 hours a week?',
    ];
  const { unit } = found;
  return [
    `Explain “${unit.title}” in plain words`,
    unit.covers[0] ? `Quiz me on ${unit.covers[0]}` : `Quiz me on this unit`,
    `Help me start the practice: ${unit.practice.title}`,
  ];
}

function IconButton({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const c = usePalette();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? c.soft : 'transparent',
      })}
    >
      <Icon name={icon} size={18} color={c.ink} />
    </Pressable>
  );
}

function Message({ m, last, onRegenerate }: { m: ChatMessage; last: boolean; onRegenerate: () => void }) {
  const c = usePalette();
  if (m.role === 'user')
    return (
      <View
        style={{
          alignSelf: 'flex-end',
          maxWidth: '86%',
          backgroundColor: c.accentSoft,
          borderRadius: 18,
          borderBottomRightRadius: 6,
          paddingVertical: 10,
          paddingHorizontal: 14,
        }}
      >
        <Txt size={17} color={c.ink}>
          {m.text}
        </Txt>
      </View>
    );
  return (
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <Mote size={28} still />
      <View style={{ flex: 1, gap: 8 }}>
        {m.text ? (
          <Markdown text={m.text + (m.status === 'streaming' ? ' ▍' : '')} />
        ) : (
          <Txt color={c.muted}>Thinking…</Txt>
        )}
        {m.status === 'error' && (
          <Txt size={15} color={c.danger}>
            The reply failed. Try again.
          </Txt>
        )}
        {last && m.status !== 'streaming' && (
          <Pressable
            testID="chat-regenerate"
            accessibilityRole="button"
            onPress={onRegenerate}
            style={{
              flexDirection: 'row',
              gap: 6,
              alignItems: 'center',
              alignSelf: 'flex-start',
              minHeight: 36,
            }}
          >
            <Icon name="refresh" size={15} color={c.muted} />
            <Txt size={15} raw color={c.muted}>
              Regenerate
            </Txt>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function ChatPanel({ draft }: { draft?: string }) {
  const c = usePalette();
  const a = useAssistant();
  const [text, setText] = useState(draft ?? '');
  const [setup, setSetup] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const streaming = a.messages.some(m => m.status === 'streaming');
  const prompts = useMemo(() => promptsFor(a.context.unitId), [a.context.unitId]);
  const provider = a.providers.find(p => p.id === a.config?.provider);
  const ready = a.status === 'ready' && !setup;
  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [a.messages]);

  const send = (t = text) => {
    const v = t.trim();
    if (!v || streaming) return;
    setText('');
    void a.send(v);
  };
  const regenerate = () => {
    const lastUser = [...a.messages].reverse().find(m => m.role === 'user');
    if (lastUser) void a.send(lastUser.text);
  };

  return (
    <View style={{ flex: 1 }} testID="chat-panel">
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          minHeight: 64,
          borderBottomWidth: 1,
          borderColor: c.line,
        }}
      >
        <Mote size={32} still />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={17} raw weight="600">
            Ask Mote
          </Txt>
          <Txt size={13} raw mono color={c.muted} numberOfLines={1}>
            {a.status === 'ready' && a.config
              ? `${provider?.name ?? a.config.provider} · ${a.config.model}`
              : 'Not connected'}
          </Txt>
        </View>
        {ready && a.messages.length > 0 && <IconButton icon="plus" label="New chat" onPress={a.clear} />}
        {a.status === 'ready' && (
          <IconButton
            icon="options-outline"
            label="Model and key settings"
            onPress={() => setSetup(s => !s)}
          />
        )}
        <IconButton testID="chat-close" icon="close" label="Close assistant" onPress={closeChat} />
      </View>

      {!ready ? (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
          <AssistantSetup onDone={() => setSetup(false)} />
          {a.status === 'ready' && (
            <Pressable
              accessibilityRole="button"
              onPress={() => void a.disconnect()}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <Txt size={16} color={c.danger}>
                Disconnect and forget this key
              </Txt>
            </Pressable>
          )}
        </ScrollView>
      ) : (
        <>
          <ScrollView
            ref={scroll}
            contentContainerStyle={{ padding: 16, gap: 18, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {a.messages.length === 0 ? (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={{ flex: 1, justifyContent: 'center', gap: 18, paddingVertical: 20 }}
              >
                <Mote size={72} />
                <View style={{ gap: 6 }}>
                  <Txt size={22} weight="600">
                    What are you stuck on?
                  </Txt>
                  <Txt color={c.muted}>
                    {a.context.unitId
                      ? 'I can see the unit you are on, so ask about it directly.'
                      : 'Ask about your plan, a concept, or your next step.'}
                  </Txt>
                </View>
                <View style={{ gap: 8 }}>
                  {prompts.map(p => (
                    <Pressable
                      key={p}
                      accessibilityRole="button"
                      onPress={() => send(p)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 10,
                        minHeight: 48,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: c.line,
                        backgroundColor: pressed ? c.soft : c.surface,
                      })}
                    >
                      <Icon name="sparkles" size={16} color={c.accentText} />
                      <Txt size={16} style={{ flex: 1 }}>
                        {p}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            ) : (
              a.messages
                .filter(m => m.role !== 'system')
                .map((m, i, arr) => (
                  <Message
                    key={m.id}
                    m={m}
                    last={i === arr.length - 1 && m.role === 'assistant'}
                    onRegenerate={regenerate}
                  />
                ))
            )}
          </ScrollView>
          {/* Composer */}
          <View style={{ padding: 12, gap: 8, borderTopWidth: 1, borderColor: c.line }}>
            {!!a.context.unitId && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  alignSelf: 'flex-start',
                  paddingHorizontal: 10,
                  minHeight: 28,
                  borderRadius: 999,
                  backgroundColor: c.accentSoft,
                }}
              >
                <Icon name="target" size={13} color={c.accentText} />
                <Label color={c.accentText}>context: {a.context.unitId}</Label>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 8,
                borderWidth: 1,
                borderColor: c.edge,
                borderRadius: 18,
                backgroundColor: c.surface,
                paddingLeft: 14,
                paddingRight: 6,
                paddingVertical: 6,
              }}
            >
              <TextInput
                testID="chat-input"
                accessibilityLabel="Message Mote"
                value={text}
                onChangeText={setText}
                placeholder="Ask anything about this unit…"
                placeholderTextColor={c.faint}
                multiline
                onKeyPress={e => {
                  const ne = e.nativeEvent as { key: string; shiftKey?: boolean };
                  if (Platform.OS === 'web' && ne.key === 'Enter' && !ne.shiftKey) {
                    (e as unknown as { preventDefault: () => void }).preventDefault();
                    send();
                  }
                }}
                style={{
                  flex: 1,
                  minHeight: 40,
                  maxHeight: 140,
                  paddingVertical: 9,
                  fontSize: 17,
                  color: c.ink,
                  ...fontFor('400'),
                  ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
                }}
              />
              {streaming ? (
                <Pressable
                  testID="chat-stop"
                  accessibilityRole="button"
                  accessibilityLabel="Stop the reply"
                  onPress={a.stop}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: c.ink,
                  }}
                >
                  <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c.bg }} />
                </Pressable>
              ) : (
                <Pressable
                  testID="chat-send"
                  accessibilityRole="button"
                  accessibilityLabel="Send"
                  disabled={!text.trim()}
                  onPress={() => send()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: text.trim() ? c.accent : c.soft,
                  }}
                >
                  <Icon name="arrow-up-outline" size={18} color={text.trim() ? c.onAccent : c.muted} />
                </Pressable>
              )}
            </View>
            <Txt size={13} raw color={c.muted} style={{ textAlign: 'center' }}>
              Answers can be wrong. Check them against the lesson.
            </Txt>
          </View>
        </>
      )}
    </View>
  );
}
