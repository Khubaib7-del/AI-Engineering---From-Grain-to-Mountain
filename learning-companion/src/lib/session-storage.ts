import * as SecureStore from 'expo-secure-store';
import {secureSessionStorage} from './secure-session';
export const sessionStorage = secureSessionStorage(SecureStore);
