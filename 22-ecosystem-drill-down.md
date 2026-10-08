# Ecosystem drill-down: beginner to advanced

This is a deeper teaching map of the existing M00–M20 route, not a replacement. Each domain contains topics and granular practice outcomes. Read prerequisite modules first. Resource IDs resolve through [the teaching additions](23-independent-teaching-resources.md), [existing videos](19-videos-and-agent-papers-in-order.md) and data/video-companions.json. Core 740 IDs and app progress remain stable. These 250 outcomes overlap core topics; they are not 250 newly discovered unique concepts or additional planning hours.

## D01 — Foundations to executable programs

Prerequisites: M00, M01, M02, M03. Resources: V10, V11.

### D01.1 Computer and environment

- [ ] D01.1.1 Files versus directories
- [ ] D01.1.2 absolute versus relative paths
- [ ] D01.1.3 terminal command and exit status
- [ ] D01.1.4 process versus program
- [ ] D01.1.5 PATH and environment variables

### D01.2 Python control and data

- [ ] D01.2.1 Boolean expressions and conditionals
- [ ] D01.2.2 for/range/enumerate/zip
- [ ] D01.2.3 while and termination
- [ ] D01.2.4 comprehensions and generators
- [ ] D01.2.5 mutability and aliasing

### D01.3 Reusable programs

- [ ] D01.3.1 Function arguments and return values
- [ ] D01.3.2 scope and closures
- [ ] D01.3.3 classes and composition
- [ ] D01.3.4 exceptions and context managers
- [ ] D01.3.5 modules and imports

### D01.4 Reproducible development

- [ ] D01.4.1 Interpreter versus package manager
- [ ] D01.4.2 pip versus uv responsibilities
- [ ] D01.4.3 venv versus global environment
- [ ] D01.4.4 pyproject and lockfiles
- [ ] D01.4.5 pycache versus source files

### D01.5 Software foundations

- [ ] D01.5.1 Git branches and diffs
- [ ] D01.5.2 unit versus integration tests
- [ ] D01.5.3 HTTP JSON and API errors
- [ ] D01.5.4 SQL joins and transactions
- [ ] D01.5.5 async concurrency versus parallelism

**Gate:** Explain and debug a Python CLI without generated code.

## D02 — Mathematics and classical ML

Prerequisites: M04, M05, M06, M07. Resources: V18, V19, V01.

### D02.1 Math language

- [ ] D02.1.1 Vectors and matrix shapes
- [ ] D02.1.2 dot products and projections
- [ ] D02.1.3 derivatives and chain rule
- [ ] D02.1.4 gradients and optimization
- [ ] D02.1.5 numerical stability

### D02.2 Probability and statistics

- [ ] D02.2.1 Conditional probability and Bayes
- [ ] D02.2.2 distributions and expectation
- [ ] D02.2.3 variance covariance and sampling
- [ ] D02.2.4 confidence intervals and bootstrap
- [ ] D02.2.5 hypothesis tests and multiple comparisons

### D02.3 Data preparation

- [ ] D02.3.1 Missing values and imputation
- [ ] D02.3.2 categorical encoding
- [ ] D02.3.3 scaling within training folds
- [ ] D02.3.4 imbalance and stratification
- [ ] D02.3.5 label leakage and temporal splits

### D02.4 Model families

- [ ] D02.4.1 Linear and logistic regression
- [ ] D02.4.2 trees and boosted ensembles
- [ ] D02.4.3 neighbors and kernels
- [ ] D02.4.4 clustering and dimensionality reduction
- [ ] D02.4.5 regularization and bias variance

### D02.5 Evaluation and tuning

- [ ] D02.5.1 Baseline versus target metric
- [ ] D02.5.2 precision recall and calibration
- [ ] D02.5.3 cross-validation versus holdout
- [ ] D02.5.4 hyperparameter search and pruning
- [ ] D02.5.5 error analysis and subgroup performance

**Gate:** A leakage-free tabular baseline with uncertainty and reproducible splits.

## D03 — Deep learning and model architecture

Prerequisites: M08, M09, M13, M14. Resources: V08, V12, V20, V27.

### D03.1 Tensor and autodiff

- [ ] D03.1.1 Broadcasting and indexing
- [ ] D03.1.2 computational graphs
- [ ] D03.1.3 backward and gradient accumulation
- [ ] D03.1.4 optimizer state
- [ ] D03.1.5 mixed precision and loss scaling

### D03.2 Transformer anatomy

