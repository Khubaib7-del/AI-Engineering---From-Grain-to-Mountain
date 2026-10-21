import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { streaks } from '../lib/activity';
import { findUnit } from '../lib/content';
import { TRACK_LABEL } from '../lib/path';
import { stepsDone } from '../lib/assess';
import { useLearning } from '../lib/store';
import { usePath } from '../lib/use-path';
import { buildSystemPrompt } from './grounding';
import { engine } from './instance';
import { detectProvider, providerList } from './providers';
import type { ProviderId } from './types';

const providers = providerList();

/** Bring-your-own-key study tutor, grounded in the current unit (docs/assistant-contract.md). */
export function useAssistant() {
  const snap = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
  const { state } = useLearning();
  const path = usePath();

  const systemPrompt = useCallback(() => {
    const id = snap.unitId ?? path.today?.unit.id;
    const found = id ? findUnit(id) : undefined;
    const entry = id ? path.units.find(u => u.unit.id === id) : undefined;
    return buildSystemPrompt({
      unit: found?.unit,
      module: found?.module,
      profile: state.profile,
      trackLabel: TRACK_LABEL[state.profile?.track ?? 'undecided'],
      week: path.week,
      unitStatus: entry?.status,
      steps: found ? stepsDone(found.unit, state) : undefined,
      passed: path.passed,
      total: path.units.length,
      streak: streaks(state.activity).current,
      hoursLeft: path.hoursLeft,
      now: new Date(),
    });
  }, [snap.unitId, path, state]);

  const send = useCallback((text: string) => engine.send(text, systemPrompt()), [systemPrompt]);

  return useMemo(
    () => ({
      status: snap.status,
      error: snap.error,
      providers,
      config: snap.config,
      /** Chat models the connected key can use (preferred first), for a model picker. */
      models: snap.models,
      streaming: snap.streaming,
      detectProvider,
      connect: (key: string, provider?: ProviderId, model?: string) => engine.connect(key, provider, model),
      disconnect: () => engine.disconnect(),
      setModel: (model: string) => engine.setModel(model),
      refreshModels: () => engine.refreshModels(),
      threads: () => engine.threads(),
      deleteThread: (unitId?: string) => engine.deleteThread(unitId),
      messages: snap.messages,
      send,
      stop: () => engine.stop(),
      clear: () => engine.clear(),
      context: { unitId: snap.unitId, setUnit: (id?: string) => void engine.setUnit(id) },
    }),
    [snap, send],
  );
}
