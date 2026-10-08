# Coverage audit of your saved material

Reviewed 2026-10-07. Your saved posts are useful discovery lists. The learning route is broader: fundamentals → models → applications → evaluated agents → operations → a specialty. They do not establish mastery or guarantee employment. The original path has 21 modules and 740 checkpoints; the extensions below add depth without renumbering saved app progress.

## What is already covered, and what needed expansion

| Area | Existing route | Result of this pass |
|---|---|---|
| Computer/Python/uv/Git/CS/SQL | M00–M04 | Covered; CS50P remains primary, additional beginner videos are alternatives |
| Mathematics, ML, applied ML | M05–M07 | Covered; Khan bridge, Andrew Ng alternative, CS229 later theory |
| DL/PyTorch/NLP/transformers | M08–M09 | Covered; Karpathy exercises added for implementation depth |
| GenAI, RAG, LlamaIndex, embeddings/vector DBs | M10–M11 | Covered; CAG/memory comparison expanded below |
| Agents, tools, MCP, permissions | M12/M18 | Covered basics; explicit framework comparison, plugins and swarms added |
| Open-weight architecture/post-training | M09/M13/M14/M17 | Covered basics; model-card/config/source inspection exercise added |
| DevOps, MLOps, LLMOps | M02/M03/M16/M17 | Covered components; distinct lifecycle responsibilities explained below |
| Costs, evaluations and observability | M10/M12/M16/M17 | Covered basics; budgets, cost per success and named benchmark experiment added |
| Coding harnesses/purposeful agents | M12/M20 | Generic foundations existed; source-study and controlled comparison now specified |
| Research and FYP | M14/M20 | Existing research method; 20 project ideas triaged with prerequisites and evidence |

This is a broad engineering foundation with selected depth tracks, not a finite list of every future framework. The original 28 daily lessons remain a first month; these extensions are later units, not an already scheduled two-year daily plan.

## Terms that should stay distinct

**Software engineering** covers requirements, code, tests, interfaces, data structures, maintenance and team work. **DevOps/platform engineering** covers delivery, infrastructure, reliability, secrets, telemetry and incidents. **MLOps** adds dataset lineage, experiments, model registry, train/serve skew, drift and retraining. **LLMOps** adds prompts/context/tool versions, model routing, token budgets, retrieval quality, agent trajectories, feedback and evaluation gates. These overlap; tools such as MLflow or Langfuse support parts of a lifecycle rather than being the lifecycle itself.

Your stack is mapped across M02–M17: Python/SQL first; C++ later for systems; NumPy/pandas/Polars in M04; sklearn/SciPy/Optuna in M07; PyTorch first and TensorFlow/Keras awareness in M08; Hugging Face in M09; LangChain/LlamaIndex in M11/M12; MLflow/W&B/DVC/Feast in M16; FastAPI/ONNX/Ray in M03/M17; Airflow/Prefect/Kedro in M16; Docker/Kubernetes/CUDA in M16/M17; Qdrant/Milvus/Redis in M11. “Perfect” likely means Prefect, “Reddis” means Redis. NVIDIA is a vendor/ecosystem, not a single infrastructure library. No need to master every alternative before shipping one evaluated system.

## Additional units and prerequisite gates

The machine-readable version is [learning extensions](data/learning-extensions.json). Each unit requires its listed modules; module prerequisites apply transitively. Estimated hours are additional practice allowances, not promises.

### X01 — Agent frameworks and contracts · after M12 · 12 hours

- [ ] X01.01 Rebuild an observation/tool/result loop in plain Python before adding a framework.
- [ ] X01.02 Compare tool schemas, state, persistence, retries, streaming and termination.
- [ ] X01.03 Run identical mocked-tool tasks in LangGraph and one contrasting framework.
- [ ] X01.04 Compare Python and TypeScript ecosystems; distinguish framework, service and model provider.
- [ ] X01.05 Check license, release/version, provider assumptions, telemetry and self-hosting.
- [ ] X01.06 Measure overhead, recoverability and testability rather than counting integrations.

