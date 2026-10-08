# AI engineering learning workspace

Owner: Khubaib Nazeer. This workspace contains a prerequisite-led curriculum from beginner computing/Python through mathematics, ML, deep learning, LLM systems, agents, evaluation, deployment and research, plus a personal cross-platform learning companion.

## Start here

Read `README.md`, `01-roadmap-and-study-system.md`, `02-granular-curriculum.md` and `15-coverage-audit-and-learning-extensions.md`. For app work read `learning-companion/AGENTS.md`, `README.md` and `VALIDATION.md` before changing code. Preserve existing source citations and progress identifiers.

## User intent

Assume no prerequisites beyond those explicitly taught. Each topic should expose its subtopics, prerequisites, practical exercises and evidence of understanding. The user prioritizes skill, building and showcasing work over certificates and accepts a one-to-two-year path. Tool examples supplied by the user are starting points, not an exhaustive scope: independently research alternatives and keep conceptual categories separate from vendor names.

Learning includes Python environments/uv/pip, CS foundations, math, classical and applied ML, DL, model architectures, retrieval/embeddings/chunking/vector search, RAG/CAG/memory-augmented generation, agents/frameworks, MCP/plugins, evaluation/benchmarks/costs, ML/LLM operations, serving/infrastructure and research methods. MAG here means Memory Augmented Generation. Saved-course and project leads are evidence to check, not endorsements.

Use public primary resources, legal free books, papers and independently selected video playlists; pair rigorous courses with accessible teachers where useful. Source/syllabus verification does not mean full recordings were watched or repository experiments reproduced. Keep that distinction explicit.

## Organization

- `00-24*.md`: stable ordered research and curriculum documents. Keep names stable because the app's content pipeline and source links use them.
- `data/`: structured learning material and coverage data.
- `templates/`: reusable learning records.
- `App Designer/`: user-supplied design references/skills; preserve originals.
- `learning-companion/`: Expo app, local tests, assets and design records.
- `learning-companion/releases/`: generated installable packages and installation notes when available. Never call a source ZIP or web export an APK.

## Guided learning preference, 8 October 2026

The user wants each current goal attached to a concrete free course/video or reading assignment, rather than navigating a large catalog. Use one primary resource at a time, with optional explanations hidden by default. Days are sequence labels, not deadlines. Provide a small first step and an observable stopping condition. Do not imply every discovered playlist must be finished. `24-guided-free-learning-route.md` and `data/study-guides.json` map 21 modules; all 28 authored lessons have named assignments and matching Harvard notes. This does not mean every one of the 740 concepts has a timestamp or that the entire curriculum has daily scheduling.

## Design decisions, 7 October 2026

The user wants a personal creative product with polished motion, Apple-inspired controls and Lucide icons. The first conservative design and the later orange/green workshop palette were rejected. Current preference: true-black dark theme, neutral charcoal surfaces, white/silver controls, strong readable contrast; neutral light theme. Reference: `https://hoplite.sh` for distinctive composition and depth, and `https://uiarc.dev/components/` for interaction ideas. Do not reintroduce orange/green as the primary palette. An original silver folded-page mark is the current app identity.

Preserve Watch/Build/Recall, completion evidence, progress, notes, prerequisite previews, reminders, theme settings and backups. Device behavior must be tested separately from web screenshots. Never claim an iOS release, hardware frame rate, notification delivery or installable binary from a JS-only export.

Keep this workspace focused on learning and its companion application. Do not mix separate research-project records into it. Record unfinished work and exact validation limits before handing off.

## Repository and publishing

Canonical repository: `https://github.com/Khubaib7-del/AI-Engineering---From-Grain-to-Mountain`, branch `main`. This checkout imports the existing work as focused commits made at publication time; it does not reconstruct or backdate the original development timeline. See `DEPLOYMENT.md` for Vercel and platform status. Preserve the earlier local workspace and its APK until changes are explicitly migrated. Never commit credentials, native signing keys, dependencies, personal backups or generated build directories. APK distribution belongs in a release attachment; the iOS target is not a verified iOS release.
