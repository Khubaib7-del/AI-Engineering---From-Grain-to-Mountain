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
import { ToastHost, usePalette } from '../components/ui';
import type { Palette } from '../lib/palettes';
import { MoteHost } from '../components/mote-host';
import { ChatHost } from '../components/chat/chat-host';
import { notePointer } from '../components/chat/chat-store';

function useWebStyles(c: Palette) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `
      html, body { background: ${c.bg}; }
      svg text { font-family: Geist_500Medium, Geist, Inter, system-ui, sans-serif; }
      :focus-visible { outline: 2px solid ${c.accent} !important; outline-offset: 3px; }
      input:focus-visible, textarea:focus-visible { outline-offset: 1px; }
      input::placeholder, textarea::placeholder { color: ${c.faint}; opacity: 1; }
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
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
      <MoteHost />
      <ChatHost />
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
