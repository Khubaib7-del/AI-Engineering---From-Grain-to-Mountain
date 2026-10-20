# Grain to Mountain v2 — shared content contract

Both the content agent and the app agent build against this. Files live in `data/v2/` (source) and are synced into `learning-companion/src/content/v2/` by `npm run sync-content`.

## Hierarchy
Track (role) → Phase → Module (M00–M22) → Sub-module → Unit → Lesson items

## data/v2/modules/Mxx.json  (ONE FILE PER MODULE, e.g. data/v2/modules/M01.json, each containing one Module object)
```ts
type Module = {
  id: string;            // "M01"
  phase: string;         // "P1 Foundations" etc.
  title: string; summary: string;
  hours: number;         // core hours
  deepHours?: number;    // optional deep track
  prerequisites: string[];   // module ids
  tracks: ("ai-engineer"|"fde"|"mlops")[];  // which roles need it (core)
  optionalFor?: ("ai-engineer"|"fde"|"mlops")[];
  submodules: Submodule[];
  capstone: { title: string; brief: string; rubric: {criterion: string; levels: string[]}[]; evidence: "github"|"url"|"text" };
};
type Submodule = { id: string /* "M01.S2" */; title: string; units: Unit[] };
type Unit = {
  id: string;            // "M01.U07" stable explicit id
  title: string; hours: number; depth: "core"|"deep";
  week?: number;         // suggested week number in the overall core path (1-based)
  prerequisites: string[];   // unit ids
  outcomes: string[];        // "You can …" statements
  topics: { id: string /* keep old Mxx.yy.zz when surviving */; title: string; legacyIds?: string[] }[];
  learn: ResourceRef;        // primary: EXACT slice (lecture/week/chapter/video + timestamps if useful)
  covers: string[];          // what that exact slice actually covers (verified)
  gaps?: { topic: string; resource: ResourceRef }[];  // topics the primary does NOT cover → specific fill-in resource (YouTube video, docs page, article)
  read?: ResourceRef;        // reading
  backup?: ResourceRef;
  practice: { title: string; brief: string; done_when: string; autograder?: string };
  quiz: Question[];          // ≥3 MCQ + ≥1 short
};
type ResourceRef = { resourceId?: string; title: string; url: string; slice?: string /* "Week 2 · Loops (lecture 2:00–1:10:00)" */; type: "course"|"video"|"book"|"doc"|"article"|"paper"|"repo"; free: true|"audit"|"partial"; verified: string /* date or "unverified" */ };
type Question =
  | { id: string; kind: "mcq"; prompt: string; options: string[]; answer: number; explain: string }
  | { id: string; kind: "short"; prompt: string; rubric: string[] };
```

## data/v2/tracks.json
`{ id, title, summary, outcomes[], moduleOrder[], portfolio[] }` for ai-engineer, fde, mlops.

## data/v2/weeks.json
The core path as weeks: `{ week, title, units: string[], hours }[]` — week-by-week granular plan ("Week 3: CS50P Lecture 2 Loops + Git branching"). Replaces the old 28-day plan's role as "Today".

## data/v2/resources.json
Every course, book, video, paper, doc: `{ id, type: "course"|"book"|"video"|"paper"|"doc"|"repo", title, author, url, free, language, notes, modules: string[] }`. Books MUST be type "book" (the Books tab is empty today).

## data/v2/legacy-map.json
`{ [oldTopicId]: newTopicId | null }` so saved progress migrates.

## App-side records (app agent owns)
- activity log: `{ at: ISO, kind: "topic"|"unit"|"quiz"|"practice"|"capstone", id, score? }[]` → heatmap + streak.
- unit status derived: locked / available / in-progress / passed (quiz ≥ 80% MCQ + short answers self-checked + practice evidence).

## data/v2/resources/<module>.json
Each content agent writes the resources its modules use to its own file (e.g. data/v2/resources/M00-M04.json), same shape as resources.json above; the integrator merges and dedupes into data/v2/resources.json.
## data/v2/legacy/<module>.json
Per-module slice of legacy-map.json.

## Rules for content agents
- Write ONLY your own module files. Do not run git commit (the coordinator commits). Do not touch learning-companion/.
- Every unit must name the EXACT slice of the primary (e.g. "CS50P Lecture 2 — Loops", "MIT 18.06 Lecture 3"), list in `covers` what that slice really teaches (verified from its notes/syllabus), and list in `gaps` each unit topic the slice does not teach with a SPECIFIC fill-in (a named YouTube video with URL, docs page, or article). No vague "selected videos".
- Validate every file parses as JSON and matches the schema (write a tiny node/python check).
