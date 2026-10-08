import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { sessionStorage } from './session-storage';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, { auth: {
  storage: sessionStorage, persistSession: true, autoRefreshToken: true,
  detectSessionInUrl: Platform.OS === 'web', lock: processLock,
} }) : null;
export const accountRedirect = 'https://ai-engineering-grain-to-mountain.vercel.app/account';
