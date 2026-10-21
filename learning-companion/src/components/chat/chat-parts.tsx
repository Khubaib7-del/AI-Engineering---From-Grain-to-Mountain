// Building blocks for the assistant panel: icon buttons, the model picker,
// the thinking indicator, the history list and the settings view.
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, TextInput, View, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { findUnit } from '../../lib/content';
import {
  MODEL_GROUPS,
  isSnapshot,
  keyStorageKind,
  modelGroup,
  useAssistant,
  type ChatMessage,
} from '../../ui/assistant-api';
import { Icon, Txt, fontFor, usePalette } from '../ui';
import { MotionPress, useReduced } from '../motion';
import { AssistantSetup } from './assistant-setup';
import { setChatView } from './chat-store';

const web = Platform.OS === 'web';
export const pointer = (on = true) => (web ? ({ cursor: on ? 'pointer' : 'default' } as ViewStyle) : {});

/** Square-ish icon button with hover and press states. */
export function IconBtn({
  icon,
  label,
  onPress,
  testID,
  active = false,
  size = 32,
  iconSize = 17,
  disabled,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  testID?: string;
  active?: boolean;
  size?: number;
  iconSize?: number;
  disabled?: boolean;
}) {
  const c = usePalette();
  return (
    <MotionPress
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      // @ts-expect-error RN-web renders `title` as a native tooltip
      title={web ? label : undefined}
      style={{
        width: size,
        height: size,
        borderRadius: c.mode === 'terminal' ? 3 : 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? c.soft : 'transparent',
        opacity: disabled ? 0.4 : 1,
        ...pointer(!disabled),
      }}
    >
      <Icon name={icon} size={iconSize} color={active ? c.ink : c.muted} />
    </MotionPress>
  );
}

/** Three dots that breathe while the model thinks. */
export function ThinkingDots({ label = 'Thinking' }: { label?: string }) {
  const c = usePalette();
  const reduced = useReduced();
  const dots = [useSharedValue(0.3), useSharedValue(0.3), useSharedValue(0.3)];
  useEffect(() => {
    if (reduced) return;
    dots.forEach((d, i) =>
      d.set(withDelay(i * 160, withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.3, { duration: 380 })), -1))),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  const styles = dots.map(d =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({ opacity: d.get(), transform: [{ translateY: (1 - d.get()) * 2 }] })),
  );
  return (
    <View
      accessibilityLabel={`${label}…`}
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 26 }}
    >
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {styles.map((s, i) => (
          <Animated.View key={i} style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.muted }, s]} />
        ))}
      </View>
      <Txt size={14} raw color={c.muted}>
        {label}…
      </Txt>
    </View>
  );
}

const GROUP_ICON: Record<string, string> = {
  General: 'sparkles',
  Coding: 'code-slash-outline',
  Reasoning: 'brain',
  Fast: 'zap',
  Vision: 'eye',
};