- [ ] D03.2.1 Tokenization and vocabulary
- [ ] D03.2.2 embeddings and positions
- [ ] D03.2.3 causal masking and attention
- [ ] D03.2.4 normalization and residual paths
- [ ] D03.2.5 output head and cross entropy

### D03.3 Architecture branches

- [ ] D03.3.1 Dense versus mixture of experts
- [ ] D03.3.2 routing and expert capacity
- [ ] D03.3.3 grouped query attention
- [ ] D03.3.4 long context position methods
- [ ] D03.3.5 multimodal encoders and fusion

### D03.4 Training lifecycle

- [ ] D03.4.1 Data cleaning and deduplication
- [ ] D03.4.2 pretraining versus supervised tuning
- [ ] D03.4.3 LoRA and QLoRA
- [ ] D03.4.4 preference optimization versus RL
- [ ] D03.4.5 checkpoints and reproducibility

### D03.5 Systems internals

- [ ] D03.5.1 Array layout and device transfers
- [ ] D03.5.2 autodiff engine
- [ ] D03.5.3 matrix multiplication tiling
- [ ] D03.5.4 memory bandwidth versus compute
- [ ] D03.5.5 profiling and kernel correctness

**Gate:** Train a small transformer and explain each tensor shape and bottleneck.

## D04 — Retrieval and vector systems

Prerequisites: M04, M09, M10, M11. Resources: V22, V26, DR02, DR03.

### D04.1 Ingestion and chunks

- [ ] D04.1.1 OCR and layout extraction
- [ ] D04.1.2 stable document IDs and provenance
- [ ] D04.1.3 sentence heading and recursive splits
- [ ] D04.1.4 parent child relationships
- [ ] D04.1.5 incremental update and deletion

### D04.2 Embeddings and similarity

- [ ] D04.2.1 Sparse versus dense representation
- [ ] D04.2.2 cosine dot and Euclidean distance
- [ ] D04.2.3 domain and multilingual mismatch
- [ ] D04.2.4 batch sizing and rate limits
- [ ] D04.2.5 embedding migration

### D04.3 Index mechanics

- [ ] D04.3.1 Exact nearest neighbors
- [ ] D04.3.2 HNSW construction and search effort
- [ ] D04.3.3 IVF clusters and probes
- [ ] D04.3.4 quantization error
- [ ] D04.3.5 filter selectivity and ANN recall

### D04.4 Pipeline composition

- [ ] D04.4.1 BM25 and dense baselines
- [ ] D04.4.2 reciprocal rank fusion
- [ ] D04.4.3 reranking and MMR
- [ ] D04.4.4 query decomposition and routing
- [ ] D04.4.5 context packing and citations

### D04.5 Variants and evaluation

- [ ] D04.5.1 Graph versus hierarchical retrieval
- [ ] D04.5.2 corrective and adaptive retrieval
- [ ] D04.5.3 multimodal and agentic retrieval
- [ ] D04.5.4 recall MRR nDCG and grounded answers
- [ ] D04.5.5 unanswerable and adversarial queries

**Gate:** Evaluate exact, lexical, dense and hybrid retrieval on a fixed corpus.

## D05 — Memory and context engineering

Prerequisites: M10, M11, M12, M18. Resources: V23.

### D05.1 Memory categories

- [ ] D05.1.1 Working versus persistent state
- [ ] D05.1.2 episodic event history
- [ ] D05.1.3 semantic facts
- [ ] D05.1.4 procedural skills
- [ ] D05.1.5 explicit versus inferred memory

### D05.2 Write and retrieval policy

- [ ] D05.2.1 Consent and allowed fields
- [ ] D05.2.2 salience and extraction
- [ ] D05.2.3 timestamps and provenance
- [ ] D05.2.4 relevance recency and importance
- [ ] D05.2.5 tenant scoped retrieval

### D05.3 Maintenance

- [ ] D05.3.1 Consolidation and summaries
- [ ] D05.3.2 contradictory facts
- [ ] D05.3.3 TTL and forgetting
- [ ] D05.3.4 versioning and rollback
- [ ] D05.3.5 deletion propagated to indexes

### D05.4 Context strategies

- [ ] D05.4.1 Truncation versus compaction
- [ ] D05.4.2 prefix caching
- [ ] D05.4.3 external variables and selective reads
- [ ] D05.4.4 recursive context inspection
- [ ] D05.4.5 token budget and stale summaries

### D05.5 Controlled comparison

- [ ] D05.5.1 RAG evidence versus agent memory
- [ ] D05.5.2 cached context cold versus warm
- [ ] D05.5.3 memory enabled versus disabled
- [ ] D05.5.4 poisoning and false remembered facts
- [ ] D05.5.5 correctness privacy latency and cost

