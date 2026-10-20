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

/**
 * The full path has ~300 units, too many to draw (and read) at once. Modules are
 * shown as single summit-camp nodes, and only the modules in `expanded` open up
 * into their units and capstone.
 */
export function clusteredNodes(units: PathEntry[], state: LearningState, expanded: Set<string>): MapNode[] {
  const nodes: MapNode[] = [];
  const all = v2Nodes(units, state);
  const groups = new Map<string, PathEntry[]>();
  for (const u of units) groups.set(u.module.id, [...(groups.get(u.module.id) ?? []), u]);
  const seen = new Set<string>();
  for (const n of all) {
    if (expanded.has(n.moduleId)) {
      nodes.push(n);
      continue;
    }
    if (seen.has(n.moduleId)) continue;
    seen.add(n.moduleId);
    const list = groups.get(n.moduleId) ?? [];
    const passed = list.filter(u => u.status === 'passed').length;
    const capstoneDone = !!state.capstones?.[n.moduleId]?.submittedAt;
    const status: MapNode['status'] =
      list.length && passed === list.length && capstoneDone
        ? 'passed'
        : passed || list.some(u => u.status === 'in-progress')
          ? 'in-progress'
          : list.some(u => u.status === 'available')
            ? 'available'
            : 'locked';
    nodes.push({
      id: n.moduleId,
      kind: 'module',
      title: n.moduleTitle,
      moduleId: n.moduleId,
      moduleTitle: n.moduleTitle,
      phase: n.phase,
      status,
      progress: list.length ? passed / list.length : 0,
      hours: list.filter(u => u.unit.depth === 'core').reduce((h, u) => h + u.unit.hours, 0),
      count: list.length,
    });
  }
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