/** Searchable, grouped model list. Dated snapshots hide behind "Show all versions". */
export function ModelList({ onPick, compact = false }: { onPick?: () => void; compact?: boolean }) {
  const c = usePalette();
  const a = useAssistant();
  const [q, setQ] = useState('');
  const [all, setAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const current = a.config?.model;
  const provider = a.providers.find(p => p.id === a.config?.provider);
  const source = useMemo(() => (a.models.length ? a.models : (provider?.models ?? [])), [a.models, provider]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const hasLatest = (id: string) => source.some(o => o !== id && /latest$/.test(o) && id.startsWith(o.replace(/-?latest$/, '')));
    return source.filter(id => {
      if (s) return id.toLowerCase().includes(s);
      if (all || id === current) return true;
      return !(isSnapshot(id) && hasLatest(id));
    });
  }, [source, q, all, current]);
  const hidden = source.length - list.length;
  const groups = MODEL_GROUPS.map(g => ({ g, ids: list.filter(id => modelGroup(id) === g) })).filter(x => x.ids.length);
  const refresh = () => {
    setRefreshing(true);
    void a.refreshModels().finally(() => setRefreshing(false));
  };
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 10,
          minHeight: 36,
          borderRadius: 8,
          backgroundColor: c.soft,
        }}
      >
        <Icon name="search-outline" size={15} color={c.muted} />
        <TextInput
          nativeID="chat-model-search"
          value={q}
          onChangeText={setQ}
          placeholder={`Search ${source.length} models`}
          placeholderTextColor={c.faint}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            fontSize: 14,
            color: c.ink,
            paddingVertical: 6,
            ...fontFor('400'),
            ...(web ? ({ outlineStyle: 'none' } as object) : {}),
          }}
        />
      </View>
      <ScrollView style={{ maxHeight: compact ? 300 : undefined }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        {groups.map(({ g, ids }) => (
          <View key={g} style={{ paddingTop: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
              <Icon name={GROUP_ICON[g]} size={12} color={c.faint} />
              <Txt raw size={11} mono weight="600" color={c.faint} style={{ letterSpacing: 0.8 }}>
                {g.toUpperCase()}
              </Txt>
            </View>
            {ids.map(id => {
              const on = id === current;
              return (
                <Pressable
                  key={id}
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    a.setModel(id);
                    onPick?.();
                  }}
                  style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: 34,
                    paddingHorizontal: 8,
                    borderRadius: 7,
                    backgroundColor: on ? c.accentSoft : pressed ? c.soft : hovered ? c.soft : 'transparent',
                    ...pointer(),
                  })}
                >
                  <Txt raw size={13.5} mono color={on ? c.accentText : c.ink} style={{ flex: 1 }} numberOfLines={1}>
                    {id}
                  </Txt>
                  {on && <Icon name="checkmark" size={15} color={c.accentText} />}
                </Pressable>
              );
            })}
          </View>
        ))}
        {!groups.length && (
          <Txt size={14} raw color={c.muted} style={{ padding: 10 }}>
            No models match “{q}”.
          </Txt>
        )}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: 2 }}>
        {hidden > 0 || all ? (
          <Pressable onPress={() => setAll(v => !v)} style={{ minHeight: 28, justifyContent: 'center', ...pointer() }}>
            <Txt raw size={12.5} color={c.accentText}>
              {all ? 'Hide dated versions' : `Show all versions (+${hidden})`}
            </Txt>
          </Pressable>
        ) : (
          <View />
        )}
        <Pressable
          onPress={refresh}
          disabled={refreshing}
          style={{ flexDirection: 'row', gap: 4, alignItems: 'center', minHeight: 28, ...pointer() }}
        >
          <Icon name="refresh" size={12} color={c.muted} />
          <Txt raw size={12.5} color={c.muted}>
            {refreshing ? 'Refreshing…' : 'Refresh list'}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

