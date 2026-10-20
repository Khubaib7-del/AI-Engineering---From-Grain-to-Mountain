// System prompt: a Socratic tutor grounded in the learner's current unit, role
// track, week and progress. Pure. Quiz answers and explanations are never put
// in the prompt, so the model cannot leak them.
import type { ModuleV2, Profile, ResourceRef, StepKey, Unit, Week } from '../lib/types';

export type GroundingInput = {
  unit?: Unit;
  module?: ModuleV2;
  profile?: Profile;
  trackLabel?: string;
  week?: Week;
  unitStatus?: string;
  steps?: Partial<Record<StepKey, boolean>>;
  passed?: number;
  total?: number;
  streak?: number;
  hoursLeft?: number;
  now?: Date;
};

const ref = (r: ResourceRef) => `${r.title} — ${r.url}${r.slice ? ` (${r.slice})` : ''}`;
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export const TUTOR_RULES = `You are the study tutor inside "Grain to Mountain", a free, self-paced curriculum that takes a learner from zero to AI Engineer / Forward Deployed Engineer / MLOps Engineer (modules M00–M22: tools, Python, maths, ML, transformers, LLM apps, RAG, agents, deployment).

How you teach:
- Be a Socratic tutor. Prefer a guiding question, a hint, or a tiny example over a full solution. Let the learner do the thinking; confirm and correct their reasoning.
- Assessment rule: never give the answer to a quiz question, a short-answer prompt, or a graded practice/problem-set task (e.g. CS50 problem sets checked by check50). If the learner pastes one or asks "which option is right", give at most one hint at a time, point to the exact part of the unit's resource that covers it, and ask them to try. You may confirm whether THEIR reasoning is sound after they commit to an answer.
- Ground answers in the current unit below. When you point to material, cite the unit's resources by title and URL exactly as listed (with the timestamp or chapter from its slice when relevant). Do not invent links; if the unit has no fitting resource, say so and explain briefly.
- Keep replies short (under ~200 words) unless the learner asks for depth. Use plain language; the learner may be a beginner. Code blocks are fine.
- Stay on studying this curriculum. For unrelated requests, answer briefly and steer back.
- If the learner seems stuck or tired, suggest a concrete smaller step or a short break.
- Never ask for, repeat, or reveal API keys or passwords.`;

export function buildSystemPrompt(input: GroundingInput): string {
  const lines: string[] = [TUTOR_RULES, '', '## Learner'];
  const p = input.profile;
  lines.push(`- Role track: ${input.trackLabel ?? p?.track ?? 'not chosen yet'}`);
  if (p) lines.push(`- Level: ${p.level}; plans ${p.hoursPerWeek} h/week`);
  if (input.total) lines.push(`- Progress: ${input.passed ?? 0} of ${input.total} units passed on their path`);
  if (input.hoursLeft !== undefined) lines.push(`- Core hours left: ~${Math.round(input.hoursLeft)}`);
  if (input.streak) lines.push(`- Current study streak: ${input.streak} day(s)`);
  if (input.now) lines.push(`- Today: ${input.now.toDateString()}`);

  const w = input.week;
  if (w) {
    lines.push('', `## This week (week ${w.week}): ${w.title}`, `- Units: ${w.units.join(', ')} (${w.hours} h)`);
    for (const d of (w.detail ?? []).slice(0, 8)) lines.push(`- ${clip(d, 260)}`);
  }

  const u = input.unit;
  if (!u) {
    lines.push('', '## Current unit', 'None selected. Help with the curriculum in general and with planning the week.');
    return lines.join('\n');
  }
  lines.push('', `## Current unit ${u.id}: ${u.title}`);
  if (input.module) lines.push(`Module ${input.module.id} — ${input.module.title} (${input.module.phase})`);
  if (input.unitStatus) lines.push(`Status: ${input.unitStatus}`);
  if (input.steps) {
    const done = (Object.keys(input.steps) as StepKey[]).filter(k => input.steps?.[k]);
    lines.push(`Steps done: ${done.length ? done.join(', ') : 'none yet'} (of learn, read, practice, assess)`);
  }
  lines.push(`Hours: ${u.hours} (${u.depth})`);
  lines.push('Outcomes:', ...u.outcomes.map(o => `- ${o}`));
  lines.push('Learn:', `- ${ref(u.learn)}`);
  if (u.covers.length) lines.push('The Learn resource covers:', ...u.covers.map(c => `- ${c}`));
  if (u.gaps?.length) lines.push('Gaps and the resources that fill them:', ...u.gaps.map(g => `- ${g.topic}: ${ref(g.resource)}`));
  if (u.read) lines.push('Read:', `- ${ref(u.read)}`);
  if (u.backup) lines.push('Backup resource:', `- ${ref(u.backup)}`);
  lines.push(
    `Practice: ${u.practice.title}`,
    `- Brief: ${clip(u.practice.brief, 900)}`,
    `- Done when: ${u.practice.done_when}`,
  );
  if (u.topics.length) lines.push(`Topics: ${u.topics.map(t => t.title).join('; ')}`);
  // Questions only, so the tutor recognises them. Options' correct answers, explanations and rubrics are withheld.
  const qs = u.quiz.map(q => `- ${clip(q.prompt, 240)}`);
  if (qs.length)
    lines.push('Assessment questions for this unit (answers are deliberately NOT provided; hint only, never solve):', ...qs);
  return lines.join('\n');
}
