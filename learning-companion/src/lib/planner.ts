import type { LearningState, Lesson, LessonWork } from './types';
export const emptyWork = (): LessonWork => ({ tasks: [false, false, false], evidence: '', reviews: [] });
export const initialState = (): LearningState => ({ version: 1, lessons: {}, topics: {}, verified: {}, settings: { theme: 'dark', reminders: false, times: ['09:00', '20:00'], weekdays: [0, 1, 2, 3, 4, 5, 6], quietStart: '22:00', quietEnd: '08:00' } });
export function availableLesson(lessons: Lesson[], state: LearningState) {
  return lessons.find(l => !state.lessons[l.id]?.completedAt && l.prerequisites.every(id => state.lessons[id]?.completedAt));
}
export function canComplete(lesson: Lesson, work: LessonWork, state: LearningState) {
  return lesson.prerequisites.every(id => state.lessons[id]?.completedAt) && lesson.tasks.every((_, i) => work.tasks[i]) && work.evidence.trim().length >= 12;
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
  const t = minutes(time), s = minutes(start), e = minutes(end);
  if (s === e) return false;
  return s < e ? t >= s && t < e : t >= s || t < e;
}
/** Repeat the current unfinished lesson. Future progress is never assumed. */
export function reminderPlan(lesson: Lesson | undefined, state: LearningState, now = new Date()) {
  if (!lesson || !state.settings.reminders) return [];
  const result: { id: string; date: Date; title: string; body: string; lessonId: string }[] = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(now); date.setDate(date.getDate() + day);
    if (!state.settings.weekdays.includes(date.getDay())) continue;
    for (const time of [...new Set(state.settings.times)].sort()) {
      if (!validTime(time) || isQuiet(time, state.settings.quietStart, state.settings.quietEnd)) continue;
      const at = new Date(date); at.setHours(Number(time.slice(0, 2)), Number(time.slice(3)), 0, 0);
      if (at <= now) continue;
      result.push({ id: `learning-${at.getTime()}`, date: at, title: `Day ${lesson.day}: ${lesson.title}`, body: `${lesson.estimatedMinutes} min · ${lesson.tasks[0].description}`, lessonId: lesson.id });
    }
  }
  return result;
}
export function parseBackup(text: string, lessonIds: string[], topicIds: string[], moduleIds: string[]): LearningState {
  if (text.length > 2_000_000) throw new Error('Backup is too large.');
  const v = JSON.parse(text);
  const object = (x: unknown) => x !== null && typeof x === 'object' && !Array.isArray(x);
  const iso = (x: unknown) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(x) && Number.isFinite(Date.parse(x));
  if (!object(v) || v.version !== 1 || !object(v.lessons) || !object(v.topics) || !object(v.verified) || !object(v.settings)) throw new Error('Unrecognized backup format.');
  const s = v.settings;
  if (!['system', 'light', 'dark'].includes(s.theme) || typeof s.reminders !== 'boolean' || !Array.isArray(s.times) || s.times.length < 1 || s.times.length > 4 || !s.times.every((x: unknown) => typeof x === 'string' && validTime(x)) || !Array.isArray(s.weekdays) || !s.weekdays.length || !s.weekdays.every((x: unknown) => typeof x === 'number' && Number.isInteger(x) && x >= 0 && x <= 6) || !validTime(s.quietStart ?? '') || !validTime(s.quietEnd ?? '')) throw new Error('Invalid reminder settings.');
  const clean = initialState(); clean.settings = { theme: s.theme, reminders: false, times: [...new Set<string>(s.times)], weekdays: [...new Set<number>(s.weekdays)], quietStart: s.quietStart, quietEnd: s.quietEnd };
  for (const [id, value] of Object.entries(v.lessons)) {
    const w = value as LessonWork;
    if (!lessonIds.includes(id) || !object(w) || !Array.isArray(w.tasks) || w.tasks.length !== 3 || !w.tasks.every(x => typeof x === 'boolean') || typeof w.evidence !== 'string' || w.evidence.length > 20000 || (w.completedAt !== undefined && (!iso(w.completedAt) || !w.tasks.every(Boolean) || w.evidence.trim().length < 12)) || !Array.isArray(w.reviews) || w.reviews.length > 4 || !w.reviews.every(iso)) throw new Error(`Invalid lesson record: ${id}`);
    clean.lessons[id] = { tasks: [...w.tasks], evidence: w.evidence, reviews: [...w.reviews], ...(w.completedAt ? { completedAt: w.completedAt } : {}) };
  }
  for (const [id, value] of Object.entries(v.topics)) {
    if (!topicIds.includes(id) || typeof value !== 'boolean') throw new Error(`Invalid topic: ${id}`);
    clean.topics[id] = value;
  }
  for (const [id, value] of Object.entries(v.verified)) {
    if (!moduleIds.includes(id) || !iso(value)) throw new Error(`Invalid assessment: ${id}`);
    clean.verified[id] = value as string;
  }
  return clean;
}
