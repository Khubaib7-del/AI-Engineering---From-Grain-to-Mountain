// Connect an AI provider: paste key → provider detected from its prefix → model → Connect.
import { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, TextInput, View } from 'react-native';
import { useAssistant, type ProviderId } from '../../ui/assistant-api';
import { Button, Chip, Icon, Label, Txt, inputStyle, usePalette } from '../ui';
import { Mote } from '../mote';

export function AssistantSetup({ onDone }: { onDone?: () => void }) {
  const c = usePalette();
  const a = useAssistant();
  const [key, setKey] = useState('');
  const [manual, setManual] = useState<ProviderId>();
  const [model, setModel] = useState<string>();
  const [pickModel, setPickModel] = useState(false);
  const detected = useMemo(() => (key.trim().length >= 4 ? a.detectProvider(key) : null), [key, a]);
  const providerId = manual ?? detected ?? undefined;
  const provider = a.providers.find(p => p.id === providerId);
  const chosenModel = model && provider?.models.includes(model) ? model : provider?.defaultModel;
  const checking = a.status === 'checking';
  const canConnect = !!provider && (!provider.needsKey || key.trim().length >= 8) && !checking;

  if (a.status === 'ready' && a.config) {
    const p = a.providers.find(x => x.id === a.config!.provider);
    return (
      <View style={{ gap: 20, alignItems: 'flex-start' }} testID="assistant-connected">
        <Mote size={64} mood="celebrate" still />
        <Txt size={24} weight="600">
          Connected
        </Txt>
        <Txt color={c.muted}>
          {p?.name ?? a.config.provider} · {a.config.model} · key {a.config.keyPreview}
        </Txt>
        <Button title="Start chatting" icon="arrow-forward" onPress={() => onDone?.()} />
      </View>
    );
  }

  return (
    <View style={{ gap: 20 }} testID="assistant-setup">
      <View style={{ gap: 8 }}>
        <Txt size={24} weight="600">
          Connect an AI model
        </Txt>
        <Txt color={c.muted}>
          Paste an API key from any supported provider. Mote uses it to answer questions about the unit you
          are on.
        </Txt>
      </View>

      <View style={{ gap: 8 }}>
        <Label>API key</Label>
        <TextInput
          testID="assistant-key"
          accessibilityLabel="API key"
          value={key}
          onChangeText={v => {
            setKey(v);
            setManual(undefined);
          }}
          placeholder="sk-…, sk-ant-…, AIza…, gsk_…"
          placeholderTextColor={c.faint}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          style={inputStyle(c)}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', minHeight: 32 }}>
          {detected && !manual ? (
            <Chip
              text={`Detected: ${a.providers.find(p => p.id === detected)?.name}`}
              tone="signal"
              icon="sparkles"
            />
          ) : key.trim().length >= 4 && !manual ? (
            <Txt size={15} color={c.muted}>
              Couldn’t tell the provider from this key. Pick it below.
            </Txt>
          ) : null}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Label>Provider</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {a.providers.map(p => {
            const on = p.id === providerId;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  setManual(p.id);
                  setModel(undefined);
                }}
                style={{
                  minHeight: 40,
                  paddingHorizontal: 14,
                  justifyContent: 'center',
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: on ? c.accent : c.edge,
                  backgroundColor: on ? c.accentSoft : c.surface,
                }}
              >
                <Txt size={15} raw weight={on ? '600' : '500'} color={on ? c.accentText : c.ink}>
                  {p.name}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>

      {provider && (
        <View style={{ gap: 8 }}>
          <Label>Model</Label>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Model: ${chosenModel}. Change`}
            accessibilityState={{ expanded: pickModel }}
            onPress={() => setPickModel(o => !o)}
            style={[
              inputStyle(c),
              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
            ]}
          >
            <Txt size={16} raw mono>
              {chosenModel}
            </Txt>
            <Icon name="chevron-down" size={18} color={c.muted} />
          </Pressable>
          {pickModel && (
            <View style={{ borderWidth: 1, borderColor: c.line, borderRadius: 12, overflow: 'hidden' }}>
              {provider.models.map(m => (
                <Pressable
                  key={m}
                  accessibilityRole="menuitem"
                  onPress={() => {
                    setModel(m);
                    setPickModel(false);
                  }}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    backgroundColor: m === chosenModel ? c.accentSoft : pressed ? c.soft : c.surface,
                  })}
                >
                  <Txt size={15} raw mono color={m === chosenModel ? c.accentText : c.ink}>
                    {m}
                  </Txt>
                </Pressable>
              ))}
            </View>
          )}
          <Txt size={15} color={c.muted}>
            Need a key?{' '}
            <Txt
              size={15}
              color={c.accentText}
              accessibilityRole="link"
              onPress={() => void Linking.openURL(provider.docsUrl)}
            >
              Get one from {provider.name}
            </Txt>
          </Txt>
        </View>
      )}

      {a.status === 'error' && !!a.error && (
        <View style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: c.danger }}>
          <Txt size={16} color={c.danger}>
            {a.error}
          </Txt>
        </View>
      )}

      <Button
        testID="assistant-connect"
        title={checking ? 'Checking the key…' : 'Connect'}
        busy={checking}
        disabled={!canConnect}
        full
        onPress={() => void a.connect(key, providerId, chosenModel)}
      />

      <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 12, backgroundColor: c.soft }}>
        <Icon name="lock-closed-outline" size={18} color={c.ink} />
        <Txt size={15} style={{ flex: 1 }}>
          Your key stays on this device and is never sent to our servers or synced to your account. Requests
          go straight from {Platform.OS === 'web' ? 'this browser' : 'this phone'} to the provider.
          {Platform.OS === 'web'
            ? ' On the web it is kept in this browser’s storage, so only connect on a device you trust.'
            : ' It is kept in the phone’s secure storage.'}
        </Txt>
      </View>
    </View>
  );
}
