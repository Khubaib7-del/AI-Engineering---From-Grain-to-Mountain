// Every page leads with ONE next-step card. Secondary detail lives below, folded.
import React from 'react';
import { View } from 'react-native';
import { Button, Label, Txt, usePalette, useWide } from './ui';
import { DitherBand } from './art';
import { openChat } from './chat/chat-store';

export type StepDots = { label: string; done: boolean }[];

export function NextStepCard({
  kicker,
  meta,
  title,
  detail,
  steps,
  action,
  onAction,
  testID,
  ask = true,
  children,
}: {
  kicker: string;
  meta?: string;
  title: string;
  detail?: string;
  steps?: StepDots;
  action: string;
  onAction: () => void;
  testID?: string;
  ask?: boolean;
  children?: React.ReactNode;
}) {
  const c = usePalette();
  const wide = useWide();
  return (
    <View
      style={{
        borderRadius: c.mode === 'terminal' ? 4 : 24,
        borderWidth: 2,
        borderColor: c.accent,
        backgroundColor: c.surface,
        overflow: 'hidden',
        boxShadow:
          c.mode === 'contrast' || c.mode === 'terminal'
            ? 'none'
            : c.dark
              ? '0 20px 50px rgba(0,0,0,.4)'
              : '0 18px 44px rgba(47,91,234,.12)',
      }}
    >
      <View style={{ padding: wide ? 32 : 22, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <View
            style={{
              paddingHorizontal: 10,
              minHeight: 28,
              justifyContent: 'center',
              borderRadius: c.mode === 'terminal' ? 2 : 999,
              backgroundColor: c.accent,
            }}
          >
            <Txt size={13} raw mono weight="600" color={c.onAccent}>
              {c.mode === 'terminal' ? `> ${kicker.toLowerCase()}` : kicker}
            </Txt>
          </View>
          {!!meta && <Label color={c.ink}>{meta}</Label>}
        </View>
        <Txt size={wide ? 34 : 26} weight="600" accessibilityRole="header" style={{ maxWidth: 760 }}>
          {title}
        </Txt>
        {!!detail && (
          <Txt size={18} color={c.muted} style={{ maxWidth: 680 }}>
            {detail}
          </Txt>
        )}
        {!!steps?.length && (
          <View
            style={{ flexDirection: 'row', gap: 8, maxWidth: 560 }}
            accessibilityLabel={`Steps: ${steps.map(s => `${s.label} ${s.done ? 'done' : 'to do'}`).join(', ')}`}
          >
            {steps.map((s, i) => (
              <View key={s.label} style={{ flex: 1, gap: 6 }}>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: s.done ? c.accent : c.soft,
                    borderWidth: s.done ? 0 : 1,
                    borderColor: c.line,
                  }}
                />
                <Txt size={14} raw mono color={s.done ? c.ink : c.muted}>
                  {String(i + 1).padStart(2, '0')} {s.label}
                  {s.done ? ' ✓' : ''}
                </Txt>
              </View>
            ))}
          </View>
        )}
        <View
          style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap', paddingTop: 4 }}
        >
          <Button title={action} icon="arrow-forward" testID={testID} onPress={onAction} />
          {ask && <Button title="Ask Mote about it" secondary onPress={() => openChat()} />}
        </View>
        {children}
      </View>
      <DitherBand height={28} opacity={0.45} />
    </View>
  );
}
