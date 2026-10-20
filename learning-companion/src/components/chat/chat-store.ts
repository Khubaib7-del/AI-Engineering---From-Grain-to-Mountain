// Tiny shared store: is the chat sheet open, and with what draft.
import { useSyncExternalStore } from 'react';

type ChatUi = { open: boolean; draft?: string };
let ui: ChatUi = { open: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
export function openChat(draft?: string) {
  ui = { open: true, draft };
  emit();
}
export function closeChat() {
  ui = { open: false };
  emit();
}
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
