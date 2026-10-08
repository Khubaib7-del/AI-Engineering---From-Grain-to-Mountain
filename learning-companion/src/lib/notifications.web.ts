import type { LearningState } from './types';
export async function requestReminders() { return false; }
export async function reconcileReminders(_state: LearningState) { return 0; }
export async function testReminder() { throw new Error('Use the Android or iPhone app for reminders.'); }
export function listenForLessons(_onLesson: (id: string) => void) { return () => {}; }
