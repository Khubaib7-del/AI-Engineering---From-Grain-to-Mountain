import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { lessons, legacyMap, modules, validTopicIds } from './content';
import { initialState, parseBackup } from './planner';
import { readStored, writeStored } from './storage';
import { reconcileReminders } from './notifications';
import { supabase } from './supabase';
import { progressOnly, syncDecision } from './sync-policy';
import { useAuth } from './auth';
import { hasProgress, mergeStates, progressSummary } from './merge';
import type { LearningState } from './types';

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'pending' | 'conflict';
export type Toast = { id: number; message: string; action?: { label: string; run: () => void } };
export type GuestOffer = { summary: string };

type Store = {
  state: LearningState;
  scope: string;
  loaded: boolean;
  error: string;
  notice: string;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  dirty: boolean;
  guestOffer: GuestOffer | null;
  toast: Toast | null;
  update: (fn: (s: LearningState) => LearningState) => Promise<boolean>;
  importBackup: (text: string) => Promise<boolean>;
  syncNow: (opts?: { announce?: boolean }) => Promise<void>;
  resolveConflict: (choice: 'local' | 'cloud') => Promise<void>;
  mergeGuest: () => Promise<void>;
  reviewGuest: () => Promise<boolean>;
  dismissGuest: () => Promise<void>;
  showToast: (message: string, action?: Toast['action']) => void;
  hideToast: () => void;
  dismiss: () => void;
};

const Context = createContext<Store | null>(null);
const parse = (value: unknown) =>
  parseBackup(
    JSON.stringify(value),
    lessons.map(l => l.id),
    [...validTopicIds],
    modules.map(m => m.id),
    legacyMap,
  );
const fingerprint = (s: LearningState) => {
  const text = JSON.stringify(progressOnly(s));
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return `${text.length}:${hash}`;
};
const mergedKey = (uid: string) => `meta:guest-merged:${uid}`;

