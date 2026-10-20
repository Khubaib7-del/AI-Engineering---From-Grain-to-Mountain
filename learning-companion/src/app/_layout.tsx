import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { AuthProvider } from '../lib/auth';
import { LearningProvider } from '../lib/store';
import { listenForLessons } from '../lib/notifications';
import { initialAuthLink } from '../lib/supabase';
import { ToastHost, dark, usePalette } from '../components/ui';

function useWebStyles() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `
      html, body { background: #000; }
      svg text { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, 'Segoe UI', Helvetica, Arial, sans-serif; }
      :focus-visible { outline: 2px solid #C9D6E3 !important; outline-offset: 3px; }
      input:focus-visible, textarea:focus-visible { outline-offset: 1px; }
      @media (prefers-reduced-transparency: reduce) { [style*="backdrop-filter"] { backdrop-filter: none !important; } }
      @media (prefers-contrast: more) { [role="button"], [role="tab"] { outline: 1px solid currentColor; } }
      ::selection { background: #C8C8C8; color: #111111; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
}

function Navigation() {
  const c = usePalette();
  const pathname = usePathname();
  useWebStyles();
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
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={c === dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
      <ToastHost />
    </View>
  );
}

/** One auth provider and one notebook provider for the life of the app: auth changes never remount the router. */
export default function RootLayout() {
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
