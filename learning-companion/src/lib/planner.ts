import { backfillActivity, ACTIVITY_CAP } from './activity';
import { migrateTopicIds, type LegacyMap } from './migrate';
import { isThemeValue, normalizeTheme } from './theme';
import type { Activity, CapstoneWork, LearningState, Lesson, LessonWork, Profile, UnitWork } from './types';
export const emptyWork = (): LessonWork => ({ tasks: [false, false, false], evidence: '', reviews: [] });
export const initialState = (): LearningState => ({
  version: 1,
  lessons: {},
  topics: {},
  verified: {},
  settings: {
    theme: 'system',
    reminders: false,
    times: ['09:00', '20:00'],
    weekdays: [0, 1, 2, 3, 4, 5, 6],
    quietStart: '22:00',
    quietEnd: '08:00',
  },
});
export function availableLesson(lessons: Lesson[], state: LearningState) {
  return lessons.find(
    l => !state.lessons[l.id]?.completedAt && l.prerequisites.every(id => state.lessons[id]?.completedAt),
  );
}
export function canComplete(lesson: Lesson, work: LessonWork, state: LearningState) {
  return (
    lesson.prerequisites.every(id => state.lessons[id]?.completedAt) &&
    lesson.tasks.every((_, i) => work.tasks[i]) &&
    work.evidence.trim().length >= 12
  );
}
export function reviewDue(work: LessonWork, now = new Date()) {
  if (!work.completedAt || work.reviews.length >= 4) return false;
  const due = new Date(work.completedAt);
  due.setDate(due.getDate() + [1, 3, 7, 14][work.reviews.length]);
  return now >= due;
}
export const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
export const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export function isQuiet(time: string, start: string, end: string) {
  const t = minutes(time),
    s = minutes(start),
    e = minutes(end);
  if (s === e) return false;
  return s < e ? t >= s && t < e : t >= s || t < e;
}
/** Repeat the current unfinished lesson. Future progress is never assumed. */
export function reminderPlan(lesson: Lesson | undefined, state: LearningState, now = new Date()) {
  if (!lesson || !state.settings.reminders) return [];
  const result: { id: string; date: Date; title: string; body: string; lessonId: string }[] = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    if (!state.settings.weekdays.includes(date.getDay())) continue;
    for (const time of [...new Set(state.settings.times)].sort()) {
      if (!validTime(time) || isQuiet(time, state.settings.quietStart, state.settings.quietEnd)) continue;
      const at = new Date(date);
      at.setHours(Number(time.slice(0, 2)), Number(time.slice(3)), 0, 0);
      if (at <= now) continue;
      result.push({
        id: `learning-${at.getTime()}`,
        date: at,
        title: `Day ${lesson.day}: ${lesson.title}`,
        body: `${lesson.estimatedMinutes} min · ${lesson.tasks[0].description}`,
        lessonId: lesson.id,
      });
    }
  }
  return result;
}
export function parseBackup(
  text: string,
  lessonIds: string[],
  topicIds: string[],
  moduleIds: string[],
  legacyMap: LegacyMap = {},
): LearningState {
  if (text.length > 2_000_000) throw new Error('Backup is too large.');
  const v = JSON.parse(text);
  const object = (x: unknown) => x !== null && typeof x === 'object' && !Array.isArray(x);
  const iso = (x: unknown) =>
    typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(x) && Number.isFinite(Date.parse(x));
  if (
    !object(v) ||
    v.version !== 1 ||
    !object(v.lessons) ||
    !object(v.topics) ||
    !object(v.verified) ||
    !object(v.settings)
  )
    throw new Error('Unrecognized backup format.');
  const s = v.settings;
  if (
    !isThemeValue(s.theme) ||
    typeof s.reminders !== 'boolean' ||
    !Array.isArray(s.times) ||
    s.times.length < 1 ||
    s.times.length > 4 ||
    !s.times.every((x: unknown) => typeof x === 'string' && validTime(x)) ||
    !Array.isArray(s.weekdays) ||
    !s.weekdays.length ||
    !s.weekdays.every((x: unknown) => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x <= 6) ||
    !validTime(s.quietStart ?? '') ||
    !validTime(s.quietEnd ?? '')
  )
    throw new Error('Invalid reminder settings.');
  const clean = initialState();
  clean.settings = {
    theme: normalizeTheme(s.theme),
    reminders: false,
    times: [...new Set<string>(s.times)],
    weekdays: [...new Set<number>(s.weekdays)],
    quietStart: s.quietStart,
    quietEnd: s.quietEnd,
  };
  for (const [id, value] of Object.entries(v.lessons)) {
    const w = value as LessonWork;
    if (
      !lessonIds.includes(id) ||
      !object(w) ||
      !Array.isArray(w.tasks) ||
      w.tasks.length !== 3 ||
      !w.tasks.every(x => typeof x === 'boolean') ||
      typeof w.evidence !== 'string' ||
      w.evidence.length > 20000 ||
      (w.completedAt !== undefined &&
        (!iso(w.completedAt) || !w.tasks.every(Boolean) || w.evidence.trim().length < 12)) ||
      !Array.isArray(w.reviews) ||
      w.reviews.length > 4 ||
      !w.reviews.every(iso)
    )
      throw new Error(`Invalid lesson record: ${id}`);
    clean.lessons[id] = {
      tasks: [...w.tasks],
      evidence: w.evidence,
      reviews: [...w.reviews],
      ...(w.completedAt ? { completedAt: w.completedAt } : {}),
    };
  }
  for (const [id, value] of Object.entries(v.topics)) {
    if (typeof value !== 'boolean') throw new Error(`Invalid topic: ${id}`);
    clean.topics[id] = value;
  }
  if (object(v.archivedTopics))
    for (const [id, value] of Object.entries(v.archivedTopics))
      if (typeof value === 'boolean') (clean.archivedTopics ??= {})[id] = value;
  for (const [id, value] of Object.entries(v.verified)) {
    if (!moduleIds.includes(id) || !iso(value)) throw new Error(`Invalid assessment: ${id}`);
    clean.verified[id] = value as string;
  }
  const profile = parseProfile(v.profile, iso);
  if (profile) clean.profile = profile;
  if (v.units !== undefined) {
    if (!object(v.units)) throw new Error('Invalid unit records.');
    clean.units = {};
    for (const [id, value] of Object.entries(v.units)) clean.units[id] = parseUnitWork(id, value, iso);
  }
  if (v.capstones !== undefined) {
    if (!object(v.capstones)) throw new Error('Invalid capstone records.');
    clean.capstones = {};
    for (const [id, value] of Object.entries(v.capstones)) {
      const c = value as CapstoneWork;
      if (
        !object(c) ||
        typeof c.url !== 'string' ||
        c.url.length > 2000 ||
        !Array.isArray(c.scores) ||
        !c.scores.every(n => Number.isInteger(n) && n >= 0 && n <= 3) ||
        (c.submittedAt !== undefined && !iso(c.submittedAt))
      )
        throw new Error(`Invalid capstone: ${id}`);
      clean.capstones[id] = {
        url: c.url,
        scores: [...c.scores],
        ...(c.submittedAt ? { submittedAt: c.submittedAt } : {}),
      };
    }
  }
  if (v.activity !== undefined) {
    if (!Array.isArray(v.activity)) throw new Error('Invalid activity log.');
    const kinds = ['topic', 'unit', 'quiz', 'practice', 'capstone', 'lesson', 'step', 'review'];
    clean.activity = (v.activity as Activity[])
      .filter(
        e =>
          object(e) && iso(e.at) && kinds.includes(e.kind) && typeof e.id === 'string' && e.id.length < 200,
      )
      .map(e => ({
        at: e.at,
        kind: e.kind,
        id: e.id,
        ...(typeof e.score === 'number' ? { score: e.score } : {}),
      }))
      .sort((a, b) => a.at.localeCompare(b.at))
      .slice(-ACTIVITY_CAP);
  }
  return normaliseState(clean, new Set(topicIds), legacyMap);
}

