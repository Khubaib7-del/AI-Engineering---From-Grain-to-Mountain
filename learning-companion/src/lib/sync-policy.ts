import type {LearningState} from './types';
export type ProgressPayload=Pick<LearningState,'version'|'lessons'|'topics'|'verified'>;
export const progressOnly=({version,lessons,topics,verified}:LearningState):ProgressPayload=>({version,lessons,topics,verified});
export function syncDecision(dirty:boolean,localRevision:number,remoteRevision:number):'pull'|'push'|'conflict' {
 return dirty ? (localRevision===remoteRevision?'push':'conflict') : 'pull';
}