/** Popover above the composer. Click outside or Esc closes it. */
export function ModelPopover({ onClose }: { onClose: () => void }) {
  const c = usePalette();
  useEffect(() => {
    if (!web || typeof window === 'undefined') return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <>
      <Pressable
        accessibilityLabel="Close model list"
        onPress={onClose}
        style={{ position: 'absolute', top: -2000, left: -2000, right: -2000, bottom: -2000, zIndex: 20, ...pointer(false) }}
      />
      <Animated.View
        entering={FadeInDown.duration(160)}
        exiting={FadeOut.duration(120)}
        style={{
          position: 'absolute',
          right: 0,
          bottom: '100%',
          marginBottom: 8,
          width: 300,
          zIndex: 21,
          padding: 8,
          borderRadius: c.mode === 'terminal' ? 4 : 12,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.raised,
          boxShadow: c.dark ? '0 18px 50px rgba(0,0,0,.55)' : '0 18px 50px rgba(20,30,60,.18)',
        }}
      >
        <ModelList compact onPick={onClose} />
      </Animated.View>
    </>
  );
}

const ago = (iso?: string) => {
  if (!iso) return '';
  const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d` : new Date(iso).toLocaleDateString();
};

export function HistoryView({ currentUnit }: { currentUnit?: string }) {
  const c = usePalette();
  const a = useAssistant();
  const [threads, setThreads] = useState<{ unitId?: string; messages: ChatMessage[] }[] | null>(null);
  const [q, setQ] = useState('');
  const load = React.useCallback(() => void a.threads().then(setThreads), [a]);
  useEffect(load, [load, a.messages.length]);
  const shown = (threads ?? []).filter(t => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    const title = t.unitId ? (findUnit(t.unitId)?.unit.title ?? t.unitId) : 'General';
    return title.toLowerCase().includes(s) || t.messages.some(m => m.text.toLowerCase().includes(s));
  });
  const open = (unitId?: string) => {
    if (unitId !== currentUnit) router.push((unitId ? `/unit/${unitId}` : '/today') as never);
    setChatView('chat');
  };
  return (
    <Animated.View entering={FadeIn.duration(180)} style={{ flex: 1 }}>
      <View style={{ padding: 12, paddingBottom: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 10,
            minHeight: 36,
            borderRadius: 8,
            backgroundColor: c.soft,
          }}
        >
          <Icon name="search-outline" size={15} color={c.muted} />
          <TextInput
            nativeID="chat-history-search"
            value={q}
            onChangeText={setQ}
            placeholder="Search chats"
            placeholderTextColor={c.faint}
            style={{
              flex: 1,
              fontSize: 14,
              color: c.ink,
              paddingVertical: 6,
              ...fontFor('400'),
              ...(web ? ({ outlineStyle: 'none' } as object) : {}),
            }}
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 8, gap: 2 }}>
        {threads && !shown.length && (
          <View style={{ alignItems: 'center', padding: 32, gap: 6 }}>
            <Icon name="messages" size={22} color={c.faint} />
            <Txt size={15} raw color={c.muted}>
              {q ? 'No chats match.' : 'No past chats yet.'}
            </Txt>
            <Txt size={13} raw color={c.faint} style={{ textAlign: 'center' }}>
              Each unit keeps its own chat on this device.
            </Txt>
          </View>
        )}
        {shown.map(t => {
          const found = t.unitId ? findUnit(t.unitId) : undefined;
          const lastUser = [...t.messages].reverse().find(m => m.role === 'user');
          const here = t.unitId === currentUnit;
          return (
            <Pressable
              key={t.unitId ?? 'general'}
              accessibilityRole="button"
              accessibilityLabel={`Open chat: ${found?.unit.title ?? 'General'}`}
              onPress={() => open(t.unitId)}
              style={({ hovered }: { pressed: boolean; hovered?: boolean }) => ({
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                padding: 10,
                borderRadius: 8,
                backgroundColor: here ? c.accentSoft : hovered ? c.soft : 'transparent',
                ...pointer(),
              })}
            >
              {({ hovered }: { pressed: boolean; hovered?: boolean }) => (
                <>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: c.soft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name={t.unitId ? 'book-outline' : 'chatbubble-outline'} size={15} color={c.muted} />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Txt raw size={14} weight="600" numberOfLines={1} style={{ flex: 1 }}>
                        {found ? `${t.unitId} · ${found.unit.title}` : 'General'}
                      </Txt>
                      <Txt raw size={12} mono color={c.faint}>
                        {ago(t.messages.at(-1)?.at)}
                      </Txt>
                    </View>
                    <Txt raw size={13} color={c.muted} numberOfLines={1}>
                      {lastUser?.text ?? '…'} · {t.messages.filter(m => m.role !== 'system').length} msgs
                    </Txt>
                  </View>
                  {(hovered || !web) && (
                    <IconBtn
                      icon="trash"
                      label="Delete this chat"
                      size={28}
                      iconSize={14}
                      onPress={() => void a.deleteThread(t.unitId).then(load)}
                    />
                  )}
                </>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

export function SettingsView({ onBack }: { onBack: () => void }) {
  const c = usePalette();
  const a = useAssistant();
  const [replacing, setReplacing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const provider = a.providers.find(p => p.id === a.config?.provider);
  return (
    <Animated.View entering={FadeIn.duration(180)} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 4 }}>
          <Txt size={18} raw weight="600">
            Model and key
          </Txt>
          <Txt size={14} raw color={c.muted}>
            Mote answers with your own provider account.
          </Txt>
        </View>

        {a.config && !replacing && (
          <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 12, backgroundColor: c.surface }}>
            {[
              ['Provider', provider?.name ?? a.config.provider],
              ['Model', a.config.model],
              ['Key', a.config.keyPreview],
              ['Stored', String(keyStorageKind) === 'local-storage' ? 'This browser (local storage)' : 'Phone secure storage'],
            ].map(([k, v], i) => (
              <View
                key={k}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 14,
                  minHeight: 44,
                  borderTopWidth: i ? 1 : 0,
                  borderColor: c.line,
                }}
              >
                <Txt raw size={13} color={c.muted} style={{ width: 70 }}>
                  {k}
                </Txt>
                <Txt raw size={14} mono={k !== 'Provider' && k !== 'Stored'} style={{ flex: 1 }} numberOfLines={1}>
                  {v}
                </Txt>
                {i === 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#2FBF71' }} />
                    <Txt raw size={12} color={c.muted}>
                      Connected
                    </Txt>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {a.config && !replacing && (
          <View style={{ gap: 8 }}>
            <Txt raw size={13} mono weight="600" color={c.faint} style={{ letterSpacing: 0.6 }}>
              MODEL
            </Txt>
            <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 8, backgroundColor: c.surface }}>
              <ModelList compact />
            </View>
          </View>
        )}

        {replacing || !a.config ? (
          <AssistantSetup
            onDone={() => {
              setReplacing(false);
              onBack();
            }}
            onCancel={a.config ? () => setReplacing(false) : undefined}
          />
        ) : (
          <View style={{ gap: 8 }}>
            <SettingRow icon="key" title="Use a different key" detail="Switch provider or paste a new key." onPress={() => setReplacing(true)} />
            {!confirm ? (
              <SettingRow
                icon="unplug"
                title="Disconnect"
                detail="Forget the key and the chats saved on this device."
                danger
                onPress={() => setConfirm(true)}
              />
            ) : (
              <Animated.View
                entering={FadeInDown.duration(160)}
                style={{ padding: 14, gap: 12, borderRadius: 12, borderWidth: 1, borderColor: c.danger }}
              >
                <Txt size={15} raw weight="600">
                  Disconnect {provider?.name}?
                </Txt>
                <Txt size={14} raw color={c.muted}>
                  The key and every chat stored on this device will be deleted. Your study progress is not affected.
                </Txt>
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                  <SmallButton title="Cancel" onPress={() => setConfirm(false)} />
                  <SmallButton title="Disconnect" danger onPress={() => void a.disconnect().then(onBack)} />
                </View>
              </Animated.View>
            )}
          </View>
        )}
        {String(keyStorageKind) === 'local-storage' && (
          <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 10, backgroundColor: c.soft }}>
            <Icon name="warning" size={16} color={c.ink} />
            <Txt size={13} raw color={c.muted} style={{ flex: 1, lineHeight: 19 }}>
              On the web your key is kept in this browser’s local storage. Anyone using this browser profile could
              read it, so only connect on a device you trust, and disconnect on shared computers.
            </Txt>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

function SettingRow({
  icon,
  title,
  detail,
  onPress,
  danger = false,
}: {
  icon: string;
  title: string;
  detail: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const c = usePalette();
  return (
    <MotionPress
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.surface,
        ...pointer(),
      }}
    >
      <Icon name={icon} size={17} color={danger ? c.danger : c.ink} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt raw size={15} weight="600" color={danger ? c.danger : c.ink}>
          {title}
        </Txt>
        <Txt raw size={13} color={c.muted}>
          {detail}
        </Txt>
      </View>
      <Icon name="chevron-forward" size={16} color={c.faint} />
    </MotionPress>
  );
}

export function SmallButton({ title, onPress, danger, primary }: { title: string; onPress: () => void; danger?: boolean; primary?: boolean }) {
  const c = usePalette();
  const bg = danger ? c.danger : primary ? c.accent : 'transparent';
  return (
    <MotionPress
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={{
        minHeight: 36,
        paddingHorizontal: 14,
        borderRadius: 8,
        justifyContent: 'center',
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: danger ? c.danger : primary ? c.accent : c.edge,
        ...pointer(),
      }}
    >
      <Txt raw size={14} weight="600" color={danger ? '#FFFFFF' : primary ? c.onAccent : c.ink}>
        {title}
      </Txt>
    </MotionPress>
  );
}