**Gate:** A memory system with provenance, contradiction handling and verified deletion.

## D06 — Agent runtimes and harnesses

Prerequisites: M03, M10, M12, M18. Resources: V23, V24, DR01.

### D06.1 Single agent loop

- [ ] D06.1.1 Task and success contract
- [ ] D06.1.2 model call and observations
- [ ] D06.1.3 structured tool arguments
- [ ] D06.1.4 bounded retries and stop rules
- [ ] D06.1.5 cancellation and human handoff

### D06.2 Runtime architecture

- [ ] D06.2.1 Model adapter and streaming
- [ ] D06.2.2 tool registry and validation
- [ ] D06.2.3 append only events and replay
- [ ] D06.2.4 dependency injection and plugins
- [ ] D06.2.5 load unload and cleanup

### D06.3 Persistent execution

- [ ] D06.3.1 REPL state and namespaces
- [ ] D06.3.2 subprocess and IPC
- [ ] D06.3.3 async jobs and polling
- [ ] D06.3.4 crash recovery and idempotency
- [ ] D06.3.5 isolation and resource limits

### D06.4 Multi agent coordination

- [ ] D06.4.1 Supervisor and worker contracts
- [ ] D06.4.2 shared versus private state
- [ ] D06.4.3 message passing and joins
- [ ] D06.4.4 race conditions and deadlocks
- [ ] D06.4.5 depth cost and timeout budgets

### D06.5 Adaptation and skills

- [ ] D06.5.1 Trajectory feedback
- [ ] D06.5.2 executable skill packaging
- [ ] D06.5.3 prompt memory and skill updates
- [ ] D06.5.4 held out acceptance tests
- [ ] D06.5.5 rollback versus model weight training

**Gate:** Trace one tool task, then reproduce its failure and recovery path.

## D07 — Protocols and purposeful products

Prerequisites: M03, M11, M12, M18, M20. Resources: DR01, V24.

### D07.1 MCP boundary

- [ ] D07.1.1 Client server and transport
- [ ] D07.1.2 tools resources and prompts
- [ ] D07.1.3 input schemas and errors
- [ ] D07.1.4 authentication and scopes
- [ ] D07.1.5 untrusted server content

### D07.2 Other extension layers

- [ ] D07.2.1 Plugin lifecycle and dependencies
- [ ] D07.2.2 skill instructions and code
- [ ] D07.2.3 agent to agent contracts
- [ ] D07.2.4 protocol version compatibility
- [ ] D07.2.5 capability discovery

### D07.3 Domain workflows

- [ ] D07.3.1 Coding repository inspection and patching
- [ ] D07.3.2 browser navigation and DOM actions
- [ ] D07.3.3 research sources and citations
- [ ] D07.3.4 SQL execution and schema constraints
- [ ] D07.3.5 voice turn taking and interruptions

### D07.4 Product reliability

- [ ] D07.4.1 User task and acceptance rubric
- [ ] D07.4.2 approvals at consequential boundaries
- [ ] D07.4.3 resumable runs and audit trails
- [ ] D07.4.4 human correction and feedback
- [ ] D07.4.5 accessibility and understandable status

### D07.5 Threat model

- [ ] D07.5.1 Prompt injection across documents and tools
- [ ] D07.5.2 secret isolation
- [ ] D07.5.3 least privilege and sandboxing
- [ ] D07.5.4 network and filesystem allowlists
- [ ] D07.5.5 destructive action and data exfiltration tests

**Gate:** Deliver one permission-bounded agent that solves a measurable user task.

## D08 — Benchmarking and economics

Prerequisites: M06, M10, M12, M16, M17. Resources: V25, V22.

### D08.1 Measurement design

- [ ] D08.1.1 Task family and representative sample
- [ ] D08.1.2 frozen split and contamination checks
- [ ] D08.1.3 baseline and ablation
- [ ] D08.1.4 repeated trials and confidence intervals
- [ ] D08.1.5 reproducible model and harness versions

### D08.2 Benchmark categories

- [ ] D08.2.1 Language model task evaluation
- [ ] D08.2.2 repository patch tests
- [ ] D08.2.3 interactive tool and browser tasks
- [ ] D08.2.4 retrieval and answer evaluation
- [ ] D08.2.5 domain specific end to end success

### D08.3 Scoring pitfalls

- [ ] D08.3.1 Pass at one versus pass at k
- [ ] D08.3.2 invalid tests and flaky infrastructure
- [ ] D08.3.3 judge bias and rubric calibration
- [ ] D08.3.4 timeout and refusal accounting
- [ ] D08.3.5 benchmark score versus customer outcomes

