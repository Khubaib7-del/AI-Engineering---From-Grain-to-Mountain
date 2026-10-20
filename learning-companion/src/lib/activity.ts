// Append-only activity log, 52-week heatmap and streaks. Pure functions.
import type { Activity, LearningState } from './types';

export const ACTIVITY_CAP = 5000;

/** Local calendar day, YYYY-MM-DD. */
export function dayKey(value: Date | string) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const sameEvent = (a: Activity, b: Activity) => a.at === b.at && a.kind === b.kind && a.id === b.id;

/** Add an event, keeping the log sorted and capped (oldest events drop first). */
export function logActivity(
  state: LearningState,
  event: Omit<Activity, 'at'> & { at?: string },
): LearningState {
  const entry: Activity = {
    at: event.at ?? new Date().toISOString(),
    kind: event.kind,
    id: event.id,
    ...(event.score !== undefined ? { score: event.score } : {}),
  };
  const list = [...(state.activity ?? []), entry].sort((a, b) => a.at.localeCompare(b.at));
  return { ...state, activity: list.slice(-ACTIVITY_CAP) };
}

export function mergeActivity(a: Activity[] = [], b: Activity[] = []) {
  const out: Activity[] = [];
  for (const e of [...a, ...b].sort((x, y) => x.at.localeCompare(y.at)))
    if (!out.some(o => sameEvent(o, e))) out.push(e);
  return out.slice(-ACTIVITY_CAP);
}

/** Create dated events from records that existed before the log (run once). */
export function backfillActivity(state: LearningState): LearningState {
  if (state.activity) return state;
  const events: Activity[] = [];
  for (const [id, work] of Object.entries(state.lessons)) {
    if (work.completedAt) events.push({ at: work.completedAt, kind: 'lesson', id });
    for (const at of work.reviews) events.push({ at, kind: 'review', id });
  }
  for (const [id, at] of Object.entries(state.verified)) events.push({ at, kind: 'unit', id });
  return { ...state, activity: mergeActivity([], events) };
}

export function countsByDay(activity: Activity[] = []) {
  const counts = new Map<string, number>();
  for (const e of activity) {
    const key = dayKey(e.at);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export type HeatCell = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
  today: boolean;
};

export const heatLevel = (count: number): HeatCell['level'] =>
  count <= 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;

/** Weeks as columns (oldest first), each Monday→Sunday. The last column holds today. */
export function heatmap(activity: Activity[] = [], today = new Date(), weeks = 52): HeatCell[][] {
  const counts = countsByDay(activity);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const mondayOffset = (end.getDay() + 6) % 7;
  const start = new Date(end);
  start.setDate(end.getDate() - mondayOffset - (weeks - 1) * 7);
  const todayKey = dayKey(end);
  const columns: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const column: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const key = dayKey(date);
      const count = counts.get(key) ?? 0;
      column.push({ date: key, count, level: heatLevel(count), future: date > end, today: key === todayKey });
    }
    columns.push(column);
  }
  return columns;
}

/** Current streak (alive if you were active today or yesterday) and the longest ever, in days. */
export function streaks(activity: Activity[] = [], today = new Date()) {
  const days = new Set(countsByDay(activity).keys());
  const step = (d: Date, n: number) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  };
  let cursor = step(today, 0);
  if (!days.has(dayKey(cursor))) cursor = step(cursor, -1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor = step(cursor, -1);
  }
  const sorted = [...days].sort();
  let longest = 0;
  let run = 0;
  let prev: string | undefined;
  for (const key of sorted) {
    const [y, m, d] = key.split('-').map(Number);
    run = prev && dayKey(step(new Date(y, m - 1, d), -1)) === prev ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = key;
  }
  return { current, longest };
}

export function activeDaysInMonth(activity: Activity[] = [], today = new Date()) {
  const prefix = dayKey(today).slice(0, 7);
  return [...countsByDay(activity).keys()].filter(k => k.startsWith(prefix)).length;
}

export const eventsOn = (activity: Activity[] = [], key: string) =>
  activity.filter(e => dayKey(e.at) === key);
