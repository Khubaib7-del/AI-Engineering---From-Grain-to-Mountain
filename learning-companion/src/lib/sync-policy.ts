import type { LearningState } from './types';

/** Everything except device settings (theme, reminders) goes to the cloud notebook. */
export type ProgressPayload = Omit<LearningState, 'settings'>;

export function progressOnly(state: LearningState): ProgressPayload {
  const { settings: _settings, ...rest } = state;
  void _settings;
  // Drop undefined keys so the JSON payload stays minimal and stable.
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)) as ProgressPayload;
}

export function syncDecision(
  dirty: boolean,
  localRevision: number,
  remoteRevision: number,
): 'pull' | 'push' | 'conflict' {
  return dirty ? (localRevision === remoteRevision ? 'push' : 'conflict') : 'pull';
}
