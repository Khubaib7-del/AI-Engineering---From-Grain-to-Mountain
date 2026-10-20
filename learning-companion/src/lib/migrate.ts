// Topic ID migration through legacy-map.json. Idempotent: safe to run on every load.
import type { LearningState } from './types';

export type LegacyMap = Record<string, string | null>;

/**
 * Rename saved topic ticks whose ID appears in the legacy map, then keep any tick
 * whose ID is not part of the current curriculum in `archivedTopics` so no
 * progress is ever silently dropped.
 */
export function migrateTopicIds(
  state: LearningState,
  legacyMap: LegacyMap,
  validIds: Set<string>,
): LearningState {
  const topics: Record<string, boolean> = {};
  const archived: Record<string, boolean> = { ...(state.archivedTopics ?? {}) };
  for (const [id, value] of Object.entries(state.topics)) {
    const mapped = Object.prototype.hasOwnProperty.call(legacyMap, id) ? legacyMap[id] : id;
    if (mapped && validIds.has(mapped)) topics[mapped] = topics[mapped] || value;
    else archived[id] = archived[id] || value;
  }
  // A curriculum update can bring an archived topic back under a new ID.
  for (const [id, value] of Object.entries(archived)) {
    const mapped = Object.prototype.hasOwnProperty.call(legacyMap, id) ? legacyMap[id] : id;
    if (mapped && validIds.has(mapped)) {
      topics[mapped] = topics[mapped] || value;
      delete archived[id];
    }
  }
  const next: LearningState = { ...state, topics, idVersion: 2 };
  if (Object.keys(archived).length) next.archivedTopics = archived;
  else delete next.archivedTopics;
  return next;
}
