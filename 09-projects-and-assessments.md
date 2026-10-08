# Build, evaluate and showcase

Projects follow prerequisites, not a race to ship the most complex demo. Keep several exercises private until you can explain them. Publish the strongest case studies; quality matters more than count.

| Project | After | Deliverable | Assessment / comparison | Showcase |
|---|---|---|---|---|
| J01 Study tracker CLI | M01/M02 | Add/list/complete study tasks; JSON persistence, tests and README | Invalid input, missing file and restart behavior; unseen requirement change | Explain Python concepts and one bug you fixed |
| J02 Data-quality explorer | M04/M06 | SQL schema, cleaning report and plots on an openly usable dataset | Missingness, joins, duplicates, sampling bias and uncertainty | Dataset card and reproducible analysis |
| J03 Classical ML baseline | M07 | scikit-learn pipeline and held-out evaluation | Dummy baseline versus model; group/time leakage; calibration and subgroup errors | Honest model card and metric choice |
| J04 Neural model internals | M08 | Tiny NumPy network plus PyTorch training loop | Gradient check; overfit one batch; seed/schedule comparison | Explain backprop and training diagnosis |
| J05 Structured extraction service | M10 | Typed output, retries, validation, streaming/UI when useful | Gold examples, refusals, malformed input, timeout, cost/latency | Product demo and measured quality |
| J06 Evidence-based knowledge assistant | M11 | Open corpus, permission-aware retrieval, citations and abstention | BM25/dense/hybrid/rerank; chunk ablation; answer and retrieval scores separately | Failure gallery, evaluation set and benchmark |
| J07 Bounded tool agent | M12 | Tools, state, checkpoint/resume and inspectable traces | Workflow baseline, max-step failures, denied actions, retries and duplicate side effects | Explain where agency helps and where it does not |
| J08 Adaptation or small LM | M13/M14 | LoRA comparison OR a small trained decoder | Held-out quality before/after; memory/compute; contamination checks | Research-style report with ablations |
| J09 Production lifecycle | M16/M17 | Container, model/data versions, CI, rollout/rollback and monitoring | Load, p95 latency, failed dependency, rollback and drift simulation | Architecture and incident exercise |
| J10 Specialty capstone | M20 | Useful problem with real users and research/engineering depth | Agreed metric, strong baseline, budget, failure analysis and user feedback | Final-year report, demo and reproducible repository |
| J11 Personal learning companion | Foundations + later mobile project | Android-first cross-platform app driven by curriculum manifest | Notification reliability, offline progress, missed-day adaptation and retention | See 11-learning-app-spec.md; build later |

## Assessment rubric

Score each dimension 0–3: explanation, independent implementation, debugging, measurement, reproducibility and communication. A stage should have no zero in a core dimension before progressing. Do not “pass” by averaging excellent presentation with missing understanding.

Assessment should include an unseen change: add a data type, swap an embedding model, create a permission restriction, simulate a network failure or explain a new learning curve. Avoid questions that only repeat a tutorial.

## A good repository contains

Problem and intended users; licensed dataset source; exact environment/config; run command; baseline; held-out evaluation; uncertainty and limitations; failure cases; architecture; tests appropriate to the system; cost/compute notes; short demo; and next steps grounded in findings.

Your LinkedIn post can show the user problem, the measured result and one technical lesson. Do not claim general superiority from a small cherry-picked benchmark.

## Final-year project options to keep open

- A document assistant for a specific academic workflow, evaluated on actual questions and source grounding.
- A multilingual retrieval system where language/tokenization/chunking trade-offs are measured.
- A model adaptation study on a licensed focused dataset with a fair prompting/RAG baseline.
- An inference optimization project with reproducible load and memory benchmarks.
- A learning companion that uses curated curriculum and evidence-based assessments; add AI only where it improves learning.

The coding harness is still an optional later direction. Choose after the broader startup discussion and after a real user problem is established. For the final-year project, commit to one primary question and a deliverable feasible with your supervisor, calendar and compute budget.

## Scope a capstone in 12–16 weeks

Weeks 1–2: user/problem interviews and dataset/permission checks. Weeks 3–4: baseline and evaluation protocol. Weeks 5–8: implementation and iterative experiments. Weeks 9–11: deployment, UX and failure handling. Weeks 12–14: user testing and analysis. Weeks 15–16: reproducible report and demo. Cut features before cutting evaluation.