**Evidence:** one baseline plus two implementations, fixed tasks, traces and a decision record. See [framework comparison](16-agent-frameworks-and-protocols.md).

### X02 — MCP, skills and plugins · after M12, M18 · 14 hours

- [ ] X02.01 Host/client/server boundaries, discovery and capability negotiation.
- [ ] X02.02 Tools versus resources versus prompts; JSON Schema and structured errors.
- [ ] X02.03 stdio versus HTTP transport; lifecycle, cancellation and reconnection.
- [ ] X02.04 Authentication versus authorization; scoped credentials and user consent.
- [ ] X02.05 Version pinning, schema changes and backward compatibility.
- [ ] X02.06 Tool-output injection, untrusted metadata and permission checks outside the LLM.
- [ ] X02.07 Plugin packaging and skill instructions are host-specific; loading text grants no authority.
- [ ] X02.08 A2A peer-agent contracts versus MCP tool/service connectivity.

**Evidence:** read-only corpus MCP server with malformed-input, denied-access, disconnect and injection tests. Then add one reversible action behind explicit authorization. [MCP](https://modelcontextprotocol.io/docs/getting-started/intro), [A2A](https://a2a-protocol.org/latest/).

### X03 — Agent swarms and coordination · after M12, M18 · 16 hours

- [ ] X03.01 Supervisor/worker, handoff, parallel fan-out and shared blackboard patterns.
- [ ] X03.02 Independent work versus dependencies; async execution and backpressure.
- [ ] X03.03 Shared memory consistency, provenance, duplicate actions and idempotency.
- [ ] X03.04 Message/context budgets, noisy coordination and cascading errors.
- [ ] X03.05 Worker failure, timeout, cancellation and bounded recovery.
- [ ] X03.06 A single capable agent versus several specialists at equal total budget.
- [ ] X03.07 Measure speed, success, cost and unwanted actions; stop when delegation hurts.

**Evidence:** single-agent and three-worker research systems tested on the same unseen tasks. A swarm is an orchestration pattern, not proof of intelligence.

### X04 — Harness internals and benchmarks · after M03, M12, M18 · 24 hours

- [ ] X04.01 Model adapter, context builder, tool executor and event loop boundaries.
- [ ] X04.02 Filesystem, shell, patching, Git/worktrees and deterministic verification.
- [ ] X04.03 Sandbox, secrets, network permissions and irreversible-action gates.
- [ ] X04.04 Resume, checkpoint, compaction and evidence lost through summaries.
- [ ] X04.05 Trace one source-code execution path and record the pinned commit.
- [ ] X04.06 Pick a task-family benchmark and inspect dataset, environment and grader.
- [ ] X04.07 Hold model fixed while changing harness; hold harness fixed while changing model.
- [ ] X04.08 Equal budgets, multiple seeds, paired comparisons and contamination controls.
- [ ] X04.09 UI exposes capabilities; source/traces show actual behavior. Evaluate both later.

**Evidence:** source reading notes and reproducible baseline/ablation table. See [benchmark and harness guide](17-benchmarks-costs-and-harness-study.md).

### X05 — LLM economics and LLMOps · after M10, M12, M16, M17 · 18 hours

- [ ] X05.01 Input/output/cached tokens, tool calls, retries and reasoning-token billing where exposed.
- [ ] X05.02 Costs per request, successful task and active user; report failure spend.
- [ ] X05.03 Budget reservations, parallel overspend, time/step limits and cancellation.
- [ ] X05.04 Cache invalidation, batching, routing, context trimming and fallback quality.
- [ ] X05.05 API versus self-hosting: GPU utilization, idle time, storage and operations.
- [ ] X05.06 TTFT, per-token latency, end-to-end p95 and queue delay.
- [ ] X05.07 Version prompts, tools, corpus, model and evaluation; canary and rollback.
- [ ] X05.08 Drift/quality slices, privacy-redacted traces and incident response.

**Evidence:** ledger, fixed-budget experiment and rollback drill; never optimize only token price while ignoring success.

### X06 — Open-weight model architecture · after M09, M13, M14 · 24 hours

- [ ] X06.01 Model card, license, tokenizer, config, tensors and reference implementation.
- [ ] X06.02 Embedding/attention/MLP/norm/residual paths; trace dimensions manually.
- [ ] X06.03 Dense versus MoE; total versus active parameters, routing and load balance.
- [ ] X06.04 Positional encoding, attention variants and KV memory calculation.
- [ ] X06.05 Base/instruct/reasoning/distilled checkpoints and chat templates.
- [ ] X06.06 Distinguish architecture, pretraining corpus, post-training recipe and runtime.
- [ ] X06.07 Implement one block at toy scale and compare outputs with a reference.
- [ ] X06.08 Inspect unavailable data/weights/training details; open weights do not imply reproducible training.

**Evidence:** architecture walkthrough of a pinned small model and one toy reproduction. Start with [Qwen3](https://github.com/QwenLM/Qwen3), then study [DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3) and [DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1) as different architecture/post-training examples. These are study examples, not claims about today's best model.

### X07 — RAG, cache and memory experiments · after M09, M11, M12 · 16 hours

- [ ] X07.01 Corpus knowledge versus user/session memory; provenance, TTL and deletion.
- [ ] X07.02 Retrieval, long-context prompting and KV/prefix caching have different roles.
- [ ] X07.03 Cold/warm cache, cache invalidation and stale facts after corpus updates.
- [ ] X07.04 Bounded versus growing corpus; context limits and distractor sensitivity.
- [ ] X07.05 Memory extraction/write/read policies and erroneous remembered facts.
- [ ] X07.06 Compare citation correctness, answer accuracy, leakage, latency and cost.

**RAG** retrieves relevant external evidence at question time. **CAG**, in the [CAG paper](https://arxiv.org/abs/2412.15605), preloads a bounded knowledge corpus into context and reuses cached processing; it does not universally replace retrieval. **MAG means Memory Augmented Generation** here, as you clarified. This is a category rather than one uniquely standardized implementation. Memory and retrieval/caching can coexist. Compare the strategies on the same corpus, including updates and cold-start cost; see [the deeper memory map](21-retrieval-vector-databases-and-memory.md).

### X08 — Paper reproduction and purposeful product · after M12, M14, M18 · 20 hours

- [ ] X08.01 Separate a paper's contribution from a framework's current features.
- [ ] X08.02 Reproduce a reduced-scale baseline and one ablation with a held-out split.
- [ ] X08.03 Write down data limitations, compute budget and failed attempts.
- [ ] X08.04 Identify a user and recurring workflow; compare with an ordinary scripted solution.
- [ ] X08.05 Validate usability, quality, permissions and maintenance with actual users.
- [ ] X08.06 Publish evidence and limitations, not an employment guarantee.

**Evidence:** a technical report plus a small user-tested tool. Choose one project from [the project review](18-final-year-projects-reviewed.md), not twenty simultaneous projects.

## Study sequence

M00–M09 → M10/M11 → M12 → X01 → M18/X02 → X03 or X04. Follow the M16/M17 branch before X05; follow M13/M14 before X06 and X08. X07 follows M11/M12. The eight optional extensions total 144 planning hours beyond the original 1,720; they can overlap capstone work, so do not blindly add both estimates to a calendar.

Sources were reviewed at landing-page/README/abstract level. Repositories were not all installed, licenses were not legally audited, videos were not watched end to end, and papers were not experimentally reproduced by this research pass. Prime Agent and DeepSeek Harness are now resolved in [the source study](20-prime-and-deepseek-harness-study.md), and MAG's intended meaning is confirmed. See [the expanded hierarchy](22-ecosystem-drill-down.md) for the deeper teaching decomposition.
