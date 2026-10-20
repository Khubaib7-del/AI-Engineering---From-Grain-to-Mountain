// Deterministic "what should I do now?" — no AI, no key. Computed from the
// learner's saved progress, the weekly plan (weeks.json) and unit statuses. Pure.
import { bestAttempt, isPassed, missingForPass, stepsDone, PASS_MARK } from '../lib/assess';
import { dayKey, streaks } from '../lib/activity';
import { currentUnit, currentWeek, nextInWeek, type PathUnit } from '../lib/path';
import { reviewDue } from '../lib/planner';
import type { Activity, LearningState, ResourceRef, Unit, Week } from '../lib/types';
import type { NextStep } from './types';

export type NextSteps = { now: NextStep; then: NextStep[]; tip?: string };

/** Spaced-recall days after a unit is passed. */
export const RECALL_DAYS = [1, 3, 7, 14, 30];
export const MAX_THEN = 4;

const unitHref = (id: string) => `/unit/${id}`;

const verbFor = (r: ResourceRef) =>
  r.type === 'video' ? 'Watch' : r.type === 'course' ? 'Study' : r.type === 'repo' ? 'Work through' : 'Read';

/** Planned day lines for a unit across the weekly plan, in order ("Day 4: M01.U01 — …" → "…"). */
export function dayLinesFor(unitId: string, weeks: Week[]): string[] {
  const out: string[] = [];
  for (const w of [...weeks].sort((a, b) => a.week - b.week))
    for (const line of w.detail ?? []) {
      const m = /^Day\s*\d+[^:]*:\s*([^—–-]+?)\s*[—–-]\s*(.+)$/.exec(line);
      if (m && m[1].split(/[,+&/ ]+/).includes(unitId)) out.push(m[2].trim());
    }
  return out;
}

const touchesUnit = (e: Activity, u: Unit) =>
  e.id === u.id || e.id.startsWith(`${u.id}:`) || u.topics.some(t => t.id === e.id);

/** Distinct days before today on which the learner did something in this unit. */
export function studyDaysBefore(u: Unit, activity: Activity[] = [], now = new Date()) {
  const today = dayKey(now);
  return new Set(activity.filter(e => touchesUnit(e, u)).map(e => dayKey(e.at)).filter(d => d < today)).size;
}

const TIME = String.raw`\d{1,2}:\d{2}(?::\d{2})?`;
/** "0:00 to ~30:00", "~30:00–1:00:00", "1:28:33–end" → "0:00–~30:00" etc. */
export function timeRange(line: string): string | undefined {
  const m = new RegExp(`(~?${TIME})\\s*(?:–|—|-|to)\\s*(~?(?:${TIME}|end))`).exec(line);
  return m ? `${m[1]}–${m[2]}` : undefined;
}

/** Single-word problem names in backticks: "`indoor` → check50 green" → ["indoor"]. */
export function problemNames(line: string): string[] {
  return [...line.matchAll(/`([A-Za-z][\w.-]{1,30})`/g)].map(m => m[1]).filter(n => !/\.\w{1,4}$/.test(n));
}

const list = (names: string[]) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/** The ordered unfinished steps of one unit. */
export function unitSteps(u: Unit, state: LearningState, weeks: Week[], now = new Date()): NextStep[] {
  const done = stepsDone(u, state);
  const lines = dayLinesFor(u.id, weeks);
  const index = Math.min(studyDaysBefore(u, state.activity, now), Math.max(0, lines.length - 1));
  const today = lines[index];
  const steps: NextStep[] = [];
  if (!done.learn) {
    const range = today ? timeRange(today) : undefined;
    steps.push({
      id: `${u.id}:learn`,
      kind: 'learn',
      label: `${verbFor(u.learn)} ${u.learn.title}${range ? ` ${range}` : ''}`,
      detail: today ?? u.learn.slice,
      href: u.learn.url,
    });
  }
  if (u.read && !done.read)
    steps.push({ id: `${u.id}:read`, kind: 'read', label: `Read ${u.read.title}`, detail: u.read.slice, href: u.read.url });
  if (!done.practice) {
    const names = today ? problemNames(today).filter(n => !/\s/.test(n)) : [];
    steps.push({
      id: `${u.id}:practice`,
      kind: 'practice',
      label: names.length ? `Do the ${list(names)} problem${names.length > 1 ? 's' : ''}` : `Practice: ${u.practice.title}`,
      detail: `Done when: ${u.practice.done_when}`,
      href: unitHref(u.id),
    });
  }
  if (!isPassed(u.id, state)) {
    const best = bestAttempt(state.units?.[u.id]);
    const retake = best && best.score / best.max < PASS_MARK;
    const missing = missingForPass(u, state.units?.[u.id]);
    steps.push({
      id: `${u.id}:assess`,
      kind: 'assess',
      label: retake ? 'Retake the quiz' : 'Take the quiz',
      detail: retake
        ? `Best so far ${best.score}/${best.max}; you need ${PASS_MARK * 100}%. Re-read the explanations first.`
        : (missing[missing.length - 1] ?? `Score at least ${PASS_MARK * 100}%.`),
      href: unitHref(u.id),
    });
  }
  return steps;
}

