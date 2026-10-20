// Unit assessment and status rules. Pure functions: no React, no content imports.
import type { LearningState, McqQuestion, Question, ShortQuestion, StepKey, Unit, UnitWork } from './types';

export const PASS_MARK = 0.8;

export type McqResult = {
  id: string;
  chosen: number | undefined;
  answer: number;
  correct: boolean;
  explain: string;
};
export type McqGrade = { score: number; max: number; pct: number; passed: boolean; results: McqResult[] };

export const mcqOf = (quiz: Question[]) => quiz.filter((q): q is McqQuestion => q.kind === 'mcq');
export const shortOf = (quiz: Question[]) => quiz.filter((q): q is ShortQuestion => q.kind === 'short');

/** Auto-grade multiple choice. Unanswered questions count as wrong. */
export function gradeMcq(questions: McqQuestion[], answers: (number | undefined)[]): McqGrade {
  const results = questions.map((q, i) => {
    const chosen = answers[i];
    return { id: q.id, chosen, answer: q.answer, correct: chosen === q.answer, explain: q.explain };
  });
  const score = results.filter(r => r.correct).length;
  const max = questions.length;
  const pct = max ? score / max : 0;
  return { score, max, pct, passed: max > 0 && pct >= PASS_MARK, results };
}

/** Rubric points a short answer must self-check to pass: two of three, rounded up for other sizes. */
export const shortThreshold = (rubric: string[]) => Math.max(1, Math.ceil((rubric.length * 2) / 3));
export const MIN_SHORT_ANSWER = 20;

export function shortPassed(q: ShortQuestion, answer: { text: string; checks: boolean[] } | undefined) {
  if (!answer || answer.text.trim().length < MIN_SHORT_ANSWER) return false;
  return answer.checks.slice(0, q.rubric.length).filter(Boolean).length >= shortThreshold(q.rubric);
}

export const emptyUnitWork = (): UnitWork => ({ steps: {}, attempts: [], short: {} });

export const bestAttempt = (work: UnitWork | undefined) =>
  (work?.attempts ?? []).reduce<{ score: number; max: number } | undefined>(
    (best, a) => (!best || a.score / a.max > best.score / best.max ? a : best),
    undefined,
  );

export const hasEvidence = (work: UnitWork | undefined) => (work?.evidence ?? '').trim().length >= 8;

/** What is still missing before a unit can be marked passed. Empty means it can pass. */
export function missingForPass(unit: Unit, work: UnitWork | undefined): string[] {
  const missing: string[] = [];
  if (!hasEvidence(work)) missing.push('Save your practice evidence (a note, URL or GitHub link).');
  const mcq = mcqOf(unit.quiz);
  const best = bestAttempt(work);
  if (mcq.length && (!best || best.score / best.max < PASS_MARK))
    missing.push(`Score at least ${PASS_MARK * 100}% on the quiz.`);
  const shorts = shortOf(unit.quiz);
  const pending = shorts.filter(q => !shortPassed(q, work?.short[q.id])).length;
  if (pending)
    missing.push(
      `Answer and self-check ${pending} short question${pending > 1 ? 's' : ''} against the rubric.`,
    );
  return missing;
}

export const canPass = (unit: Unit, work: UnitWork | undefined) => missingForPass(unit, work).length === 0;

export type UnitStatus = 'locked' | 'available' | 'in-progress' | 'passed';

export const isPassed = (id: string, state: LearningState) =>
  !!state.units?.[id]?.passedAt || !!state.profile?.testedOut.includes(id);

/** Status of one unit. `known` lists every unit ID in the content, so missing prerequisites never lock. */
export function unitStatus(unit: Unit, state: LearningState, known?: Set<string>): UnitStatus {
  if (isPassed(unit.id, state)) return 'passed';
  const prereqs = unit.prerequisites.filter(id => !known || known.has(id));
  if (!prereqs.every(id => isPassed(id, state))) return 'locked';
  const work = state.units?.[unit.id];
  const started =
    !!work &&
    (Object.keys(work.steps).length > 0 ||
      work.attempts.length > 0 ||
      hasEvidence(work) ||
      Object.keys(work.short).length > 0);
  return started ? 'in-progress' : 'available';
}

/** Which of the four steps are done: Learn, Read, Practice, Assess. */
export function stepsDone(unit: Unit, state: LearningState): Record<StepKey, boolean> {
  const work = state.units?.[unit.id];
  const passed = isPassed(unit.id, state);
  return {
    learn: passed || !!work?.steps.learn,
    read: passed || !unit.read || !!work?.steps.read,
    practice: passed || hasEvidence(work),
    assess: passed,
  };
}

export const stepFraction = (unit: Unit, state: LearningState) => {
  const done = stepsDone(unit, state);
  return (Number(done.learn) + Number(done.read) + Number(done.practice) + Number(done.assess)) / 4;
};