/** Migrate topic IDs and backfill the activity log. Idempotent. */
export function normaliseState(state: LearningState, validTopics: Set<string>, legacyMap: LegacyMap = {}) {
  return backfillActivity(migrateTopicIds(state, legacyMap, validTopics));
}

const LEVELS = ['new', 'some-python', 'cs-student', 'developer'];
const TRACKS = ['ai-engineer', 'fde', 'mlops', 'undecided'];
function parseProfile(p: unknown, iso: (x: unknown) => boolean): Profile | undefined {
  if (p === undefined || p === null) return undefined;
  const v = p as Profile;
  if (
    typeof p !== 'object' ||
    !TRACKS.includes(v.track) ||
    !LEVELS.includes(v.level) ||
    typeof v.hoursPerWeek !== 'number' ||
    v.hoursPerWeek < 1 ||
    v.hoursPerWeek > 80 ||
    !Array.isArray(v.testedOut) ||
    !v.testedOut.every(x => typeof x === 'string') ||
    !iso(v.startedAt) ||
    typeof v.onboarded !== 'boolean'
  )
    throw new Error('Invalid learner profile.');
  const placement =
    v.placement &&
    Number.isInteger(v.placement.score) &&
    Number.isInteger(v.placement.max) &&
    iso(v.placement.at)
      ? { score: v.placement.score, max: v.placement.max, at: v.placement.at }
      : undefined;
  return {
    track: v.track,
    level: v.level,
    hoursPerWeek: v.hoursPerWeek,
    testedOut: [...v.testedOut],
    startedAt: v.startedAt,
    onboarded: v.onboarded,
    ...(placement ? { placement } : {}),
  };
}

