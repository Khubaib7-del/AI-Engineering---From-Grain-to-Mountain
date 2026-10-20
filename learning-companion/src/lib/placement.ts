// Optional onboarding placement check. Each question is tagged with the module
// it probes; answering every question for a module correctly tests out that
// module's core units (still revisitable).
import { gradeMcq } from './assess';
import type { McqQuestion, ModuleV2 } from './types';

export type PlacementQuestion = McqQuestion & { module: string };

export const placementQuestions: PlacementQuestion[] = [
  {
    id: 'P1',
    module: 'M00',
    kind: 'mcq',
    prompt: 'Which command lists the files in the current folder?',
    options: ['cd', 'ls (or dir on Windows)', 'pwd', 'mkdir'],
    answer: 1,
    explain: 'ls lists directory contents; dir on Windows.',
  },
  {
    id: 'P2',
    module: 'M00',
    kind: 'mcq',
    prompt: 'What does `git commit` do?',
    options: [
      'Uploads to GitHub',
      'Records a snapshot of staged changes locally',
      'Deletes old files',
      'Creates a branch',
    ],
    answer: 1,
    explain: 'A commit is a local snapshot; push uploads it.',
  },
  {
    id: 'P3',
    module: 'M01',
    kind: 'mcq',
    prompt: 'What is `len([1, 2, 3])` in Python?',
    options: ['2', '3', '6', 'An error'],
    answer: 1,
    explain: 'len returns the number of items.',
  },
  {
    id: 'P4',
    module: 'M01',
    kind: 'mcq',
    prompt: 'What does this print? `for i in range(3): print(i)`',
    options: ['1 2 3', '0 1 2', '0 1 2 3', '3'],
    answer: 1,
    explain: 'range(3) yields 0, 1, 2.',
  },
  {
    id: 'P5',
    module: 'M01',
    kind: 'mcq',
    prompt: 'A function without a `return` statement returns…',
    options: ['0', 'An empty string', 'None', 'Its last expression'],
    answer: 2,
    explain: 'Python functions return None by default.',
  },
  {
    id: 'P6',
    module: 'M02',
    kind: 'mcq',
    prompt: 'Average time to look up a key in a Python dict?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    answer: 2,
    explain: 'Hash tables give constant average lookup.',
  },
  {
    id: 'P7',
    module: 'M05',
    kind: 'mcq',
    prompt: 'The dot product of [1, 2] and [3, 4] is…',
    options: ['7', '10', '11', '[3, 8]'],
    answer: 2,
    explain: '1·3 + 2·4 = 11.',
  },
  {
    id: 'P8',
    module: 'M06',
    kind: 'mcq',
    prompt: 'A fair coin is flipped twice. P(two heads)?',
    options: ['1/2', '1/3', '1/4', '3/4'],
    answer: 2,
    explain: '1/2 × 1/2 = 1/4.',
  },
  {
    id: 'P9',
    module: 'M07',
    kind: 'mcq',
    prompt: 'Training accuracy 99%, validation 60%. This is most likely…',
    options: ['Underfitting', 'Overfitting', 'A perfect model', 'Data leakage only'],
    answer: 1,
    explain: 'A large train/validation gap signals overfitting.',
  },
  {
    id: 'P10',
    module: 'M07',
    kind: 'mcq',
    prompt: 'Which is a classification task?',
    options: [
      'Predicting a house price',
      'Predicting tomorrow’s temperature',
      'Deciding if an email is spam',
      'Forecasting sales',
    ],
    answer: 2,
    explain: 'Spam/not-spam is a discrete label.',
  },
];

/** Grade the placement and list the units it tests out. */
export function placementResult(answers: (number | undefined)[], modules: ModuleV2[]) {
  const grade = gradeMcq(placementQuestions, answers);
  const byModule = new Map<string, boolean[]>();
  placementQuestions.forEach((q, i) =>
    byModule.set(q.module, [...(byModule.get(q.module) ?? []), grade.results[i].correct]),
  );
  const testedOutModules = [...byModule.entries()]
    .filter(([, r]) => r.length >= 2 && r.every(Boolean))
    .map(([id]) => id);
  const testedOut = modules
    .filter(m => testedOutModules.includes(m.id))
    .flatMap(m => m.submodules.flatMap(s => s.units.filter(u => u.depth === 'core').map(u => u.id)));
  return { score: grade.score, max: grade.max, testedOutModules, testedOut };
}
