# Research papers: prerequisite-based reading order

Prepared 2026-10-07. Years below are first-publication/submission years, not necessarily the latest revision or conference year. Official arXiv landing pages and abstracts were checked for these 24 papers; this work did not independently reproduce their experiments or conduct a full systematic literature review. Each landing page links an openly readable paper.

Start papers after the corresponding module. Core papers come first; depth/branch papers are selected according to your role. Historical papers explain foundations, not necessarily current best practice or the strongest available model.

## How to read a paper

1. First pass: problem, contribution, assumptions, headline experiment, limitations.
2. Second pass: draw the method and identify its inputs/outputs, objective and baselines.
3. Third pass, only for a selected paper: work through equations and implementation.
4. Keep a paper card: citation/version, question, method, data, metrics, comparisons, limitations, compute requirement and reproduction plan.
5. Reproduce a small result, change one variable, and write what failed. Read follow-up work before generalizing the original claim.

## P01 — Adam: A Method for Stochastic Optimization (2014)

[Public paper and versions](https://arxiv.org/abs/1412.6980) · Read after M08 · Priority: core.

**Learn:** Adaptive optimizer and moving averages.

**Evidence exercise:** Compare SGD and Adam on the same small MLP; log learning rates and validation curves.

## P02 — Deep Residual Learning for Image Recognition (2015)

[Public paper and versions](https://arxiv.org/abs/1512.03385) · Read after M08 · Priority: branch.

**Learn:** Residual connections and trainability.

**Evidence exercise:** Compare a shallow plain network and residual variant without claiming ImageNet-scale reproduction.

## P03 — Attention Is All You Need (2017)

[Public paper and versions](https://arxiv.org/abs/1706.03762) · Read after M09 · Priority: core.

**Learn:** Attention and Transformer blocks.

**Evidence exercise:** Implement scaled dot-product attention, masks and a shape test.

## P04 — BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding (2018)

[Public paper and versions](https://arxiv.org/abs/1810.04805) · Read after M09 · Priority: depth.

**Learn:** Encoder pretraining and task adaptation.

**Evidence exercise:** Contrast masked-language and causal-language objectives; fine-tune a small classifier.

## P05 — Language Models are Few-Shot Learners (2020)

[Public paper and versions](https://arxiv.org/abs/2005.14165) · Read after M09 · Priority: depth.

**Learn:** Scaling and in-context examples.

**Evidence exercise:** Compare zero/few-shot prompting on a fixed dataset; note that modern instruct models differ from the paper.

## P06 — Dense Passage Retrieval for Open-Domain Question Answering (2020)

[Public paper and versions](https://arxiv.org/abs/2004.04906) · Read after M11 · Priority: core.

**Learn:** Query/passage encoders and dense search.

**Evidence exercise:** Compare a dense retriever with BM25 on your labeled corpus.

## P07 — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)

[Public paper and versions](https://arxiv.org/abs/2005.11401) · Read after M11 · Priority: core.

**Learn:** Retrieval plus generation; original trained formulation.

**Evidence exercise:** Explain how the paper’s trained RAG differs from an API-based retrieve-then-prompt pipeline.

## P08 — ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT (2020)

[Public paper and versions](https://arxiv.org/abs/2004.12832) · Read after M11 · Priority: depth.

**Learn:** Late interaction and retrieval/storage trade-offs.

**Evidence exercise:** Contrast single-vector and multi-vector retrieval; report index size and search quality.

## P09 — Precise Zero-Shot Dense Retrieval without Relevance Labels (2022)

[Public paper and versions](https://arxiv.org/abs/2212.10496) · Read after M11 · Priority: depth.

**Learn:** HyDE generated-document query representation.

**Evidence exercise:** Compare direct query embeddings with HyDE; account for extra generation cost.

## P10 — Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection (2023)

[Public paper and versions](https://arxiv.org/abs/2310.11511) · Read after M11 · Priority: depth.

**Learn:** Learned reflection tokens and selective retrieval.

**Evidence exercise:** Diagram the training/inference design; distinguish a prompted self-check from the original method.

## P11 — Corrective Retrieval Augmented Generation (2024)

[Public paper and versions](https://arxiv.org/abs/2401.15884) · Read after M11 · Priority: depth.

**Learn:** Retrieval quality assessment and corrective actions.

**Evidence exercise:** Inject poor retrieval and compare a bounded fallback with a fixed baseline.

## P12 — From Local to Global: A Graph RAG Approach to Query-Focused Summarization (2024)

[Public paper and versions](https://arxiv.org/abs/2404.16130) · Read after M11 · Priority: depth.

**Learn:** Graph communities and global corpus questions.

**Evidence exercise:** Compare global-summary and fact-lookup questions separately; measure graph-build cost.

## P13 — ReAct: Synergizing Reasoning and Acting in Language Models (2022)

[Public paper and versions](https://arxiv.org/abs/2210.03629) · Read after M12 · Priority: core.

**Learn:** Reasoning/action/observation structure.

**Evidence exercise:** Build an inspectable bounded tool loop with trace logs and failure cases.

## P14 — Toolformer: Language Models Can Teach Themselves to Use Tools (2023)

[Public paper and versions](https://arxiv.org/abs/2302.04761) · Read after M12 · Priority: depth.

**Learn:** Learning when/how to call tools.

**Evidence exercise:** Contrast tool-use training with passing tool schemas at inference time.

## P15 — LoRA: Low-Rank Adaptation of Large Language Models (2021)

[Public paper and versions](https://arxiv.org/abs/2106.09685) · Read after M13 · Priority: core.

**Learn:** Frozen weights and low-rank trainable updates.

**Evidence exercise:** Calculate trainable parameters and compare two ranks on a held-out task.

## P16 — QLoRA: Efficient Finetuning of Quantized LLMs (2023)

[Public paper and versions](https://arxiv.org/abs/2305.14314) · Read after M13 · Priority: core.

**Learn:** Quantized base weights and adapter training.

**Evidence exercise:** Measure peak memory and quality for a small feasible model; distinguish storage quantization from compute dtype.

## P17 — Training language models to follow instructions with human feedback (2022)

[Public paper and versions](https://arxiv.org/abs/2203.02155) · Read after M13 · Priority: core.

**Learn:** SFT, reward modeling and preference-based RL.

**Evidence exercise:** Map the stages and data requirements; evaluate helpfulness and failures without assuming reward equals truth.

## P18 — Direct Preference Optimization: Your Language Model is Secretly a Reward Model (2023)

[Public paper and versions](https://arxiv.org/abs/2305.18290) · Read after M13 · Priority: core.

**Learn:** Preference optimization objective.

**Evidence exercise:** Derive the loss at a manageable level; train on a tiny licensed preference dataset and compare SFT.

## P19 — Training Compute-Optimal Large Language Models (2022)

[Public paper and versions](https://arxiv.org/abs/2203.15556) · Read after M14 · Priority: depth.

**Learn:** Compute/data/parameter scaling trade-offs.

**Evidence exercise:** Fit a small-scale curve and report why extrapolation to frontier models is uncertain.

## P20 — FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness (2022)

[Public paper and versions](https://arxiv.org/abs/2205.14135) · Read after M17 · Priority: core for systems.

**Learn:** Memory traffic and tiled attention.

**Evidence exercise:** Profile attention; compare implementations with identical shapes, precision and warmup.

## P21 — Efficient Memory Management for Large Language Model Serving with PagedAttention (2023)

[Public paper and versions](https://arxiv.org/abs/2309.06180) · Read after M17 · Priority: core for systems.

**Learn:** KV-cache memory and serving throughput.

**Evidence exercise:** Benchmark concurrency, TTFT and tokens/sec with a fixed prompt-length distribution.

## P22 — Denoising Diffusion Probabilistic Models (2020)

[Public paper and versions](https://arxiv.org/abs/2006.11239) · Read after M15 · Priority: branch.

**Learn:** Denoising objective and generation.

**Evidence exercise:** Train a toy diffusion process, then compare to a library implementation.

## P23 — Datasheets for Datasets (2018)

[Public paper and versions](https://arxiv.org/abs/1803.09010) · Read after M18 · Priority: core.

**Learn:** Dataset documentation and provenance.

**Evidence exercise:** Write a datasheet for your project’s corpus before publication.

## P24 — Model Cards for Model Reporting (2018)

[Public paper and versions](https://arxiv.org/abs/1810.03993) · Read after M18 · Priority: core.

**Learn:** Intended uses, evaluation and limits.

**Evidence exercise:** Write a model card including subgroup results and unsuitable uses.

## Added from your saved posts: P25–P28

After M12: [P25 Reflexion](https://arxiv.org/abs/2303.11366), [P26 Generative Agents](https://arxiv.org/abs/2304.03442) and [P27 AutoGen](https://arxiv.org/abs/2308.08155). After M11: optional [P28 Cache-Augmented Generation](https://arxiv.org/abs/2412.15605). ReAct and Toolformer were already P13/P14. See [prerequisites and reproduction exercises](19-videos-and-agent-papers-in-order.md) for the new reading sequence; the catalog now contains 28 papers. Titles and abstracts were verified, not full experiments reproduced.

## First six papers to prioritize

After DL: Adam. After attention: Attention Is All You Need. After retrieval basics: DPR and original RAG. After tool loops: ReAct. After adaptation: LoRA. Add FlashAttention/PagedAttention earlier only if inference systems becomes your main specialty. Read model/data cards while preparing the first public portfolio project.

For 2026 frontier developments, choose new papers through the active course reading lists and the official repositories for your specialty, and verify their dates and results. This curated foundational sequence does not claim to enumerate every recent method.
