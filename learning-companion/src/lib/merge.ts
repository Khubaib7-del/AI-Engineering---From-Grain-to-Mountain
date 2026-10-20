// Merge a guest notebook into an account notebook. Nothing is replaced:
// every tick, completion, attempt and event from either side survives.
import { mergeActivity } from './activity';
import type { CapstoneWork, LearningState, LessonWork, UnitWork } from './types';

const earliest = (a?: string, b?: string) => (!a ? b : !b ? a : a < b ? a : b);
const longer = (a = '', b = '') => (b.trim().length > a.trim().length ? b : a);

function mergeLesson(a: LessonWork | undefined, b: LessonWork | undefined): LessonWork {
  if (!a) return b!;
  if (!b) return a;
  const completedAt = earliest(a.completedAt, b.completedAt);
  const base =
    a.completedAt && (!b.completedAt || a.completedAt <= b.completedAt) ? a : b.completedAt ? b : a;
  return {
    tasks: a.tasks.map((v, i) => v || !!b.tasks[i]),
    evidence: completedAt ? base.evidence || longer(a.evidence, b.evidence) : longer(a.evidence, b.evidence),
    reviews: [...new Set([...a.reviews, ...b.reviews])].sort().slice(0, 4),
    ...(completedAt ? { completedAt } : {}),
  };
}

function mergeUnit(a: UnitWork | undefined, b: UnitWork | undefined): UnitWork {
  if (!a) return b!;
  if (!b) return a;
  const steps = { ...b.steps };
  for (const [k, v] of Object.entries(a.steps) as [keyof UnitWork['steps'], string][])
    steps[k] = earliest(v, steps[k]);
  const attempts = [...a.attempts, ...b.attempts.filter(x => !a.attempts.some(y => y.at === x.at))].sort(
    (x, y) => x.at.localeCompare(y.at),
  );
  const short = { ...b.short };
  for (const [id, ans] of Object.entries(a.short)) {
    const other = short[id];
    short[id] =
      !other || ans.checks.filter(Boolean).length >= other.checks.filter(Boolean).length ? ans : other;
  }
  const passedAt = earliest(a.passedAt, b.passedAt);
  const evidence = a.evidence?.trim() ? a.evidence : b.evidence;
  return { steps, attempts, short, ...(evidence ? { evidence } : {}), ...(passedAt ? { passedAt } : {}) };
}

function mergeCapstone(a: CapstoneWork | undefined, b: CapstoneWork | undefined): CapstoneWork {
  if (!a) return b!;
  if (!b) return a;
  if (a.submittedAt && b.submittedAt) return a.submittedAt <= b.submittedAt ? a : b;
  return a.submittedAt ? a : b.submittedAt ? b : a.url ? a : b;
}

function mergeRecord<T>(a: Record<string, T> = {}, b: Record<string, T> = {}, fn: (x?: T, y?: T) => T) {
  const out: Record<string, T> = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) out[key] = fn(a[key], b[key]);
  return out;
}

/** `account` wins ties; device settings always come from `account`. */
export function mergeStates(account: LearningState, guest: LearningState): LearningState {
  const verified = mergeRecord(account.verified, guest.verified, (x, y) => earliest(x, y)!);
  const topics = mergeRecord(account.topics, guest.topics, (x, y) => !!x || !!y);
  const archived = mergeRecord(account.archivedTopics, guest.archivedTopics, (x, y) => !!x || !!y);
  const merged: LearningState = {
    ...account,
    lessons: mergeRecord(account.lessons, guest.lessons, mergeLesson),
    topics,
    verified,
    units: mergeRecord(account.units, guest.units, mergeUnit),
    capstones: mergeRecord(account.capstones, guest.capstones, mergeCapstone),
    activity: mergeActivity(account.activity, guest.activity),
    profile: account.profile?.onboarded ? account.profile : (guest.profile ?? account.profile),
  };
  if (merged.profile && guest.profile?.testedOut.length) {
    merged.profile = {
      ...merged.profile,
      testedOut: [...new Set([...merged.profile.testedOut, ...guest.profile.testedOut])],
    };
  }
  if (Object.keys(archived).length) merged.archivedTopics = archived;
  if (!merged.profile) delete merged.profile;
  return merged;
}

/** True when a notebook holds any learner work worth merging. */
export function hasProgress(s: LearningState) {
  return (
    Object.values(s.topics).some(Boolean) ||
    Object.values(s.lessons).some(l => l.completedAt || l.evidence.trim() || l.tasks.some(Boolean)) ||
    Object.keys(s.verified).length > 0 ||
    Object.keys(s.units ?? {}).length > 0 ||
    Object.values(s.capstones ?? {}).some(c => c.url) ||
    !!s.profile?.onboarded
  );
}

/** Short human summary, e.g. "2 units, 3 lessons, 12 topics". */
export function progressSummary(s: LearningState) {
  const parts: string[] = [];
  const units = Object.values(s.units ?? {}).filter(u => u.passedAt).length;
  const lessons = Object.values(s.lessons).filter(l => l.completedAt).length;
  const topics = Object.values(s.topics).filter(Boolean).length;
  if (units) parts.push(`${units} unit${units > 1 ? 's' : ''} passed`);
  if (lessons) parts.push(`${lessons} lesson${lessons > 1 ? 's' : ''}`);
  if (topics) parts.push(`${topics} topic${topics > 1 ? 's' : ''}`);
  if (!parts.length && s.profile?.onboarded) parts.push('your path settings');
  return parts.join(', ') || 'notes in progress';
}
