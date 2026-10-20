// Optional onboarding placement check, built from the curriculum itself.
// For every module it samples a few core units spread across the module and
// asks the first multiple-choice question of each. Answering every question
// for a module correctly tests out that module's core units (still revisitable).
import { gradeMcq, mcqOf } from './assess';
import type { McqQuestion, ModuleV2 } from './types';

export type PlacementQuestion = McqQuestion & { module: string; unit: string };

/** Questions per module. Three right answers in a row is hard to guess (1 in 64 on 4 options). */
export const PER_MODULE = 3;
/** A module needs at least this many questions before it can be tested out. */
export const MIN_TO_TEST_OUT = 2;

/** Evenly spread picks: first, last and the middle ones of a list. */
function spread<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  if (n <= 1) return items.slice(0, 1);
  return Array.from({ length: n }, (_, i) => items[Math.round((i * (items.length - 1)) / (n - 1))]);
}

/** One block of questions per module, in the order the modules are given (the learner's role order). */
export function buildPlacement(modules: ModuleV2[], perModule = PER_MODULE): PlacementQuestion[] {
  const out: PlacementQuestion[] = [];
  for (const m of modules) {
    const core = m.submodules.flatMap(s => s.units).filter(u => u.depth === 'core' && mcqOf(u.quiz).length);
    for (const u of spread(core, perModule)) {
      const q = mcqOf(u.quiz)[0];
      out.push({ ...q, id: `P.${q.id}`, module: m.id, unit: u.id });
    }
  }
  return out;
}

/** Grade the placement and list the units it tests out. Unanswered questions count as wrong. */
export function placementResult(
  questions: PlacementQuestion[],
  answers: (number | undefined)[],
  modules: ModuleV2[],
) {
  const grade = gradeMcq(questions, answers);
  const byModule = new Map<string, boolean[]>();
  questions.forEach((q, i) => byModule.set(q.module, [...(byModule.get(q.module) ?? []), grade.results[i].correct]));
  const testedOutModules = [...byModule.entries()]
    .filter(([, r]) => r.length >= MIN_TO_TEST_OUT && r.every(Boolean))
    .map(([id]) => id);
  const testedOut = modules
    .filter(m => testedOutModules.includes(m.id))
    .flatMap(m => m.submodules.flatMap(s => s.units.filter(u => u.depth === 'core').map(u => u.id)));
  return { score: grade.score, max: grade.max, testedOutModules, testedOut };
}
