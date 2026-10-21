// Tiny shared store for the assistant panel: open/closed, which view, the
// draft to prefill, the docked width (desktop) and whether it is maximised.
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

export type ChatView = 'chat' | 'history' | 'settings';
type ChatUi = { open: boolean; draft?: string; view: ChatView; maximized: boolean; width: number; nonce: number };

export const DOCK_MIN = 360;
export const DOCK_MAX = 760;
const WIDTH_KEY = 'chat-dock-width';
const savedWidth = () => {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return 440;
  const n = Number(localStorage.getItem(WIDTH_KEY));
  return n >= DOCK_MIN && n <= DOCK_MAX ? n : 440;
};

let ui: ChatUi = { open: false, view: 'chat', maximized: false, width: savedWidth(), nonce: 0 };
const listeners = new Set<() => void>();
const set = (patch: Partial<ChatUi>) => {
  ui = { ...ui, ...patch };
  listeners.forEach(l => l());
};
export function openChat(draft?: string) {
  set({ open: true, draft, view: 'chat', nonce: ui.nonce + 1 });
}
export function toggleChat() {
  if (ui.open) closeChat();
  else openChat();
}
export function closeChat() {
  set({ open: false, draft: undefined, maximized: false });
}
export function setChatView(view: ChatView) {
  set({ view });
}
export function toggleMaximized() {
  set({ maximized: !ui.maximized });
}
export function setDockWidth(w: number, persist = false) {
  const width = Math.round(Math.max(DOCK_MIN, Math.min(DOCK_MAX, w)));
  if (width !== ui.width) set({ width });
  if (persist && Platform.OS === 'web' && typeof localStorage !== 'undefined')
    localStorage.setItem(WIDTH_KEY, String(width));
}
export const chatUi = () => ui;
export function useChatUi() {
  return useSyncExternalStore(
    l => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => ui,
    () => ui,
  );
}

// Pointer position shared with Mote (web pointer, native touches).
type Point = { x: number; y: number; at: number };
let point: Point = { x: 0, y: 0, at: 0 };
const pointerListeners = new Set<(p: Point) => void>();
export function notePointer(x: number, y: number) {
  point = { x, y, at: Date.now() };
  pointerListeners.forEach(l => l(point));
}
export function onPointer(l: (p: Point) => void) {
  pointerListeners.add(l);
  return () => {
    pointerListeners.delete(l);
  };
}
export const lastPointer = () => point;
