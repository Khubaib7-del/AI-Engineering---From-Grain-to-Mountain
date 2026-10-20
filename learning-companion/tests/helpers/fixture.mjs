// Small inline v2 curriculum for logic tests. Logic tests must not depend on the
// real content (which changes as the curriculum grows); the real content has its
// own contract test in content.test.mjs.
const ref = (title, url = 'https://example.org/' + encodeURIComponent(title)) => ({
  title,
  url,
  type: 'video',
  free: true,
  verified: '2026-10-20',
});
const mcq = (id, answer = 1, options = ['a', 'b', 'c', 'd']) => ({
  id,
  kind: 'mcq',
  prompt: `Prompt ${id}`,
  options,
  answer,
  explain: `Because ${options[answer]}.`,
});
const short = (id, rubric = ['names the editor', 'names the terminal', 'says what each does']) => ({
  id,
  kind: 'short',
  prompt: `Explain ${id}`,
  rubric,
});

export function unit(id, { prerequisites = [], hours = 2, depth = 'core', read = true, quiz } = {}) {
  return {
    id,
    title: `Unit ${id}`,
    hours,
    depth,
    prerequisites,
    outcomes: [`You can do ${id}.`],
    topics: [{ id: `${id}.T01`, title: `Topic of ${id}` }],
    learn: ref(`Lecture for ${id}`),
    covers: ['the basics'],
    ...(read ? { read: ref(`Reading for ${id}`) } : {}),
    practice: { title: `Practice ${id}`, brief: 'Build the thing.', done_when: 'It runs.' },
    quiz: quiz ?? [mcq(`${id}.Q1`, 1), mcq(`${id}.Q2`, 2), mcq(`${id}.Q3`, 0), short(`${id}.Q4`)],
  };
}

export function moduleOf(id, units, { tracks = ['ai-engineer', 'fde', 'mlops'], prerequisites = [] } = {}) {
  return {
    id,
    phase: 'P1 Foundations',
    title: `Module ${id}`,
    summary: `Summary of ${id}`,
    hours: units.reduce((n, u) => n + u.hours, 0),
    prerequisites,
    tracks,
    submodules: [{ id: `${id}.S1`, title: 'Only submodule', units }],
    capstone: {
      title: `Capstone ${id}`,
      brief: 'Ship it.',
      rubric: [{ criterion: 'Works', levels: ['no', 'partly', 'yes'] }],
      evidence: 'github',
    },
  };
}

// M00: two core units (U02 needs U01). M01: three core units + one deep unit.
export const M00 = moduleOf('M00', [unit('M00.U01'), unit('M00.U02', { prerequisites: ['M00.U01'] })]);
export const M01 = moduleOf(
  'M01',
  [
    unit('M01.U01', { prerequisites: ['M00.U02'], read: false }),
    unit('M01.U02', { prerequisites: ['M01.U01'] }),
    unit('M01.U03', { prerequisites: ['M01.U02'] }),
    unit('M01.U04', { prerequisites: ['M01.U03'], depth: 'deep' }),
  ],
  { prerequisites: ['M00'] },
);
export const modules = [M00, M01];
export const units = modules.flatMap(m => m.submodules.flatMap(s => s.units));
export const tracks = [
  { id: 'ai-engineer', title: 'AI Engineer', summary: '', outcomes: [], moduleOrder: ['M00', 'M01'], portfolio: [] },
  { id: 'mlops', title: 'MLOps', summary: '', outcomes: [], moduleOrder: ['M01', 'M00'], portfolio: [] },
];
export const weeks = [
  { week: 1, title: 'Start', units: ['M00.U01'], hours: 2, allocation: { 'M00.U01': 2 }, detail: ['Day 1: M00.U01 — watch.'] },
  { week: 2, title: 'Then', units: ['M00.U02', 'M01.U01'], hours: 4, provisional: true },
  { week: 3, title: 'Later', units: ['M01.U02', 'M01.U03'], hours: 4, provisional: true },
];
// Legacy topic IDs → v2 topic IDs (null = removed on purpose).
export const legacyMap = { 'M01.01.03': 'M01.U01.T01', 'M00.01.10': null };
