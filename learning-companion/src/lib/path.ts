// Personalised path over v2 content: module order by role, current unit,
// week plan and projected finish. Pure functions.
import { isPassed } from './assess';
import type { LearningState, ModuleV2, Profile, Track, TrackId, Unit, Week } from './types';

export type PathUnit = { unit: Unit; module: ModuleV2; index: number };

export function pathModules(
  modules: ModuleV2[],
  tracks: Track[],
  track: Profile['track'] | undefined,
): ModuleV2[] {
  const byId = new Map(modules.map(m => [m.id, m]));
  const chosen = tracks.find(t => t.id === track);
  if (chosen) {
    const ordered = chosen.moduleOrder.map(id => byId.get(id)).filter((m): m is ModuleV2 => !!m);
    const extra = modules.filter(m => m.tracks.includes(chosen.id) && !chosen.moduleOrder.includes(m.id));
    return [...ordered, ...extra];
  }
  // Undecided: the shared trunk (every module that any role needs), in ID order.
  return [...modules].filter(m => m.tracks.length > 0).sort((a, b) => a.id.localeCompare(b.id));
}

export function pathUnits(modules: ModuleV2[], includeDeep = true): PathUnit[] {
  const out: PathUnit[] = [];
  for (const module of modules)
    for (const sub of module.submodules)
      for (const unit of sub.units)
        if (includeDeep || unit.depth === 'core') out.push({ unit, module, index: out.length });
  return out;
}

export const currentUnit = (units: PathUnit[], state: LearningState) =>
  units.find(u => !isPassed(u.unit.id, state));

export function remainingHours(units: PathUnit[], state: LearningState) {
  return units
    .filter(u => u.unit.depth === 'core' && !isPassed(u.unit.id, state))
    .reduce((n, u) => n + u.unit.hours, 0);
}

export function projectedFinish(hoursLeft: number, hoursPerWeek: number, now = new Date()) {
  const weeks = Math.ceil(hoursLeft / Math.max(1, hoursPerWeek));
  const d = new Date(now);
  d.setDate(d.getDate() + weeks * 7);
  return { weeks, date: d };
}

/** The week you are on: the first week that still has an unpassed unit. */
export function currentWeek(weeks: Week[], state: LearningState) {
  const sorted = [...weeks].sort((a, b) => a.week - b.week);
  return sorted.find(w => w.units.some(id => !isPassed(id, state))) ?? sorted[sorted.length - 1];
}

export const TRACK_LABEL: Record<TrackId | 'undecided', string> = {
  'ai-engineer': 'AI Engineer',
  fde: 'Forward Deployed Engineer',
  mlops: 'MLOps Engineer',
  undecided: 'Shared trunk (role not chosen yet)',
};