const daysBetween = (a: string, b: string) => {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
};

/** Units whose pass date is 1/3/7/14/30 days ago (from the activity log) and legacy lessons due review. */
export function dueRecall(state: LearningState, now = new Date()): string[] {
  const today = dayKey(now);
  const passedOn = new Map<string, string>();
  for (const e of state.activity ?? [])
    if (e.kind === 'unit' && isPassed(e.id, state) && !passedOn.has(e.id)) passedOn.set(e.id, dayKey(e.at));
  const reviewedToday = new Set((state.activity ?? []).filter(e => e.kind === 'review' && dayKey(e.at) === today).map(e => e.id));
  const units = [...passedOn]
    .filter(([id, day]) => RECALL_DAYS.includes(daysBetween(day, today)) && !reviewedToday.has(id))
    .map(([id]) => id);
  const lessons = Object.entries(state.lessons)
    .filter(([, w]) => reviewDue(w, now))
    .map(([id]) => id);
  return [...units, ...lessons];
}

export type NextStepsInput = {
  units: PathUnit[];
  weeks: Week[];
  state: LearningState;
  known?: Set<string>;
  now?: Date;
};

export function computeNextSteps({ units, weeks, state, known, now = new Date() }: NextStepsInput): NextSteps {
  const week = weeks.length ? currentWeek(weeks, state) : undefined;
  const target = nextInWeek(week, units, state, known) ?? currentUnit(units, state, known);
  const activity = state.activity ?? [];
  const today = dayKey(now);
  const todayCount = activity.filter(e => dayKey(e.at) === today).length;
  const streak = streaks(activity, now);
  const due = dueRecall(state, now);

  let now_: NextStep;
  let then: NextStep[] = [];
  if (!target) {
    now_ = {
      id: 'rest:done',
      kind: 'rest',
      label: 'Path complete: review a capstone or pick a deep unit',
      detail: 'Every unit on your path is passed.',
    };
  } else {
    const steps = unitSteps(target.unit, state, weeks, now);
    now_ = steps[0] ?? { id: `${target.unit.id}:open`, kind: 'learn', label: `Open ${target.unit.title}`, href: unitHref(target.unit.id) };
    then = steps.slice(1);
    // After this unit: the next open unit this week, else the next on the role path.
    const rest = units.filter(u => u.unit.id !== target.unit.id);
    const after =
      nextInWeek(week, rest, state, known) ??
      currentUnit(rest.filter(u => u.index > target.index), state, known);
    if (after && !isPassed(after.unit.id, state))
      then.push({ id: `${after.unit.id}:next`, kind: 'learn', label: `Then: ${after.unit.title}`, href: unitHref(after.unit.id) });
  }
  if (due.length)
    then.unshift({
      id: 'review:due',
      kind: 'review',
      label: `Quick recall: ${due.slice(0, 3).join(', ')}${due.length > 3 ? ` +${due.length - 3}` : ''}`,
      detail: 'Answer from memory first, then check. 10 minutes.',
      href: due[0].includes('.') ? unitHref(due[0]) : `/session/${due[0]}`,
    });
  then = then.slice(0, MAX_THEN);

  // One tip, most urgent first.
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const activeYesterday = activity.some(e => dayKey(e.at) === yesterday);
  let tip: string | undefined;
  if (!todayCount && activeYesterday && streak.current >= 2)
    tip = `Your ${streak.current}-day streak ends at midnight. Even 15 minutes on “${now_.label}” keeps it.`;
  else if (todayCount >= 15)
    tip = 'Big session today. Take a proper break: recall works better after rest and sleep.';
  else if (due.length)
    tip = `${due.length} item${due.length > 1 ? 's are' : ' is'} due for spaced recall today. Do it before new material.`;
  else if (streak.current >= 6 && todayCount > 0)
    tip = `${streak.current} days in a row. A lighter day is fine; the plan’s Day 7 is for review.`;
  else if (!activity.length) tip = 'Start small: one short session today beats a long one next week.';
  return { now: now_, then, ...(tip ? { tip } : {}) };
}
