# Twenty saved project ideas, reviewed

Reviewed 2026-10-07 at official README/landing-page level. Links identify tools, examples or research implementations, not twenty complete project specifications. None guarantees hiring. Build original evidence around a real problem; avoid submitting a copied tutorial as your FYP.

All module prerequisites below apply transitively. M18 safety/permissions is required before public or action-taking deployment. Tool licenses, model/data terms, paid APIs and hardware feasibility must be checked for the exact versions you select.

| # / idea and verified source | Learn first | Your original deliverable and evaluation |
|---|---|---|
| 1 Multi-agent ops: [LangGraph 101](https://github.com/langchain-ai/langgraph-101) | M12, X03 | A bounded incident-triage crew using simulated tickets; compare single agent and scripted workflow, correctness and cost. Source is learning notebooks, not a finished ops product. |
| 2 Coding agent: [Open SWE](https://github.com/langchain-ai/open-swe) | M03/M12/M18, X04 | Resolve small repo issues in isolated worktrees; test success, unauthorized changes, recovery and cost. Study source; do not clone a whole hosted platform first. |
| 3 Browser agent: [browser-use](https://github.com/browser-use/browser-use) | M03/M12/M18 | Read-only extraction from a local test site; then gated actions. Score DOM/task outcomes, duplicate clicks and injection resistance. |
| 4 MCP server: [reference servers](https://github.com/modelcontextprotocol/servers) | M03/M12/M18, X02 | Your own permission-aware corpus server; test schema, access denial, cancellation and reconnect. Reference implementations do not establish production suitability. |
| 5 Hybrid RAG: [Qdrant](https://github.com/qdrant/qdrant) | M04/M11 | A licensed niche corpus with BM25/dense/hybrid/rerank ablations; retrieval recall and supported answers. Database alone is not a RAG system. |
| 6 GraphRAG: [Microsoft GraphRAG](https://github.com/microsoft/graphrag) | M11/M14 | Compare local fact questions and global synthesis with ordinary RAG; measure indexing cost and graph errors. |
| 7 Document ingestion: [Docling](https://github.com/docling-project/docling) | M04/M11 | Recover tables/headings/citations from messy PDFs; annotate extraction accuracy and inspect downstream retrieval failures. |
| 8 Eval harness: [Ragas](https://github.com/vibrantlabsai/ragas) | M06/M10/M11/M12 | Domain gold set, calibrated judges and regression gate; check false passes, judge/human agreement and contamination. |
| 9 Observability: [Langfuse](https://github.com/langfuse/langfuse) | M10/M16 | Traces → failure categories → alerts for one real app; test redaction, missing spans and usefulness during an incident. |
| 10 Guardrails/red team: [NeMo Guardrails](https://github.com/NVIDIA-NeMo/Guardrails) | M10/M12/M18 | Threat model and adversarial corpus; report attack success AND benign false refusals. Guardrails do not replace authorization. |
| 11 LoRA/QLoRA: [Unsloth](https://github.com/unslothai/unsloth) | M08/M09/M13 | Compare base, prompting and adapter on held-out domain tasks; log VRAM, quality, forgetting and leakage. Check GPU/data/model licenses. |
| 12 Quantize/self-host: [vLLM](https://github.com/vllm-project/vllm) | M09/M17 | Benchmark supported quantization/runtime configurations; compare quality, VRAM, throughput and p95 under load. Not every model/quantization is supported. |
| 13 Provider gateway: [LiteLLM](https://github.com/BerriAI/litellm) | M03/M10/M17 | Typed routing/fallback with budgets and tenant limits; inject outages and check accounting, retries and output compatibility. |
| 14 Drift/quality: [Evidently](https://github.com/evidentlyai/evidently) | M06/M07/M16 | Delayed-label monitoring with slice metrics; deliberately introduce drift and measure alert precision/recall. Drift alone is not proof of poor accuracy. |
| 15 Feature store: [Feast](https://github.com/feast-dev/feast) | M04/M07/M16 | Batch + online features with point-in-time joins; demonstrate freshness, train/serve consistency and leakage prevention. Your `/feats` URL is a typo; use `/feast`. |
| 16 Text-to-SQL: [LangChain example](https://github.com/langchain-ai/text-to-sql-agent) | M04/M11/M12/M18 | Read-only domain database; score execution correctness and prohibited queries, schema changes and row exposure. |
| 17 PR review: [PR-Agent](https://github.com/The-PR-Agent/pr-agent) | M03/M10/M12/M18 | Read-only review suggestions on a labeled bug set; measure actionable findings and false positives. Original Qodo URL redirects here; preserve that provenance. |
| 18 Voice agent: [Pipecat](https://github.com/pipecat-ai/pipecat) | M03/M12/M15/M17 | One voice workflow with interruption/recovery; measure turn latency, task success and noisy audio. STT/TTS/API costs and audio consent matter. |
| 19 Visual inspection: [Ultralytics](https://github.com/ultralytics/ultralytics) | M08/M15/M17 | Licensed local defect dataset; use site/time-separated tests, precision/recall and device latency. Inspect AGPL/commercial terms before distribution. |
| 20 On-chain agent: [elizaOS](https://github.com/elizaOS/eliza) | M03/M12/M18 plus blockchain foundations | A testnet-only simulated policy workflow; invariant tests, key isolation and transaction gates. Highest additional-domain burden; real-money autonomy is not a beginner exercise. |

## Recommended progression for you

Start with ingestion + a small hybrid RAG assistant (7 + 5), then add an evaluation harness (8) and traces (9). This produces one increasingly reliable product with four connected artifacts. Add a bounded MCP/tool interface (4) once you understand retrieval and permissions. Finally choose coding harness (2), research swarm (1), or model/serving depth (11/12) as your specialization.

A credible FYP needs a problem/user study, baseline, licensed data, held-out evaluation, reproducible environment, original contribution, ablation, failure analysis, cost report and short usable demo. Investigate whether the selected university rubric values research, software delivery or both. Compare alternatives before choosing a title.

Do not confuse a tool with the task it supports: Qdrant stores/searches vectors, Docling parses documents, Ragas supports evaluation, Langfuse traces systems and Feast serves features. Combining them becomes an engineering project only after you define a user need and acceptance criteria.
