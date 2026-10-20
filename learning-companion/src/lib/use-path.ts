import { useMemo } from 'react';
import { findUnit, hasV2, lessons, modules, tracks, unitIds, v2Modules, weeks } from './content';
import { stepFraction, unitStatus, type UnitStatus } from './assess';
import {
  currentUnit,
  currentWeek,
  nextInWeek,
  pathModules,
  pathUnits,
  projectedFinish,
  remainingHours,
  type PathUnit,
} from './path';
import { useLearning } from './store';

export type PathEntry = PathUnit & { status: UnitStatus; progress: number };

/** The learner's personalised path, computed from content + their saved state. */
export function usePath() {
  const { state } = useLearning();
  return useMemo(() => {
    const track = state.profile?.track;
    const mods = pathModules(v2Modules, tracks, track);
    const units: PathEntry[] = pathUnits(mods).map(u => ({
      ...u,
      status: unitStatus(u.unit, state, unitIds),
      progress: stepFraction(u.unit, state),
    }));
    const current = currentUnit(units, state, unitIds) as PathEntry | undefined;
    const hoursLeft = remainingHours(units, state);
    const hoursPerWeek = state.profile?.hoursPerWeek ?? 8;
    const finish = projectedFinish(hoursLeft, hoursPerWeek);
    const week = weeks.length ? currentWeek(weeks, state) : undefined;
    // Today follows the weekly plan: the next open unit of this week, else the next on your role path.
    const today = (nextInWeek(week, units, state, unitIds) as PathEntry | undefined) ?? current;
    const passed = units.filter(u => u.status === 'passed').length;
    return {
      hasV2,
      modules: mods,
      units,
      current,
      today,
      hoursLeft,
      hoursPerWeek,
      finish,
      week,
      passed,
      legacyModules: modules,
      lessons,
    };
  }, [state]);
}

export const unitTitle = (id: string) =>
  findUnit(id)?.unit.title ??
  lessons.find(l => l.id === id)?.title ??
  modules.find(m => m.id === id)?.title ??
  id;