/**
 * One provider for the whole app. When the account changes, the notebook scope
 * switches in place: the navigator is never remounted, so the user keeps their
 * screen and sees a toast instead of a full-screen reload.
 */
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth();
  const scope = ready ? (session?.user.id ?? 'guest') : '';
  const signedIn = !!scope && scope !== 'guest';

  const [state, setState] = useState(initialState);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>();
  const [dirtyFlag, setDirtyFlag] = useState(false);
  const [guestOffer, setGuestOffer] = useState<GuestOffer | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const latest = useRef(state);
  const revision = useRef(0);
  const dirty = useRef(false);
  const writable = useRef(true);
  const generation = useRef(0); // bumps on every scope change; stale async work checks it
  const scopeRef = useRef(scope);
  const queue = useRef(Promise.resolve());
  const syncQueued = useRef(false);
  const notifyQueue = useRef(Promise.resolve());
  const lastSchedule = useRef('');
  const previousScope = useRef('');
  const guestCache = useRef<LearningState | null>(null);
  const syncStatusRef = useRef(syncStatus);
  useEffect(() => {
    syncStatusRef.current = syncStatus;
  }, [syncStatus]);

  const showToast = useCallback((message: string, action?: Toast['action']) => {
    setToast({ id: Date.now(), message, action });
  }, []);

  const enqueue = <T,>(fn: () => Promise<T>): Promise<T> => {
    const op = queue.current.then(fn);
    queue.current = op.then(
      () => {},
      () => {},
    );
    return op;
  };

  const isSigned = () => scopeRef.current !== 'guest' && !!scopeRef.current;

  const persist = async (next: LearningState, rev = revision.current, pending = dirty.current) => {
    const current = scopeRef.current;
    await writeStored(
      JSON.stringify(isSigned() ? { format: 2, state: next, revision: rev, dirty: pending } : next),
      current,
    );
    if (current !== scopeRef.current) return;
    latest.current = next;
    revision.current = rev;
    dirty.current = pending;
    setState(next);
    setDirtyFlag(pending);
  };

  const schedule = (next: LearningState, force = false) => {
    const key = JSON.stringify([
      next.settings,
      lessons.filter(l => next.lessons[l.id]?.completedAt).map(l => l.id),
    ]);
    if (!force && key === lastSchedule.current) return;
    lastSchedule.current = key;
    notifyQueue.current = notifyQueue.current.then(async () => {
      try {
        await reconcileReminders(next);
      } catch {
        setNotice('Progress saved. Check notification permissions on this device.');
      }
    });
  };

  /** Returns true when the sync finished cleanly. */
  const sync = async (choice?: 'local' | 'cloud'): Promise<boolean> => {
    const gen = generation.current;
    const uid = scopeRef.current;
    if (!isSigned() || !supabase || !writable.current) return false;
    setSyncStatus('syncing');
    try {
      const { data: remote, error: readError } = await supabase
        .from('learning_notebooks')
        .select('revision,payload')
        .eq('user_id', uid)
        .maybeSingle();
      if (readError) throw readError;
      if (gen !== generation.current) return false;
      const remoteRevision = remote?.revision ?? 0;
      const cloud = parse({
        ...(remote?.payload ?? progressOnly(initialState())),
        settings: latest.current.settings,
      });
      cloud.settings = latest.current.settings;
      const decision = syncDecision(dirty.current, revision.current, remoteRevision);
      if (decision === 'conflict' && !choice) {
        setSyncStatus('conflict');
        return false;
      }
      if (choice) {
        // Keep both versions locally before an explicit replacement.
        await writeStored(
          JSON.stringify({ local: latest.current, cloud, revision: remoteRevision }),
          `${uid}:conflict:${Date.now()}`,
        );
      }
      if (choice === 'cloud' || (!choice && decision === 'pull')) {
        await persist(cloud, remoteRevision, false);
        schedule(cloud);
      } else {
        const { data: saved, error: saveError } = await supabase
          .rpc('save_learning_notebook', {
            p_user_id: uid,
            p_revision: choice === 'local' ? remoteRevision : revision.current,
            p_payload: progressOnly(latest.current),
          })
          .retry(false)
          .single<{ revision: number }>();
        if (saveError) {
          if (saveError.code === 'PT409' || saveError.code === '40001') {
            setSyncStatus('conflict');
            return false;
          }
          throw saveError;
        }
        if (gen !== generation.current) return false;
        await persist(latest.current, saved!.revision, false);
      }
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toISOString());
      return true;
    } catch {
      if (gen === generation.current) setSyncStatus('pending');
      return false;
    }
  };

  const syncNow: Store['syncNow'] = async opts => {
    if (!isSigned()) {
      if (opts?.announce) showToast('Saved on this device. Sign in to sync across web and Android.');
      return;
    }
    if (syncQueued.current && !opts?.announce) return queue.current;
    syncQueued.current = true;
    try {
      const ok = await enqueue(() => sync());
      if (opts?.announce)
        showToast(
          ok
            ? 'Synced just now.'
            : dirty.current
              ? 'Could not reach the server. Your changes are saved on this device.'
              : 'Sync needs attention.',
        );
    } finally {
      syncQueued.current = false;
    }
  };

  /** After signing in, offer to merge a guest notebook that has not been merged into this account yet. */
  const checkGuest = async (uid: string, force = false) => {
    try {
      const raw = await readStored('guest');
      if (!raw || uid !== scopeRef.current) return false;
      const guest = parse(JSON.parse(raw));
      if (!hasProgress(guest)) return false;
      const marker = await readStored(mergedKey(uid));
      if (!force && marker === fingerprint(guest)) return false;
      guestCache.current = guest;
      setGuestOffer({ summary: progressSummary(guest) });
      return true;
    } catch {
      // A damaged guest notebook is left untouched; nothing to offer.
    }
    return false;
  };

  const mergeGuest: Store['mergeGuest'] = () =>
    enqueue(async () => {
      const guest = guestCache.current;
      const uid = scopeRef.current;
      if (!guest || !isSigned()) return;
      const before = latest.current;
      const merged = mergeStates(before, guest);
      merged.settings = before.settings;
      await persist(merged, revision.current, true);
      await writeStored(fingerprint(guest), mergedKey(uid));
      setGuestOffer(null);
      const ok = await sync();
      showToast(
        ok
          ? 'Guest progress merged into your account and synced.'
          : 'Guest progress merged. It will sync when you are online.',
        {
          label: 'Undo',
          run: () =>
            void enqueue(async () => {
              await persist({ ...before, settings: latest.current.settings }, revision.current, true);
              await writeStored('', mergedKey(uid));
              await sync();
              showToast('Merge undone. Your guest notebook is still on this device.');
            }),
        },
      );
    });

  const dismissGuest: Store['dismissGuest'] = async () => {
    const guest = guestCache.current;
    if (guest && isSigned()) await writeStored(fingerprint(guest), mergedKey(scopeRef.current));
    setGuestOffer(null);
    showToast('Kept your account notebook. Guest progress stays on this device.');
  };

  // Load (or switch to) the notebook for the current scope without remounting anything.
  /* eslint-disable react-hooks/set-state-in-effect -- resetting per-scope UI state when the account changes */
  useEffect(() => {
    if (!scope) return;
    const gen = ++generation.current;
    const from = previousScope.current;
    previousScope.current = scope;
    scopeRef.current = scope;
    writable.current = true;
    setLoaded(false);
    setGuestOffer(null);
    setSyncStatus('local');
    setLastSyncedAt(undefined);
    setError('');

    if (from && from !== scope) {
      if (scope === 'guest')
        showToast('Signed out. You are now in guest mode — this device’s guest notebook is showing.');
      else showToast('Signed in. Loading your notebook…');
    }

    void enqueue(async () => {
      let firstConnection = false;
      let next = initialState();
      let rev = 0;
      let pending = false;
      try {
        const raw = await readStored(scope);
        if (raw) {
          const stored = JSON.parse(raw);
          const value = scope !== 'guest' ? stored.state : stored;
          if (
            scope !== 'guest' &&
            (stored.format !== 2 ||
              !Number.isSafeInteger(stored.revision) ||
              stored.revision < 0 ||
              typeof stored.dirty !== 'boolean')
          )
            throw new Error('Invalid notebook metadata');
          next = parse(value);
          next.settings.reminders = value.settings.reminders;
          rev = scope !== 'guest' ? stored.revision : 0;
          pending = scope !== 'guest' ? stored.dirty : false;
        } else {
          next = parse(initialState());
        }
        if (scope !== 'guest' && !raw) {
          // Keep the device's look and reminders when switching into a new account cache.
          next.settings = latest.current.settings;
        }
        if (gen !== generation.current) return;
        latest.current = next;
        revision.current = rev;
        dirty.current = pending;
        setState(next);
        setDirtyFlag(pending);
        schedule(next);
        // A first sign-in has no cached revision. Pull before exposing an editable
        // notebook, otherwise a quick first edit creates a false conflict.
        if (scope !== 'guest' && !raw) {
          firstConnection = true;
          await sync();
        }
      } catch {
        if (gen !== generation.current) return;
        writable.current = false;
        setError('Could not load saved data. Existing data is preserved; import a valid backup to recover.');
      } finally {
        if (gen === generation.current) setLoaded(true);
      }
      if (gen !== generation.current) return;
      if (scope !== 'guest') {
        const ok = firstConnection || (await sync());
        if (from && from !== scope && gen === generation.current)
          showToast(
            ok || syncStatusRef.current === 'synced'
              ? 'Welcome back · synced.'
              : 'Signed in. Your notebook will sync when the connection returns.',
          );
        await checkGuest(scope);
      }
    });

    const listener = AppState.addEventListener('change', s => {
      if (s === 'active') {
        void syncNow();
        schedule(latest.current, true);
      }
    });
    const interval = setInterval(() => void syncNow(), 30000);
    return () => {
      listener.remove();
      clearInterval(interval);
    };
    // The effect owns exactly one scope; helpers read refs, not render values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const update: Store['update'] = async fn => {
    const ok = await enqueue(async () => {
      if (!writable.current) {
        setError('Import a valid backup before saving.');
        return false;
      }
      try {
        const next = fn(latest.current);
        const changed = JSON.stringify(progressOnly(next)) !== JSON.stringify(progressOnly(latest.current));
        await persist(next, revision.current, dirty.current || (isSigned() && changed));
        schedule(next);
        return true;
      } catch {
        setError('Your change could not be saved.');
        return false;
      }
    });
    if (ok) void syncNow();
    return ok;
  };

  const importBackup: Store['importBackup'] = text =>
    enqueue(async () => {
      try {
        const next = parseBackup(
          text,
          lessons.map(l => l.id),
          [...validTopicIds],
          modules.map(m => m.id),
          legacyMap,
        );
        for (const l of lessons)
          if (next.lessons[l.id]?.completedAt && !l.prerequisites.every(id => next.lessons[id]?.completedAt))
            throw new Error('Missing lesson prerequisites');
        await persist(next, revision.current, isSigned());
        writable.current = true;
        setError('');
        showToast('Notebook imported. Reminders are off on this device until you turn them on.');
        schedule(next);
        await sync();
        return true;
      } catch (e) {
        setError(`Import failed: ${String(e)}`);
        return false;
      }
    });

  return (
    <Context.Provider
      value={{
        state,
        scope,
        loaded,
        error,
        notice,
        syncStatus: signedIn ? syncStatus : 'local',
        lastSyncedAt,
        dirty: dirtyFlag,
        guestOffer,
        toast,
        update,
        importBackup,
        syncNow,
        resolveConflict: choice =>
          enqueue(async () => {
            const ok = await sync(choice);
            if (ok)
              showToast(
                choice === 'cloud'
                  ? 'Using the cloud notebook on this device.'
                  : 'Cloud notebook replaced with this device.',
              );
          }),
        mergeGuest,
        reviewGuest: async () => (isSigned() ? !!(await checkGuest(scopeRef.current, true)) : false),
        dismissGuest,
        showToast,
        hideToast: () => setToast(null),
        dismiss: () => {
          setError('');
          setNotice('');
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useLearning() {
  const store = useContext(Context);
  if (!store) throw new Error('LearningProvider missing');
  return store;
}
