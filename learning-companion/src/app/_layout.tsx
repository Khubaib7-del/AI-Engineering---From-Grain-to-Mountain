import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { Geist_700Bold } from '@expo-google-fonts/geist/700Bold';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono/400Regular';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono/500Medium';
import { GeistMono_600SemiBold } from '@expo-google-fonts/geist-mono/600SemiBold';
import { AuthProvider } from '../lib/auth';
import { LearningProvider } from '../lib/store';
import { listenForLessons } from '../lib/notifications';
import { initialAuthLink } from '../lib/supabase';
import { ToastHost, usePalette, useWide } from '../components/ui';
import type { Palette } from '../lib/palettes';
import { MoteHost } from '../components/mote-host';
import { ChatDock, ChatSheet } from '../components/chat/chat-host';
import { notePointer } from '../components/chat/chat-store';

function useWebStyles(c: Palette) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    const ring = c.mode === 'terminal' ? '#FFFFFF' : c.accent;
    const thumb = c.dark ? 'rgba(255,255,255,.16)' : 'rgba(20,22,26,.18)';
    const thumbHover = c.dark ? 'rgba(255,255,255,.28)' : 'rgba(20,22,26,.32)';
    const press = '[role="button"],[role="tab"],[role="link"],[role="radio"],[role="menuitem"],[role="checkbox"],[role="switch"]';
    style.textContent = `
      html, body { background: ${c.bg}; }
      body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
      svg text { font-family: Geist_500Medium, Geist, Inter, system-ui, sans-serif; }

      /* Thin, quiet scrollbars everywhere (no arrows, no grey gutter). */
      * { scrollbar-width: thin; scrollbar-color: ${thumb} transparent; }
      *::-webkit-scrollbar { width: 10px; height: 10px; background: transparent; }
      *::-webkit-scrollbar-button { display: none; height: 0; width: 0; }
      *::-webkit-scrollbar-track { background: transparent; }
      *::-webkit-scrollbar-thumb { background: ${thumb}; border-radius: 10px; border: 3px solid transparent; background-clip: padding-box; }
      *::-webkit-scrollbar-thumb:hover { background: ${thumbHover}; border: 3px solid transparent; background-clip: padding-box; }
      *::-webkit-scrollbar-corner { background: transparent; }

      /* Keyboard focus only; text fields show focus on their own container. */
      :focus { outline: none; }
      :focus-visible { outline: 2px solid ${ring} !important; outline-offset: 3px; border-radius: 6px; }
      input:focus-visible, textarea:focus-visible { outline: none !important; }
      input, textarea { caret-color: ${ring}; }
      input::placeholder, textarea::placeholder { color: ${c.faint}; opacity: 1; }

      /* Every pressable gets smooth hover / press feedback. */
      ${press} { transition: background-color .18s ease, border-color .18s ease, color .18s ease, opacity .18s ease, box-shadow .2s ease, scale .16s cubic-bezier(.2,.8,.2,1), translate .2s cubic-bezier(.2,.8,.2,1); -webkit-tap-highlight-color: transparent; }
      ${press.split(',').map(x => `${x}:not([aria-disabled="true"])`).join(',')} { cursor: pointer; }
      ${press.split(',').map(x => `${x}::after`).join(',')} { content: ""; position: absolute; inset: 0; border-radius: inherit; background: ${c.ink}; opacity: 0; transition: opacity .18s ease; pointer-events: none; }
      ${press.split(',').map(x => `${x}:not([aria-disabled="true"]):hover::after`).join(',')} { opacity: ${c.dark ? '.07' : '.05'}; }
      ${press.split(',').map(x => `${x}:not([aria-disabled="true"]):active::after`).join(',')} { opacity: ${c.dark ? '.12' : '.09'}; }
      ${press.split(',').map(x => `${x}:not([aria-disabled="true"]):active`).join(',')} { scale: .97; }
      [data-testid="mote"]::after { display: none; }
      [data-testid="mote"]:active { scale: 1; }
      #chat-resize:hover { background: ${c.accent} !important; opacity: .6; }

      @media (prefers-reduced-motion: reduce) { *, *::after { transition: none !important; animation: none !important; scale: none !important; } }
      @media (prefers-reduced-transparency: reduce) { [style*="backdrop-filter"] { backdrop-filter: none !important; } }
      @media (prefers-contrast: more) { [role="button"], [role="tab"] { outline: 1px solid currentColor; } }
      ::selection { background: ${c.accent}; color: ${c.onAccent}; }`;
    document.head.appendChild(style);
    document.documentElement.dataset.mode = c.mode;
    return () => style.remove();
  }, [c]);
}

function Navigation() {
  const c = usePalette();
  const pathname = usePathname();
  const wide = useWide();
  useWebStyles(c);
  useEffect(() => listenForLessons(id => router.push(`/session/${id}`)), []);
  // A confirmation link that fell back to the Site URL still lands on the confirmed screen.
  useEffect(() => {
    if ((initialAuthLink.type === 'signup' || initialAuthLink.type === 'email') && pathname !== '/welcome')
      router.replace('/welcome?confirmed=1');
    // Run once for the link that opened the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (Platform.OS === 'web') document.body.style.background = c.bg;
  }, [c.bg]);
  return (
    <View
      style={{ flex: 1, backgroundColor: c.bg }}
      onTouchStart={
        Platform.OS === 'web' ? undefined : e => notePointer(e.nativeEvent.pageX, e.nativeEvent.pageY)
      }
    >
      <StatusBar style={c.dark ? 'light' : 'dark'} />
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: c.bg },
              animation: 'fade_from_bottom',
              animationDuration: 220,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="settings" />
          </Stack>
          <MoteHost />
        </View>
        {wide && <ChatDock />}
      </View>
      {!wide && <ChatSheet />}
      <ToastHost />
    </View>
  );
}

/** One auth provider and one notebook provider for the life of the app: auth changes never remount the router. */
export default function RootLayout() {
  const [fontsReady, fontError] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
  });
  // Web renders with the fallback stack while Geist loads; native waits (splash stays up).
  if (Platform.OS !== 'web' && !fontsReady && !fontError) return null;
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LearningProvider>
          <Navigation />
        </LearningProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
