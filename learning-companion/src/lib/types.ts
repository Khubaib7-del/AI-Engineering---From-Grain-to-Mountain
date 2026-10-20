// ---------------------------------------------------------------------------
// Legacy (v1) curriculum: 21 modules of topic strings and the first 28 days.
// ---------------------------------------------------------------------------
export type Task = { kind: string; description: string };
export type StudyLink = { title: string; url: string };
export type StudyGuide = {
  moduleId: string;
  primary: StudyLink;
  reading: StudyLink;
  practice: StudyLink;
  optional: StudyLink[];
  assignment: string;
  finish: string;
  access: string;
  checked: string;
};
export type Lesson = {
  id: string;
  day: number;
  title: string;
  moduleIds: string[];
  topicIds: string[];
  resourceId: string;
  resourceUrl: string;
  estimatedMinutes: number;
  prerequisites: string[];
  tasks: Task[];
  completionEvidence: string;
  study?: {
    title: string;
    assignment: string;
    readingTitle: string;
    readingUrl: string;
    stopWhen: string;
    smallStep: string;
    playlistUrl: string;
  };
};
export type Module = {
  id: string;
  title: string;
  hours: number;
  prerequisites: string[];
  course: string;
  gate: string;
  groups: { title: string; topics: string[]; addedOn?: string }[];
};
/** One legacy topic with its explicit, stable ID (see scripts/sync-content.mjs). */
export type TopicRef = { id: string; moduleId: string; group: number; title: string; added?: boolean };
export type ResourceType = 'course' | 'book' | 'paper' | 'video' | 'doc' | 'repo' | 'article';
export type Resource = {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  author?: string;
  language?: string;
  notes?: string;
  modules?: string;
  video?: string;
};

// ---------------------------------------------------------------------------
// v2 curriculum contract (V2-SCHEMA.md)
// ---------------------------------------------------------------------------
export type TrackId = 'ai-engineer' | 'fde' | 'mlops';
export type ResourceRef = {
  resourceId?: string;
  title: string;
  url: string;
  slice?: string;
  type: ResourceType;
  free: true | 'audit' | 'partial';
  verified: string;
};
export type McqQuestion = {
  id: string;
  kind: 'mcq';
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
};
export type ShortQuestion = { id: string; kind: 'short'; prompt: string; rubric: string[] };
export type Question = McqQuestion | ShortQuestion;
export type Unit = {
  id: string;
  title: string;
  hours: number;
  depth: 'core' | 'deep';
  week?: number;
  prerequisites: string[];
  outcomes: string[];
  topics: { id: string; title: string; legacyIds?: string[] }[];
  learn: ResourceRef;
  covers: string[];
  gaps?: { topic: string; resource: ResourceRef }[];
  read?: ResourceRef;
  backup?: ResourceRef;
  practice: { title: string; brief: string; done_when: string; autograder?: string };
  quiz: Question[];
};
export type Submodule = { id: string; title: string; units: Unit[] };
export type Capstone = {
  title: string;
  brief: string;
  rubric: { criterion: string; levels: string[] }[];
  evidence: 'github' | 'url' | 'text';
};
export type ModuleV2 = {
  id: string;
  phase: string;
  title: string;
  summary: string;
  hours: number;
  deepHours?: number;
  prerequisites: string[];
  tracks: TrackId[];
  optionalFor?: TrackId[];
  submodules: Submodule[];
  capstone: Capstone;
};
export type Track = {
  id: TrackId;
  title: string;
  summary: string;
  outcomes: string[];
  moduleOrder: string[];
  portfolio: string[];
};
export type Week = {
  week: number;
  title: string;
  units: string[];
  hours: number;
  /** Auto-grouped week whose day-by-day detail is not written yet. */
  provisional?: boolean;
  /** Day-by-day lines ("Day 1: M00.U06 — …") for fully planned weeks. */
  detail?: string[];
  /** Hours this week gives to each unit (a unit can span weeks). */
  allocation?: Record<string, number>;
};
export type ResourceV2 = {
  id: string;
  type: ResourceType;
  title: string;
  author?: string;
  url: string;
  free?: boolean | string;
  language?: string;
  notes?: string;
  modules?: string[];
};

// ---------------------------------------------------------------------------
// Learner state. The cloud payload keeps `version: 1` (the Supabase table
// checks it) and carries the newer records as optional extra keys.
// ---------------------------------------------------------------------------
export type LessonWork = { tasks: boolean[]; evidence: string; completedAt?: string; reviews: string[] };
export type Settings = {
  theme: 'system' | 'light' | 'dark';
  reminders: boolean;
  times: string[];
  weekdays: number[];
  quietStart: string;
  quietEnd: string;
};
export type Level = 'new' | 'some-python' | 'cs-student' | 'developer';
export type Profile = {
  track: TrackId | 'undecided';
  level: Level;
  hoursPerWeek: number;
  placement?: { score: number; max: number; at: string };
  /** Units marked as already known by the placement check. */
  testedOut: string[];
  startedAt: string;
  onboarded: boolean;
};
export type McqAttempt = { at: string; score: number; max: number; answers: number[] };
export type ShortAnswer = { text: string; checks: boolean[]; at: string };
export type StepKey = 'learn' | 'read' | 'practice' | 'assess';
export type UnitWork = {
  steps: Partial<Record<StepKey, string>>;
  evidence?: string;
  attempts: McqAttempt[];
  short: Record<string, ShortAnswer>;
  passedAt?: string;
};
export type CapstoneWork = { url: string; scores: number[]; submittedAt?: string };
export type ActivityKind = 'topic' | 'unit' | 'quiz' | 'practice' | 'capstone' | 'lesson' | 'step' | 'review';
export type Activity = { at: string; kind: ActivityKind; id: string; score?: number };
export type LearningState = {
  version: 1;
  lessons: Record<string, LessonWork>;
  topics: Record<string, boolean>;
  verified: Record<string, string>;
  settings: Settings;
  profile?: Profile;
  units?: Record<string, UnitWork>;
  capstones?: Record<string, CapstoneWork>;
  activity?: Activity[];
  /** Topic ticks whose old ID no longer exists in the curriculum (kept, not lost). */
  archivedTopics?: Record<string, boolean>;
  /** 2 once legacy topic IDs have been migrated through legacy-map.json. */
  idVersion?: number;
};