function parseUnitWork(id: string, value: unknown, iso: (x: unknown) => boolean): UnitWork {
  const w = value as UnitWork;
  const fail = () => {
    throw new Error(`Invalid unit record: ${id}`);
  };
  if (
    !w ||
    typeof w !== 'object' ||
    typeof w.steps !== 'object' ||
    !Array.isArray(w.attempts) ||
    typeof w.short !== 'object'
  )
    fail();
  const steps: UnitWork['steps'] = {};
  for (const key of ['learn', 'read', 'practice', 'assess'] as const)
    if (w.steps[key] !== undefined) {
      if (!iso(w.steps[key])) fail();
      steps[key] = w.steps[key];
    }
  const attempts = w.attempts.map(a => {
    if (
      !iso(a.at) ||
      !Number.isInteger(a.score) ||
      !Number.isInteger(a.max) ||
      a.max < 1 ||
      a.score < 0 ||
      a.score > a.max ||
      !Array.isArray(a.answers)
    )
      fail();
    return {
      at: a.at,
      score: a.score,
      max: a.max,
      answers: a.answers.map(n => (Number.isInteger(n) ? n : -1)),
    };
  });
  const short: UnitWork['short'] = {};
  for (const [qid, ans] of Object.entries(w.short)) {
    if (
      !ans ||
      typeof ans.text !== 'string' ||
      ans.text.length > 20000 ||
      !Array.isArray(ans.checks) ||
      !iso(ans.at)
    )
      fail();
    short[qid] = { text: ans.text, checks: ans.checks.map(Boolean), at: ans.at };
  }
  if (
    (w.evidence !== undefined && (typeof w.evidence !== 'string' || w.evidence.length > 20000)) ||
    (w.passedAt !== undefined && !iso(w.passedAt))
  )
    fail();
  return {
    steps,
    attempts,
    short,
    ...(w.evidence ? { evidence: w.evidence } : {}),
    ...(w.passedAt ? { passedAt: w.passedAt } : {}),
  };
}
