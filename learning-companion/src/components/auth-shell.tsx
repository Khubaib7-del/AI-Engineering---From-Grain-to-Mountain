import React from 'react';
import { View } from 'react-native';
import { AsciiRule, DitherMountain } from './art';
import { Mote } from './mote';
import { Label, Txt, usePalette, useWide } from './ui';

/** Sign-in / sign-up frame: dithered art beside the form on desktop, a strip above it on phones. */
export function AuthShell({ children, title }: { children: React.ReactNode; title: string }) {
  const c = usePalette();
  const wide = useWide();
  const art = (
    <View
      style={{
        flex: wide ? 1 : undefined,
        borderRadius: c.mode === 'terminal' ? 4 : 24,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.surface,
        overflow: 'hidden',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ padding: wide ? 32 : 20, gap: 12 }}>
        <Label color={c.accentText}>{title}</Label>
        <Txt size={wide ? 32 : 22} weight="600">
          Your notebook, on every device.
        </Txt>
        {wide && (
          <Txt color={c.muted}>
            Sign in to sync progress, notes and capstones between the website and the Android app. Guest
            progress stays safe and can be merged.
          </Txt>
        )}
        {wide && <AsciiRule width={40} seed={9} />}
      </View>
      <View>
        <View style={{ position: 'absolute', right: 24, top: wide ? -40 : -30, zIndex: 2 }}>
          <Mote size={wide ? 56 : 40} />
        </View>
        <DitherMountain height={wide ? 260 : 90} />
      </View>
    </View>
  );
  return (
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 32 : 20, alignItems: 'stretch' }}>
      {art}
      <View
        style={{ flex: wide ? 1 : undefined, maxWidth: wide ? 520 : undefined, justifyContent: 'center' }}
      >
        {children}
      </View>
    </View>
  );
}
