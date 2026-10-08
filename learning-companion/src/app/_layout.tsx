import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';
import { LearningProvider } from '../lib/store';
import { listenForLessons } from '../lib/notifications';
import { usePalette, dark } from '../components/ui';
function Navigation() {
  const c = usePalette();
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const style = document.createElement('style');
    style.textContent = `:focus-visible { outline: 3px solid #898989 !important; outline-offset: 4px; }
      input:focus-visible, textarea:focus-visible { outline-offset: 1px; }
      @media (prefers-reduced-transparency: reduce) { [style*="backdrop-filter"] { backdrop-filter: none !important; background: Canvas !important; } }
      @media (prefers-contrast: more) { [role="button"], [role="tab"] { outline: 1px solid currentColor; } }
      ::selection { background: #C8C8C8; color: #111111; }`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);
  useEffect(() => listenForLessons(id => router.push(`/session/${id}`)), []);
  return <><StatusBar style={c === dark ? 'light' : 'dark'} /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}><Stack.Screen name="(tabs)" /><Stack.Screen name="session/[id]" /><Stack.Screen name="module/[id]" /><Stack.Screen name="settings" options={{ presentation: 'modal' }} /></Stack></>;
}
function AccountNotebook() { const {session,ready}=useAuth(); if(!ready)return <View style={{flex:1,backgroundColor:'#000',justifyContent:'center',alignItems:'center'}}><Text style={{color:'#fff'}}>Opening your notebook…</Text></View>; const scope=session?.user.id??'guest'; return <LearningProvider key={scope} scope={scope}><Navigation /></LearningProvider>; }
export default function RootLayout() { return <SafeAreaProvider><AuthProvider><AccountNotebook /></AuthProvider></SafeAreaProvider>; }
