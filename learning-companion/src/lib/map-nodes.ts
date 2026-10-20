import type { MapNode } from '../components/mountain-map';
import type { LearningState, Module } from './types';
import type { PathEntry } from './use-path';
import { topicsOfModule } from './content';

/** v2: one node per unit, then the module capstone. */
export function v2Nodes(units: PathEntry[], state: LearningState): MapNode[] {
  const nodes: MapNode[] = [];
  units.forEach((u, i) => {
    nodes.push({
      id: u.unit.id,
      kind: 'unit',
      title: u.unit.title,
      moduleId: u.module.id,
      moduleTitle: u.module.title,
      phase: u.module.phase,
      status: u.status,
      progress: u.progress,
      hours: u.unit.hours,
    });
    const last = i === units.length - 1 || units[i + 1].module.id !== u.module.id;
    if (last) {
      const moduleUnits = units.filter(x => x.module.id === u.module.id);
      const allPassed = moduleUnits.every(x => x.status === 'passed');
      const submitted = !!state.capstones?.[u.module.id]?.submittedAt;
      nodes.push({
        id: `${u.module.id}.capstone`,
        kind: 'capstone',
        title: u.module.capstone.title,
        moduleId: u.module.id,
        moduleTitle: u.module.title,
        status: submitted ? 'passed' : allPassed ? 'available' : 'locked',
        progress: submitted ? 1 : 0,
      });
    }
  });
  return nodes;
}

/** Fallback before v2 content exists: one node per legacy module. */
export function legacyNodes(modules: Module[], state: LearningState): MapNode[] {
  return modules.map(m => {
    const ids = topicsOfModule(m.id).map(t => t.id);
    const ticked = ids.filter(id => state.topics[id]).length;
    const status = state.verified[m.id]
      ? 'passed'
      : ticked
        ? 'in-progress'
        : m.prerequisites.every(p => state.verified[p])
          ? 'available'
          : 'locked';
    return {
      id: m.id,
      kind: 'module',
      title: m.title,
      moduleId: m.id,
      moduleTitle: m.title,
      status,
      progress: ids.length ? ticked / ids.length : 0,
      hours: m.hours,
    };
  });
}
