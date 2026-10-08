import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { sessionStorage } from './session-storage';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
// A disconnected phone must not leave the local-save queue waiting indefinitely.
const timedFetch: typeof fetch = async (input, options) => {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
  const abort = () => controller.abort();
  options?.signal?.addEventListener('abort', abort, {once: true});
  if(options?.signal?.aborted)controller.abort();
  try { return await fetch(input, {...options, signal: controller.signal}); }
  finally { clearTimeout(timer); options?.signal?.removeEventListener('abort', abort); }
};
export const supabase = url && key ? createClient(url, key, {global: {fetch: timedFetch}, auth: {
  storage: sessionStorage, persistSession: true, autoRefreshToken: true,
  detectSessionInUrl: Platform.OS === 'web', lock: processLock,
} }) : null;
export const accountRedirect = 'https://ai-engineering-grain-to-mountain.vercel.app/account';