### D08.4 Cost ledger

- [ ] D08.4.1 Input output and cached token categories
- [ ] D08.4.2 every retry worker and tool call
- [ ] D08.4.3 provider price snapshot
- [ ] D08.4.4 compute storage and idle GPU time
- [ ] D08.4.5 total cost divided by successful tasks

### D08.5 Optimization

- [ ] D08.5.1 Smaller model routing
- [ ] D08.5.2 context pruning and caching
- [ ] D08.5.3 batching and concurrency
- [ ] D08.5.4 bounded retries and early stop
- [ ] D08.5.5 quality latency and spend Pareto comparison

**Gate:** A two-model/two-harness experiment with uncertainty and cost per success.

## D09 — MLOps LLMOps and serving

Prerequisites: M03, M07, M08, M16, M17, M18. Resources: V21, V22, V27.

### D09.1 Data and experiments

- [ ] D09.1.1 Dataset and artifact versioning
- [ ] D09.1.2 experiment tracking and model registry
- [ ] D09.1.3 reproducible training pipeline
- [ ] D09.1.4 feature store point in time joins
- [ ] D09.1.5 lineage and data quality checks

### D09.2 Deployment

- [ ] D09.2.1 FastAPI request contracts
- [ ] D09.2.2 container images and configuration
- [ ] D09.2.3 CI CD and infrastructure as code
- [ ] D09.2.4 canary shadow and rollback
- [ ] D09.2.5 secrets networking and access control

### D09.3 Inference systems

- [ ] D09.3.1 KV cache and memory planning
- [ ] D09.3.2 batching and scheduling
- [ ] D09.3.3 quantization and accuracy loss
- [ ] D09.3.4 tensor versus pipeline parallelism
- [ ] D09.3.5 throughput TTFT and tail latency

### D09.4 Operations

- [ ] D09.4.1 Structured logs metrics and traces
- [ ] D09.4.2 SLO and error budget
- [ ] D09.4.3 drift and quality monitoring
- [ ] D09.4.4 alerting and incident runbooks
- [ ] D09.4.5 backup restore and capacity planning

### D09.5 LLM specific operations

- [ ] D09.5.1 Prompt and tool versioning
- [ ] D09.5.2 retrieval corpus freshness
- [ ] D09.5.3 offline versus online evaluations
- [ ] D09.5.4 human feedback and privacy
- [ ] D09.5.5 gateway routing and provider failures

**Gate:** Deploy, observe, roll back and restore a versioned model service.

## D10 — Research and specialization

Prerequisites: M07, M08, M09, M14, M15, M19, M20. Resources: V20, V24, V27.

### D10.1 Paper reading

- [ ] D10.1.1 Question and hypotheses
- [ ] D10.1.2 assumptions and methodology
- [ ] D10.1.3 dataset and compute budget
- [ ] D10.1.4 baseline and statistical uncertainty
- [ ] D10.1.5 limitations and negative results

### D10.2 Reproduction

- [ ] D10.2.1 Environment and pinned commit
- [ ] D10.2.2 data access and license
- [ ] D10.2.3 small scale sanity run
- [ ] D10.2.4 metric and seed agreement
- [ ] D10.2.5 discrepancy analysis

### D10.3 Optional branches

- [ ] D10.3.1 Vision detection segmentation and tracking
- [ ] D10.3.2 audio speech and real time interaction
- [ ] D10.3.3 recommender ranking and feedback
- [ ] D10.3.4 time series temporal backtesting
- [ ] D10.3.5 reinforcement learning state action reward

### D10.4 Open model study

- [ ] D10.4.1 Architecture versus released weights
- [ ] D10.4.2 tokenizer and configuration
- [ ] D10.4.3 training versus inference code
- [ ] D10.4.4 license and distribution terms
- [ ] D10.4.5 accessible scale versus original compute

### D10.5 Portfolio and FYP

- [ ] D10.5.1 User problem and prior art
- [ ] D10.5.2 evaluation set before implementation
- [ ] D10.5.3 independent contribution beyond cloning
- [ ] D10.5.4 reproducible demo and failure cases
- [ ] D10.5.5 report artifacts and ongoing maintenance

**Gate:** One reproduced baseline, one ablation and a documented useful extension.

The map is deliberately broader than agent frameworks. Deep specialization is a choice after the shared foundations: research/model systems, production ML, retrieval/agent products, or a domain branch. The core books, courses and papers remain in documents 03–05. New repository study references are in document 20; retrieval and memory distinctions in document 21. Recheck sources before executing old course code.
