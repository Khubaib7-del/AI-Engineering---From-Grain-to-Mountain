# Prime Agent and DeepSeek Harness: source study

Reviewed 2026-10-07. These identities are now resolved. The earlier unresolved labels were a research gap, not evidence that the projects did not exist. Moving default branches were reviewed; no commit was pinned or software executed. Repository claims are not independently reproduced benchmark results.

## Verified starting points

[Prime Agent](https://github.com/PrimeIntellect-ai/prime-agent) uses a persistent Python REPL, recursive subagents, and durable supplemental harness state. Its refinement flow can update that state while preserving the immutable base prompt, with snapshots for rollback. Study its tools, executable skills, daemon sessions and refinement workflow. This form of improvement should not be described as automatic model-weight training. [Prime Agent paper](https://arxiv.org/abs/2608.23552) and [Continual Harness paper](https://arxiv.org/abs/2605.09998) provide the associated research reading branch.

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) is a real runtime repository, distinct from DeepSeek model repositories. It is a developer preview built around Cordis plugins. Its [architecture document](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) describes replaceable services, reversible registrations, append-only session events, model adapters, agent lifecycle events, and web/headless/SDK/ACP profiles. Trace input → context/tool assembly → model request → streamed response → tool execution → turn completion. Preview interfaces may change.

## Your learning tree

These are proposed study exercises, not claims that either repository implements every item below. Complete M01–M03, M10–M12 and M18 before attempting the full runtime; M09/M13/M14 are required for the model-training comparison.

| Branch | Subtopics → granular work | Evidence required |
|---|---|---|
| Persistent execution | REPL → variable lifetime, namespaces, serialization, worker crash, cancellation; process boundary → subprocesses, IPC, working directory, environment, exit codes | Write a tiny worker that survives two calls and recovers after a crash. |
| Context management | Context window → tokenizer accounting, truncation, summaries; external variables → handles, selective reads, recursive delegation; provenance → original observations versus generated summaries | Compare ordinary context stuffing and selective external reads on fixed tasks. |
| Recursive agents | Spawn → task contract, inputs, outputs; coordination → futures, join, timeout, cancellation; budget → depth limit, shared token ledger, duplicate work | One parent/two children; inject a timeout and demonstrate bounded termination. |
| Durable harness adaptation | Trajectory → structured feedback, failure taxonomy; candidate update → prompt/skill/memory changes; acceptance → held-out tests, rollback, version lineage | An update that helps training tasks must pass an untouched evaluation set before promotion. |
| Plugin runtime | Interface → service registration, dependency ordering, lifecycle; events → schema, subscribers, sequencing; disposal → unload, cleanup, leaked callbacks | Load/unload a toy plugin without duplicate listeners or orphan processes. |
| Session persistence | Append-only log → event IDs, replay, checkpoints; concurrent writers → locking, transactions, idempotency; recovery → partial writes, schema migration | Restart midway through a tool call and explain what can safely be retried. |
| Tool and model boundary | Tool schema → parsing, validation, error objects; execution → permissions, isolation, secrets; adapters → message formats, streaming, usage, provider differences | Swap two model adapters while preserving the task, tools and budget. |
| Research comparison | RLM-style execution, retrieval, compaction and longer context → controlled baselines; adaptation → memory updates versus prompt optimization versus gradient training | Run ablations at equal cost; report failures as well as aggregate success. |

First read the README, then trace the architecture and one concrete request through source files. Record the checked commit, license, entry point, services, persistence and permission boundary in [the existing harness checklist](17-benchmarks-costs-and-harness-study.md). Do not begin by reproducing the entire application.

Follow [the Prime RLM explanation](https://www.primeintellect.ai/blog/rlm) after learning agent loops. Read method, experiments and limitations in the papers before accepting effectiveness claims. A harness changes how a model is used; it cannot guarantee extraordinary performance from every lower-ranked model.
