# AI Engineering — From Grain to Mountain

A free, prerequisite-led path from your first program to a job as an **AI Engineer**, **Forward Deployed Engineer (FDE)** or **MLOps / ML Platform Engineer**: software engineering, DevOps and cloud, system design, machine learning, LLM applications, agents and MLOps — each step tied to an exact free lecture, chapter or doc page, and checked with real assessments instead of tick boxes.

**[Open the learning app](https://ai-engineering-grain-to-mountain.vercel.app)** · **[Download the Android 1.2 preview](https://github.com/Khubaib7-del/AI-Engineering---From-Grain-to-Mountain/releases/tag/v1.2.0-preview.1)** · [Deployment notes](DEPLOYMENT.md)

> **Status, honestly.** The v2 curriculum described below lives on the `rebuild/v2` branch. The deployed website and the Android 1.2 APK were built from the earlier v1 curriculum (21 modules, 777 checkpoints) and do not contain v2 yet. iOS is a target in the source but has never been built or tested on a device.

## The v2 curriculum

| | |
|---|---|
| Role tracks | AI Engineer · Forward Deployed Engineer · MLOps / ML Platform Engineer — one shared trunk, role-specific module order and portfolio |
| Modules | 23, **M00–M22**, in 7 phases (Foundations → Math and models → Language models and apps → Build AI systems → Ship and operate → Go deeper → Career) |
| Units | **295** (262 core, 33 optional deep), grouped into sub-modules |
| Hours | ~1,785 h of core units; ~810 h of optional deep units on top |
| Weekly plan | 158 weeks covering every core unit; prerequisites are never scheduled after the units that need them |
| Assessments | 943 auto-graded multiple-choice questions with explanations, 295 rubric-checked short answers, a practice task with a "done when" per unit, and a rubric-scored capstone per module |
| Library | 756 free resources, typed: 95 courses, 38 books, 164 videos, 58 papers, 346 docs, 55 repos |

### Modules

| Phase | Modules |
|---|---|
| P1 Foundations | M00 Computer & workstation foundations · M01 Python from zero · M02 Engineering tools & environments · M03 CS, algorithms & backend foundations · M04 Data analysis & SQL · M21 DevOps and cloud foundations |
| P2 Math and models | M05 Math for ML · M06 Probability, statistics and evaluation · M07 Classical machine learning · M08 Deep learning and PyTorch |
| P3 Language models and apps | M09 NLP, transformers and language models · M10 LLM application engineering · M11 Search, embeddings and RAG |
| P4 Build AI systems | M12 Agents, tools and protocols · M15 Vision, audio and multimodal · M18 Safety, privacy and responsible engineering |
| P5 Ship and operate | M16 MLOps and data pipelines · M17 Serving, inference and production LLM systems · M22 System design: classic and ML/LLM |
| P6 Go deeper | M13 Adaptation, post-training and RL · M14 LLMs from scratch and research methods (optional for every role) |
| P7 Career | M19 Role tracks, FDE practice and breadth electives · M20 Portfolio, final-year project and job readiness |

Module IDs are stable; M21 and M22 were added in v2, so they are numbered last but studied where each track places them (M21 right after M03 in all three tracks).

### Every unit has the same shape

1. **Learn** — one primary resource with the exact slice to study (e.g. "CS50P Lecture 2 — Loops, 3:28–1:20:45"), what that slice actually covers, and a named fill-in resource for each topic it does not cover.
2. **Read** — a matching chapter or doc page where one exists.
3. **Practice** — a concrete task with a "done when" condition (often an autograder such as check50).
4. **Assess** — at least three multiple-choice questions (80% to pass) and one short answer you self-check against a rubric. A unit is passed only with practice evidence, a passing quiz and checked short answers.

### Role tracks

- **AI Engineer** — reliable LLM and agent products: retrieval, tools, evals, cost and safety. Portfolio: an evaluated RAG product, a bounded observable agent, one shipped app with real users.
- **Forward Deployed Engineer** — everything above plus customer delivery: discovery, scoping, enterprise integration, constrained deployments and handover. Portfolio: a client-engagement case study, a demo plus runbook, the bounded agent.
- **MLOps / ML Platform Engineer** — reproducible, observable, affordable training and serving. Portfolio: a versioned pipeline with CI/CD and rollback, a serving benchmark with an optimisation, monitoring and drift with an incident drill.

### What is not verified yet

- **Weekly plan detail.** Weeks 1–12 have a day-by-day plan. Weeks 13–158 are outlines grouped from the unit order (marked "provisional" in the data and "Outline" in the app); each unit still names its exact slice.
- **One plan for all roles.** The 158-week plan schedules every core unit, including modules only some roles need, so it is longer than any single track requires. Per-role weekly plans are not generated yet.
- **Links and slices.** Resource links and lecture timestamps were checked by the content authors on the date stored with each reference; 16 primary references are still marked `unverified`. Links rot, so re-check before relying on one.
- **Hours** are planning estimates, not measured study time, and nothing here promises a job after a fixed number of months.

## Data and app

- [`data/v2/`](data/v2/) — source of truth: one file per module (`modules/M00.json` … `M22.json`), `tracks.json`, `weeks.json`, `resources.json`, and `legacy-map.json` (every v1 topic ID mapped to a v2 topic or retired, so saved progress migrates).
- [`docs/v2-content-schema.md`](docs/v2-content-schema.md) — the content contract. `learning-companion/tests/content.test.mjs` enforces it on the bundled content (required fields, answer indices, explanations, rubrics, unique IDs, prerequisite order, weekly-plan coverage, legacy-map targets).
- [`learning-companion/`](learning-companion/README.md) — the Expo app (web, Android; iOS untested): landing page, onboarding with an optional placement check drawn from the units, weekly Today plan, mountain map clustered by module, unit pages with Learn / Read / Practice / Assess, module capstones, progress heatmap and streaks, library, guest mode and optional account sync. Run `npm run sync-content` after editing `data/v2/`.

## v1 reference documents

The numbered documents below are the v1 research. They are kept because their filenames are cited elsewhere and some app content is still synced from `data/*.json`; where they disagree with `data/v2/`, v2 wins.

| Document | Purpose |
|---|---|
| [Repository review](00-repository-review.md) | How the source repositories and roadmap.sh fit together |
| [Roadmap and study method](01-roadmap-and-study-system.md) | Prerequisites, pacing and mastery |
| [Granular checklist (v1)](02-granular-curriculum.md) | The 21-module, 777-checkpoint map |
| [Selected courses](03-courses-in-order.md) · [Free books](04-free-books.md) · [Papers](05-papers-reading-order.md) | v1 resource selections |
| [Tools/frameworks](06-tools-and-frameworks.md) · [RAG and agents](07-rag-and-agents-deep-map.md) | Tool choices and the retrieval/agent map |
| [Roles and priorities](08-role-paths-and-priorities.md) · [Projects and assessments](09-projects-and-assessments.md) | Role paths and project evidence |
| [First 28 days](10-first-28-days.md) · [Guided free route](24-guided-free-learning-route.md) | The v1 starter plan (replaced by the v2 weekly plan) |
| [App specification](11-learning-app-spec.md) · [Source audit](12-source-audit-and-maintenance.md) | App acceptance tests; what was inspected and its limits |
| Documents [13](13-foundations-explained.md)–[23](23-independent-teaching-resources.md) | Foundations explained, video companions, coverage audit, agent frameworks, benchmarks and harnesses, project ideas, retrieval and memory, ecosystem drill-down |
| [Learning log template](templates/learning-log.md) | Evidence, misconceptions and next actions |

Start with M00 and CS50P Lecture 0. Finish a Python program you understand before collecting frameworks; choose a role once the fundamentals are done.
