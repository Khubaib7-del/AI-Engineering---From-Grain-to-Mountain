import type { ResourceType } from './types';

/** The legacy catalogue labels books "book-or-reference"; the Books filter expects "book". */
export function normaliseType(type: string): ResourceType {
  if (type === 'book-or-reference' || type === 'book') return 'book';
  if (['course', 'paper', 'video', 'doc', 'repo', 'article'].includes(type)) return type as ResourceType;
  return 'doc';
}
