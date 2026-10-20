// Native: expo/fetch streams response bodies (React Native's global fetch does not).
import { fetch as expoFetch } from 'expo/fetch';
import type { ClientEnv } from './client';

export const clientEnv: ClientEnv = { fetch: expoFetch as unknown as ClientEnv['fetch'], isWeb: false };
