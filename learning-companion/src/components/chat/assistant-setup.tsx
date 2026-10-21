// Connect an AI provider: pick a provider (or paste a key and let its prefix
// pick it), paste the key, Connect. On success the panel goes straight to the
// chat; the model is chosen later from the live list in the composer.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAssistant, type ProviderId } from '../../ui/assistant-api';
import { Icon, Txt, fontFor, usePalette } from '../ui';
import { MotionPress } from '../motion';
import { Mote } from '../mote';

const web = Platform.OS === 'web';
const pointer = web ? ({ cursor: 'pointer' } as object) : {};

const TAGLINE: Record<ProviderId, string> = {
  openai: 'GPT models',
  anthropic: 'Claude models',
  gemini: 'Free tier available',
  openrouter: 'Hundreds of models, one key',
  groq: 'Very fast, free tier',
  mistral: 'Free tier · coding models',
  deepseek: 'Low cost',
  ollama: 'Runs on your computer',
};

export function AssistantSetup({ onDone, onCancel }: { onDone?: () => void; onCancel?: () => void }) {
  const c = usePalette();
  const a = useAssistant();
  const [key, setKey] = useState('');
  const [manual, setManual] = useState<ProviderId>();
  const [show, setShow] = useState(false);
  const [focus, setFocus] = useState(false);
  const sawChecking = useRef(false);
  const detected = useMemo(() => (key.trim().length >= 4 ? a.detectProvider(key) : null), [key, a]);
  const providerId = manual ?? detected ?? undefined;
  const provider = a.providers.find(p => p.id === providerId);
  const checking = a.status === 'checking';
  const canConnect = !!provider && (!provider.needsKey || key.trim().length >= 8) && !checking;

  // Finish as soon as a connect attempt that went through checking ends ready.
  useEffect(() => {
    if (a.status === 'checking') sawChecking.current = true;
    else if (sawChecking.current) {
      sawChecking.current = false;
      if (a.status === 'ready') onDone?.();
    }
  }, [a.status, onDone]);

  const connect = () => canConnect && void a.connect(key, providerId, undefined);

  return (
    <Animated.View entering={FadeIn.duration(220)} style={{ gap: 22 }} testID="assistant-setup">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Mote size={56} mood={checking ? 'thinking' : 'idle'} />
        <View style={{ flex: 1, gap: 4 }}>
          <Txt size={20} raw weight="600">
            {onCancel ? 'Use a different key' : 'Connect a model'}
          </Txt>
          <Txt size={14} raw color={c.muted} style={{ lineHeight: 20 }}>
            Bring your own API key. Mote uses it to answer questions about the unit you’re on.
          </Txt>
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <StepLabel n={1} text="Choose a provider" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {a.providers.map(p => {
            const on = p.id === providerId;
            return (
              <MotionPress
                key={p.id}
                accessibilityRole="radio"
                accessibilityLabel={p.name}
                accessibilityState={{ checked: on }}
                onPress={() => setManual(p.id)}
                style={{
                  flexBasis: '47%',
                  flexGrow: 1,
                  padding: 10,
                  paddingLeft: 12,
                  gap: 2,
                  borderRadius: c.mode === 'terminal' ? 4 : 10,
                  borderWidth: 1,
                  borderColor: on ? c.accent : c.line,
                  backgroundColor: on ? c.accentSoft : c.surface,
                  ...pointer,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Txt raw size={14} weight="600" color={on ? c.accentText : c.ink} style={{ flex: 1 }} numberOfLines={1}>
                    {p.name}
                  </Txt>
                  {on && <Icon name="checkmark-circle" size={15} color={c.accentText} />}
                </View>
                <Txt raw size={12} color={c.muted} numberOfLines={1}>
                  {TAGLINE[p.id]}
                </Txt>
              </MotionPress>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <StepLabel n={2} text={provider?.needsKey === false ? 'Ollama address' : 'Paste your API key'} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: focus ? c.accent : c.edge,
            borderRadius: c.mode === 'terminal' ? 4 : 10,
            backgroundColor: c.surface,
            paddingLeft: 12,
            ...(web ? ({ transition: 'border-color .18s, box-shadow .18s', boxShadow: focus ? `0 0 0 3px ${c.accentSoft}` : 'none' } as object) : {}),
          }}
        >
          <Icon name="key" size={15} color={c.faint} />
          <TextInput
            testID="assistant-key"
            nativeID="assistant-key"
            accessibilityLabel="API key"
            value={key}
            onChangeText={v => {
              setKey(v);
              const d = v.trim().length >= 4 ? a.detectProvider(v) : null;
              if (d) setManual(undefined);
            }}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onSubmitEditing={connect}
            placeholder={provider?.keyHint ?? 'sk-…, sk-ant-…, AIza…, gsk_…'}
            placeholderTextColor={c.faint}
            secureTextEntry={!show && provider?.needsKey !== false}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              flex: 1,
              minHeight: 44,
              paddingHorizontal: 10,
              fontSize: 14.5,
              color: c.ink,
              ...fontFor('400', true),
              ...(web ? ({ outlineStyle: 'none' } as object) : {}),
            }}
          />
          {provider?.needsKey !== false && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={show ? 'Hide key' : 'Show key'}
              onPress={() => setShow(s => !s)}
              style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', ...pointer }}
            >
              <Icon name="eye" size={16} color={show ? c.ink : c.faint} />
            </Pressable>
          )}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, minHeight: 20 }}>
          {detected && !manual ? (
            <Animated.View entering={FadeIn.duration(160)} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Icon name="sparkles" size={13} color={c.accentText} />
              <Txt raw size={13} color={c.accentText}>
                Looks like a {a.providers.find(p => p.id === detected)?.name} key
              </Txt>
            </Animated.View>
          ) : key.trim().length >= 4 && !providerId ? (
            <Txt raw size={13} color={c.muted}>
              Couldn’t tell the provider from this key. Pick it above.
            </Txt>
          ) : provider ? (
            <Txt raw size={13} color={c.muted}>
              Need a key?{' '}
              <Txt raw size={13} color={c.accentText} accessibilityRole="link" onPress={() => void Linking.openURL(provider.docsUrl)}>
                Get one from {provider.name} ↗
              </Txt>
            </Txt>
          ) : null}
        </View>
      </View>

      {a.status === 'error' && !!a.error && (
        <Animated.View
          entering={FadeInDown.duration(160)}
          style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: c.danger }}
        >
          <Icon name="warning" size={16} color={c.danger} />
          <Txt size={14} raw color={c.danger} style={{ flex: 1, lineHeight: 20 }}>
            {a.error}
          </Txt>
        </Animated.View>
      )}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {onCancel && (
          <MotionPress
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={onCancel}
            style={{
              minHeight: 44,
              paddingHorizontal: 18,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: c.edge,
              justifyContent: 'center',
              ...pointer,
            }}
          >
            <Txt raw size={15} weight="600">
              Cancel
            </Txt>
          </MotionPress>
        )}
        <MotionPress
          testID="assistant-connect"
          accessibilityRole="button"
          accessibilityLabel="Connect"
          accessibilityState={{ disabled: !canConnect, busy: checking }}
          disabled={!canConnect}
          onPress={connect}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: c.mode === 'terminal' ? 4 : 10,
            backgroundColor: c.accent,
            opacity: canConnect || checking ? 1 : 0.45,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
            ...pointer,
          }}
        >
          <Txt raw size={15} weight="600" color={c.onAccent}>
            {checking ? 'Checking the key…' : provider ? `Connect ${provider.name}` : 'Connect'}
          </Txt>
          {!checking && <Icon name="arrow-forward" size={16} color={c.onAccent} />}
        </MotionPress>
      </View>

      <View style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 10, backgroundColor: c.soft }}>
        <Icon name="lock-closed-outline" size={16} color={c.ink} />
        <Txt size={13} raw color={c.muted} style={{ flex: 1, lineHeight: 19 }}>
          Your key never touches our servers or your synced account. Requests go straight from{' '}
          {web ? 'this browser' : 'this phone'} to the provider.
          {web
            ? ' On the web it’s saved in this browser’s local storage, so only connect on a device you trust.'
            : ' It’s saved in the phone’s secure storage.'}
        </Txt>
      </View>
    </Animated.View>
  );
}

function StepLabel({ n, text }: { n: number; text: string }) {
  const c = usePalette();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: c.soft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt raw size={11} mono weight="600" color={c.muted}>
          {n}
        </Txt>
      </View>
      <Txt raw size={14} weight="600">
        {text}
      </Txt>
    </View>
  );
}
