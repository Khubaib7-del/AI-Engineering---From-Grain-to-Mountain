# Benchmarks, LLM costs and harness experiments

A model benchmark measures a defined capability under a specified protocol. An agent benchmark measures a system: model + prompt/context + tools + environment + orchestration + budget. A leaderboard is not a universal ranking. The “seventh best model” might be ranked on a task unrelated to your agent.

## Choose a matching benchmark

| Task family | Starting source | What to measure |
|---|---|---|
| Repository issue resolution | [SWE-bench](https://www.swebench.com/) | Resolved tasks under the specified repository/test environment; distinguish subsets and protocols |
| Tool/user interaction | [tau2-bench](https://github.com/sierra-research/tau2-bench) | Task outcome, policy adherence and repeatability in simulated interactions |
| Browser tasks | [BrowserGym](https://github.com/ServiceNow/BrowserGym) | Environment-specific success, action count, latency and prohibited side effects; this is an environment suite, not one universal score |
| Model knowledge/reasoning | [lm-evaluation-harness](https://github.com/EleutherAI/lm-evaluation-harness) | Task/config-specific accuracy; not an end-to-end agent evaluation |
| Code generation | [BigCode evaluation harness](https://github.com/bigcode-project/bigcode-evaluation-harness) | Tests and pass@k on supported tasks; executing generated code needs isolation |
| Your RAG product | [Ragas](https://github.com/vibrantlabsai/ragas) plus your gold set | Retrieval and answer/citation quality separately; calibrate model judges with human labels |

First create 20–50 small local tasks for development and fault injection. This is a smoke suite, not enough to claim general superiority. Keep an unseen set separate. Reproduce one official protocol next; document anything you cannot reproduce. No benchmark was run during this research pass.

## A fair harness experiment

1. Pin dataset snapshot, split, repository/environment, model/version and harness commit.
2. Define success through deterministic checks where possible; blind human grading where needed.
3. Baseline a scripted workflow and a minimal tool loop.
4. Change one factor: context retrieval, checkpoints, verifier, tool description or delegation.
5. Hold total token/tool/time budget equal. Count failed attempts and retries; repeat stochastic runs.
6. Compare paired outcomes with uncertainty, failure categories, p95 latency and spend.
7. Publish traces after redaction, config, commands and limitations. Disclose contamination risk and manual intervention.

An initial 2×2 matrix is enough: two models × two harnesses. Use fixed task instances in each cell. Improvements on one family justify a narrow claim, not “any weaker model becomes extraordinary.” Verification can catch an error only if the tests/rubric cover it; extra retries can increase apparent quality while hiding cost.

## Cost accounting

For one request, use the provider's current billing definitions:

`API cost = uncached input tokens × input rate + cached input tokens × cached rate + output tokens × output rate + separately billed tools/media`

Normalize rates to the same unit, such as per million tokens. Do not double-count reasoning tokens if they are included in billed output. Sum every call, retry and worker in an agent run, then add retrieval/storage/compute allocations. `Cost per success = total spend across all attempts / successful tasks`; undefined if no tasks succeed. For self-hosting, add GPU/CPU idle time, utilization, storage, network and operations. Cheap per-token inference can still have poor task economics.

Illustrative arithmetic, not live pricing: 10,000 input tokens at $1/million plus 2,000 output at $4/million = $0.018. Three such calls cost $0.054 before tools/hosting. If ten tasks cost $0.54 and six succeed, cost per success is $0.09.

Optimize with evidence: shorter context, calibrated smaller-model routing, prefix caching, batching, bounded retries and early stop. Measure quality changes, cache hit rate, cold versus warm costs, time to first token and full-task latency. Build a ledger with run ID, model/version, provider, tool steps, token counts, cache counts, price snapshot/date, success, latency and error category. [LiteLLM](https://github.com/BerriAI/litellm) and [Langfuse](https://github.com/langfuse/langfuse) are implementation references, not substitutes for checking invoices and evaluation outcomes.

## Source-study examples

- [Codex CLI](https://github.com/openai/codex): read the public client/runtime source, tool execution, permission boundaries, session state and tests. The public agent repository does not reveal proprietary model weights or the whole hosted product.
- [Open SWE](https://github.com/langchain-ai/open-swe): study coding-agent orchestration and isolation; pin a commit because the architecture evolves.
- [LangGraph 101](https://github.com/langchain-ai/langgraph-101): learning notebooks for bounded agents, supervisors and research workflows, not a ready-made business operations crew.
- [Prime Agent](https://github.com/PrimeIntellect-ai/prime-agent): the resolved self-improving RLM harness. Study persistent execution and durable harness refinement; see [the detailed source-study tree](20-prime-and-deepseek-harness-study.md).
- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): the resolved plugin-based runtime. Study services, session events and the agent lifecycle in its architecture document. Model internals and runtime orchestration remain separate study layers.

For each source, record: exact URL/commit, license, entry point, event loop, model adapter, context builder, tools, persistence, error paths, permissions, evaluation hook and two design tradeoffs. Trace one successful task and one failure. Implement the smallest useful lesson from it instead of cloning its whole UI. Detailed product/UI comparisons remain a later phase.
