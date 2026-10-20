import curriculum from '../content/curriculum.json';
import plan from '../content/first-28-days.json';
import catalog from '../content/resources.json';
import books from '../content/books.json';
import courses from '../content/courses.json';
import videos from '../content/video-companions.json';
import guides from '../content/study-guides.json';
import topicIndex from '../content/topic-index.json';
import { rawLegacyMap, rawModules, rawResources, rawTracks, rawWeeks } from '../content/v2';
import type {
  Lesson,
  Module,
  ModuleV2,
  Resource,
  ResourceV2,
  StudyGuide,
  TopicRef,
  Track,
  Unit,
  Week,
} from './types';
import type { LegacyMap } from './migrate';
import { normaliseType } from './resource-type';
import { weekOfUnit } from './path';

export { normaliseType };

// ---------------------------------------------------------------------------
// Legacy curriculum (21 modules, 777 topics, 28 guided days)
// ---------------------------------------------------------------------------
export const studyGuides: StudyGuide[] = guides;
export const modules: Module[] = curriculum.modules;
export const lessons: Lesson[] = plan.days;

/** Every legacy topic with its explicit stable ID (never derived from list position). */
export const topics: TopicRef[] = topicIndex as TopicRef[];
export const topicsOfModule = (moduleId: string) => topics.filter(t => t.moduleId === moduleId);
export const allTopicIds = topics.map(t => t.id);
export const addedTopicIds = new Set(topics.filter(t => t.added).map(t => t.id));
export const conceptCount = topics.length;

export const phases = [
  {
    title: 'Base Camp',
    caption: 'Tools, Python and the maths',
    ids: ['M00', 'M01', 'M02', 'M03', 'M04', 'M05', 'M06'],
  },
  {
    title: 'Camp 1 · Understand the models',
    caption: 'From prediction to transformers',
    ids: ['M07', 'M08', 'M09'],
  },
  {
    title: 'Camp 2 · Build AI systems',
    caption: 'Applications, retrieval and agents',
    ids: ['M10', 'M11', 'M12', 'M13', 'M14', 'M15'],
  },
  {
    title: 'Summit Ridge · Ship & specialise',
    caption: 'Reliable systems and original work',
    ids: ['M16', 'M17', 'M18', 'M19', 'M20'],
  },
];

// ---------------------------------------------------------------------------
// v2 curriculum (synced from data/v2 by scripts/sync-content.mjs)
// ---------------------------------------------------------------------------
const isModule = (m: unknown): m is ModuleV2 =>
  !!m &&
  typeof m === 'object' &&
  typeof (m as ModuleV2).id === 'string' &&
  Array.isArray((m as ModuleV2).submodules);

export const v2Modules: ModuleV2[] = rawModules.filter(isModule).sort((a, b) => a.id.localeCompare(b.id));
export const tracks: Track[] = Array.isArray(rawTracks) ? (rawTracks as Track[]) : [];
export const weeks: Week[] = Array.isArray(rawWeeks)
  ? (rawWeeks as Week[]).filter(w => Array.isArray(w.units))
  : [];
export const legacyMap: LegacyMap =
  rawLegacyMap && typeof rawLegacyMap === 'object' ? (rawLegacyMap as LegacyMap) : {};
export const hasV2 = v2Modules.length > 0;
/** Unit ID → first week of the weekly plan that schedules it (weeks.json is the source of truth). */
export const unitWeek = weekOfUnit(weeks);

export const allUnits: { unit: Unit; module: ModuleV2 }[] = v2Modules.flatMap(module =>
  module.submodules.flatMap(s => s.units.map(unit => ({ unit, module }))),
);
export const unitIds = new Set(allUnits.map(u => u.unit.id));
export const findUnit = (id: string) => allUnits.find(u => u.unit.id === id);
export const findModuleV2 = (id: string) => v2Modules.find(m => m.id === id);
export const v2TopicIds = allUnits.flatMap(u => u.unit.topics.map(t => t.id));
/** Core hours: the sum of core unit hours, which is also the total of the weekly plan. */
export const v2CoreHours = allUnits.filter(u => u.unit.depth === 'core').reduce((n, u) => n + u.unit.hours, 0);
export const v2DeepHours = allUnits.filter(u => u.unit.depth === 'deep').reduce((n, u) => n + u.unit.hours, 0);
/** v2 phases ("P1 Foundations" …) with their modules, in module order. */
export const v2Phases: { title: string; modules: ModuleV2[] }[] = (() => {
  const out: { title: string; modules: ModuleV2[] }[] = [];
  for (const m of v2Modules) {
    const last = out.find(p => p.title === m.phase);
    if (last) last.modules.push(m);
    else out.push({ title: m.phase, modules: [m] });
  }
  return out.sort((a, b) => a.title.localeCompare(b.title));
})();
/** IDs a saved topic tick may use: v2 unit topics plus the legacy topics. */
export const validTopicIds = new Set([...allTopicIds, ...v2TopicIds]);

// ---------------------------------------------------------------------------
// Library: one deduplicated catalogue across legacy and v2 sources.
// ---------------------------------------------------------------------------
const canonicalLink = (value: string) => {
  try {
    const url = new URL(value);
    for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key);
    if (!url.search) url.pathname = url.pathname.replace(/\/$/, '');
    return url.toString();
  } catch {
    return value;
  }
};

const legacyCatalog: Resource[] = catalog.map(r => {
  const video = courses.find(c => c.id === r.id)?.video;
  return {
    id: r.id,
    title: r.title,
    url: r.url,
    type: normaliseType(r.type),
    language: r.language,
    notes: r.notes,
    video: video && canonicalLink(video) !== canonicalLink(r.url) ? video : undefined,
  };
});
const bookCatalog: Resource[] = books.map(b => ({
  id: b.id,
  title: b.title,
  url: b.url,
  type: 'book',
  modules: b.stage,
  notes: b.access,
}));
const videoCatalog: Resource[] = videos.map(v => ({ ...v, type: normaliseType(v.type) }));
const v2Catalog: Resource[] = (Array.isArray(rawResources) ? (rawResources as ResourceV2[]) : []).map(r => ({
  id: r.id,
  title: r.title,
  url: r.url,
  type: normaliseType(r.type),
  author: r.author,
  language: r.language,
  notes: r.notes,
  modules: r.modules?.join('/'),
}));

export const resources: Resource[] = (() => {
  const unique = new Map<string, Resource>();
  for (const resource of [...v2Catalog, ...legacyCatalog, ...bookCatalog, ...videoCatalog]) {
    const key = canonicalLink(resource.url);
    const existing = unique.get(key);
    if (!existing) unique.set(key, { ...resource });
    else {
      const names = new Set(
        [...(existing.modules ?? '').split('/'), ...(resource.modules ?? '').split('/')].filter(Boolean),
      );
      existing.modules = [...names].join('/') || undefined;
      const note = resource.notes?.trim();
      if (note && !existing.notes?.includes(note))
        existing.notes = [existing.notes, note].filter(Boolean).join(' ');
      existing.video ??= resource.video;
    }
  }
  return [...unique.values()];
})();

/** Units whose Learn or Read step uses a resource, for "Used in" links in the Library. */
export function unitsUsing(resource: Resource) {
  const key = canonicalLink(resource.url);
  return allUnits
    .filter(({ unit }) =>
      [unit.learn, unit.read, unit.backup].some(
        ref => ref && (ref.resourceId === resource.id || canonicalLink(ref.url).startsWith(key)),
      ),
    )
    .map(({ unit }) => unit.id);
}
