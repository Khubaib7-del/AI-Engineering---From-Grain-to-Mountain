import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { allTopicIds, lessons, modules } from './content';
import { initialState, parseBackup } from './planner';
import { readStored, writeStored } from './storage';
import { reconcileReminders } from './notifications';
import type { LearningState } from './types';
type Store = { state: LearningState; loaded: boolean; error: string; notice: string; update: (fn: (s: LearningState) => LearningState) => Promise<boolean>; importBackup: (text: string) => Promise<boolean>; dismiss: () => void };
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState), [loaded, setLoaded] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const latest = useRef(state), writable = useRef(true), queue = useRef(Promise.resolve());
  const notifyQueue = useRef(Promise.resolve());
  const lastSchedule = useRef('');
  const schedule = (s: LearningState, force = false) => {
    const key = JSON.stringify([s.settings.reminders, s.settings.times, s.settings.weekdays, s.settings.quietStart, s.settings.quietEnd, lessons.filter(l => s.lessons[l.id]?.completedAt).map(l => l.id)]);
    if (!force && lastSchedule.current === key) return;
    lastSchedule.current = key;
    notifyQueue.current = notifyQueue.current.then(async () => { try { const n = await reconcileReminders(s); if (s.settings.reminders) setNotice(`${n} reminders scheduled for the next 7 days. Reopen weekly to refresh.`); } catch (e) { setError(`Progress saved. Reminders need attention: ${String(e)}`); } });
  };
  useEffect(() => {
    void (async () => { try {
      const raw = await readStored();
      if (raw) { const restored = parseBackup(raw, lessons.map(l => l.id), allTopicIds, modules.map(m => m.id)); const original = JSON.parse(raw); restored.settings.reminders = original.settings.reminders; latest.current = restored; setState(restored); schedule(restored); }
    } catch (e) { writable.current = false; setError(`Could not load saved data. Existing data is preserved; import a valid backup to recover. ${String(e)}`); } finally { setLoaded(true); } })();
  }, []);
  useEffect(() => { const subscription = AppState.addEventListener('change', status => { if (status === 'active' && loaded) schedule(latest.current, true); }); return () => subscription.remove(); }, [loaded]);
  const update: Store['update'] = fn => {
    let result = false;
    const operation = queue.current.then(async () => {
      if (!writable.current) { setError('Saved data could not be loaded. Import a valid backup before saving.'); return; }
      const next = fn(latest.current);
      try { await writeStored(JSON.stringify(next)); latest.current = next; setState(next); result = true; schedule(next); } catch (e) { setError(`Your change could not be saved. ${String(e)}`); }
    });
    queue.current = operation.catch(() => {});
    return operation.then(() => result);
  };
  const importBackup = async (text: string) => {
    try {
      const next = parseBackup(text, lessons.map(l => l.id), allTopicIds, modules.map(m => m.id));
      // Imports disable reminders until the user grants permission on this device.
      let valid = true;
      for (const lesson of lessons) if (next.lessons[lesson.id]?.completedAt && !lesson.prerequisites.every(id => next.lessons[id]?.completedAt)) valid = false;
      for (const module of modules) if (next.verified[module.id] && (!module.prerequisites.every(id => next.verified[id]) || !allTopicIds.filter(id => id.startsWith(`${module.id}.`)).every(id => next.topics[id]))) valid = false;
      if (!valid) throw new Error('Backup contains progress without its prerequisites.');
      await queue.current; await writeStored(JSON.stringify(next)); writable.current = true; latest.current = next; setState(next); setError(''); setNotice('Backup imported. Reminders are off until enabled on this device.'); schedule(next); return true;
    } catch (e) { setError(`Import failed: ${String(e)}`); return false; }
  };
  return <Context.Provider value={{ state, loaded, error, notice, update, importBackup, dismiss: () => { setError(''); setNotice(''); } }}>{children}</Context.Provider>;
}
export function useLearning() { const store = useContext(Context); if (!store) throw new Error('LearningProvider missing'); return store; }
