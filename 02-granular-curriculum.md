# Granular curriculum checklist

Prepared 2026-10-07. Every checkbox is a concept to explain and apply, rather than a video to collect. The hours are planning estimates including exercises; adjust after the first four weeks. See the course IDs in 03-courses-in-order.md. A passed checkpoint requires your own explanation, a working artifact and a small unseen change.

## M00 — Computer and learning foundations

Prerequisites: None. Primary resource: C01. Planning allowance: 35 hours.

### Computer basics

- [ ] M00.01.01 hardware/software
- [ ] M00.01.02 CPU versus GPU
- [ ] M00.01.03 RAM versus disk
- [ ] M00.01.04 operating system
- [ ] M00.01.05 files/extensions
- [ ] M00.01.06 absolute/relative paths
- [ ] M00.01.07 working directory
- [ ] M00.01.08 process
- [ ] M00.01.09 terminal versus editor
- [ ] M00.01.10 source code versus execution

### First problem solving

- [ ] M00.02.01 input/output
- [ ] M00.02.02 algorithms as instructions
- [ ] M00.02.03 pseudocode
- [ ] M00.02.04 tracing by hand
- [ ] M00.02.05 decomposition
- [ ] M00.02.06 Boolean logic
- [ ] M00.02.07 reading an error message
- [ ] M00.02.08 saving and backing up work

### Math bridge

- [ ] M00.03.01 fractions/percentages
- [ ] M00.03.02 negative numbers
- [ ] M00.03.03 algebraic rearrangement
- [ ] M00.03.04 exponents/logarithms
- [ ] M00.03.05 functions and graphs
- [ ] M00.03.06 summation notation
- [ ] M00.03.07 sets and basic logic

**Pass checkpoint:** Explain a file, a process, RAM and storage; create folders, run a script and recover from a typo.

## M01 — Python from zero

Prerequisites: M00. Primary resource: C01. Planning allowance: 110 hours.

### Values and expressions

- [ ] M01.01.01 integers/floats
- [ ] M01.01.02 strings
- [ ] M01.01.03 booleans/None
- [ ] M01.01.04 variables/binding
- [ ] M01.01.05 input/print
- [ ] M01.01.06 arithmetic/comparison
- [ ] M01.01.07 conversion
- [ ] M01.01.08 f-strings
- [ ] M01.01.09 indentation/comments

### Control flow

- [ ] M01.02.01 if/elif/else
- [ ] M01.02.02 truthiness
- [ ] M01.02.03 and/or/not
- [ ] M01.02.04 short-circuiting
- [ ] M01.02.05 for over iterables
- [ ] M01.02.06 range
- [ ] M01.02.07 while
- [ ] M01.02.08 break/continue
- [ ] M01.02.09 nested loops
- [ ] M01.02.10 loop termination
- [ ] M01.02.11 enumerate/zip
- [ ] M01.02.12 list/dict/set comprehensions

### Collections and memory

- [ ] M01.03.01 list/tuple/dict/set
- [ ] M01.03.02 indexing/slicing
- [ ] M01.03.03 membership
- [ ] M01.03.04 unpacking
- [ ] M01.03.05 methods
- [ ] M01.03.06 mutability/immutability
- [ ] M01.03.07 aliasing
- [ ] M01.03.08 shallow/deep copy
- [ ] M01.03.09 equality versus identity
- [ ] M01.03.10 hashability
- [ ] M01.03.11 mutable default argument trap

### Functions

- [ ] M01.04.01 def/return
- [ ] M01.04.02 parameters/arguments
- [ ] M01.04.03 positional/keyword/default
- [ ] M01.04.04 args/kwargs
- [ ] M01.04.05 scope
- [ ] M01.04.06 closures
- [ ] M01.04.07 pure functions/side effects
- [ ] M01.04.08 recursion/base case
- [ ] M01.04.09 docstrings
- [ ] M01.04.10 type hints

### Reliable scripts

- [ ] M01.05.01 pathlib
- [ ] M01.05.02 text/binary files
- [ ] M01.05.03 encoding/Unicode
- [ ] M01.05.04 JSON/CSV
- [ ] M01.05.05 with context manager
- [ ] M01.05.06 exceptions/try/except/finally
- [ ] M01.05.07 validation
- [ ] M01.05.08 assertions
- [ ] M01.05.09 modules/imports
- [ ] M01.05.10 main guard

### Python beyond syntax

- [ ] M01.06.01 class/object/self
- [ ] M01.06.02 init
- [ ] M01.06.03 composition versus inheritance
- [ ] M01.06.04 dataclasses
- [ ] M01.06.05 iterator versus iterable
- [ ] M01.06.06 generators/yield
- [ ] M01.06.07 decorators
- [ ] M01.06.08 properties
- [ ] M01.06.09 async/await basics
- [ ] M01.06.10 standard library collections/datetime/itertools

**Pass checkpoint:** Build a study tracker CLI from an empty file; explain and change it without generated code.

## M02 — Engineering tools and environments

Prerequisites: M01. Primary resource: C02. Planning allowance: 60 hours.

### Dependencies

- [ ] M02.01.01 interpreter/version
- [ ] M02.01.02 pip versus uv
- [ ] M02.01.03 venv versus conda
- [ ] M02.01.04 pyproject.toml
- [ ] M02.01.05 requirements files
- [ ] M02.01.06 transitive dependencies
- [ ] M02.01.07 lockfiles
- [ ] M02.01.08 editable installs
- [ ] M02.01.09 wheels
- [ ] M02.01.10 .venv
- [ ] M02.01.11 __pycache__ versus package cache
- [ ] M02.01.12 environment activation
- [ ] M02.01.13 PATH
- [ ] M02.01.14 secrets in environment variables

### Shell and Linux

- [ ] M02.02.01 PowerShell basics
- [ ] M02.02.02 bash and WSL concepts
- [ ] M02.02.03 cd/pwd/ls
- [ ] M02.02.04 quoting and pipes
- [ ] M02.02.05 exit codes
- [ ] M02.02.06 stdout/stderr
- [ ] M02.02.07 permissions
- [ ] M02.02.08 environment variables
- [ ] M02.02.09 SSH
- [ ] M02.02.10 grep/rg
- [ ] M02.02.11 curl
- [ ] M02.02.12 background processes

### Git

- [ ] M02.03.01 working tree/stage/commit
- [ ] M02.03.02 branches
- [ ] M02.03.03 diff/log
- [ ] M02.03.04 remote/push/pull
- [ ] M02.03.05 merge conflicts
- [ ] M02.03.06 revert versus reset
- [ ] M02.03.07 .gitignore
- [ ] M02.03.08 README
- [ ] M02.03.09 pull requests
- [ ] M02.03.10 code review

### Quality

- [ ] M02.04.01 pytest
- [ ] M02.04.02 fixtures/parametrization
- [ ] M02.04.03 unit/integration tests
- [ ] M02.04.04 mocks at network boundaries
- [ ] M02.04.05 logging
- [ ] M02.04.06 debugger/breakpoints
- [ ] M02.04.07 Ruff
- [ ] M02.04.08 type checking
- [ ] M02.04.09 profiling
- [ ] M02.04.10 dependency pinning
- [ ] M02.04.11 CI basics

**Pass checkpoint:** Recreate a project environment, run tests and resolve a deliberate merge conflict.

## M03 — CS, algorithms and backend foundations

Prerequisites: M02. Primary resource: C03. Planning allowance: 65 hours.

### Data structures and algorithms

- [ ] M03.01.01 arrays/hash tables
- [ ] M03.01.02 stack/queue
- [ ] M03.01.03 trees/graphs
- [ ] M03.01.04 recursion
- [ ] M03.01.05 sorting
- [ ] M03.01.06 binary search
- [ ] M03.01.07 BFS/DFS
- [ ] M03.01.08 Big-O time/space
- [ ] M03.01.09 amortized intuition

### Systems

- [ ] M03.02.01 process/thread
- [ ] M03.02.02 concurrency/parallelism
- [ ] M03.02.03 GIL concept
- [ ] M03.02.04 memory hierarchy
- [ ] M03.02.05 network/DNS
- [ ] M03.02.06 HTTP methods/status
- [ ] M03.02.07 TLS
- [ ] M03.02.08 JSON schemas
- [ ] M03.02.09 REST
- [ ] M03.02.10 authentication/authorization
- [ ] M03.02.11 caching
- [ ] M03.02.12 queues
- [ ] M03.02.13 retries/backoff
- [ ] M03.02.14 idempotency

### Backend and UI

- [ ] M03.03.01 FastAPI routes
- [ ] M03.03.02 Pydantic validation
- [ ] M03.03.03 dependency injection
- [ ] M03.03.04 streaming/SSE
- [ ] M03.03.05 async I/O
- [ ] M03.03.06 pagination
- [ ] M03.03.07 error responses
- [ ] M03.03.08 HTML/CSS/JavaScript basics
- [ ] M03.03.09 TypeScript types
- [ ] M03.03.10 accessible loading/error/source states
- [ ] M03.03.11 Gradio prototype

**Pass checkpoint:** Build and test a small HTTP API with validation, pagination and an explained complexity bound.

## M04 — Data analysis and SQL

Prerequisites: M02. Primary resource: C04. Planning allowance: 65 hours.

### Array computing

- [ ] M04.01.01 NumPy shape/dtype
- [ ] M04.01.02 indexing
- [ ] M04.01.03 broadcasting
- [ ] M04.01.04 vectorization
- [ ] M04.01.05 reductions
- [ ] M04.01.06 random seeds
- [ ] M04.01.07 numerical precision
- [ ] M04.01.08 copy/view

### Tabular data

- [ ] M04.02.01 pandas DataFrame/Series
- [ ] M04.02.02 selection
- [ ] M04.02.03 joins/groupby
- [ ] M04.02.04 missing values
- [ ] M04.02.05 duplicates
- [ ] M04.02.06 categorical values
- [ ] M04.02.07 time zones
- [ ] M04.02.08 CSV/JSON/Parquet
- [ ] M04.02.09 plotting
- [ ] M04.02.10 outliers
- [ ] M04.02.11 EDA
- [ ] M04.02.12 Polars/DuckDB awareness

### SQL

- [ ] M04.03.01 SELECT/WHERE/ORDER BY
- [ ] M04.03.02 GROUP BY/HAVING
- [ ] M04.03.03 joins
- [ ] M04.03.04 primary/foreign keys
- [ ] M04.03.05 constraints
- [ ] M04.03.06 normalization
- [ ] M04.03.07 transactions
- [ ] M04.03.08 indexes
- [ ] M04.03.09 EXPLAIN
- [ ] M04.03.10 window functions
- [ ] M04.03.11 migrations
- [ ] M04.03.12 parameterized queries
- [ ] M04.03.13 SQLite then PostgreSQL

### Data integrity

- [ ] M04.04.01 schema contracts
- [ ] M04.04.02 provenance
- [ ] M04.04.03 licensing/consent
- [ ] M04.04.04 splits by person/time
- [ ] M04.04.05 leakage
- [ ] M04.04.06 reproducible snapshots
- [ ] M04.04.07 labels
- [ ] M04.04.08 sampling bias

**Pass checkpoint:** Produce a reproducible data-quality report and relational query set on messy data.

## M05 — Linear algebra and calculus

Prerequisites: M00, M01. Primary resource: C05. Planning allowance: 90 hours.

### Linear algebra

- [ ] M05.01.01 scalars/vectors/matrices/tensors
- [ ] M05.01.02 shape conventions
- [ ] M05.01.03 dot product
- [ ] M05.01.04 cosine and normalization
- [ ] M05.01.05 norms/distances
- [ ] M05.01.06 matrix multiplication
- [ ] M05.01.07 transpose
- [ ] M05.01.08 linear transformations
- [ ] M05.01.09 span/basis/rank
- [ ] M05.01.10 orthogonality/projection
- [ ] M05.01.11 solving systems
- [ ] M05.01.12 eigenvalues/eigenvectors
- [ ] M05.01.13 SVD
- [ ] M05.01.14 PCA
- [ ] M05.01.15 positive semidefinite matrices

### Calculus and optimization

- [ ] M05.02.01 limits intuition
- [ ] M05.02.02 derivative
- [ ] M05.02.03 partial derivative
- [ ] M05.02.04 chain rule
- [ ] M05.02.05 gradient/Jacobian
- [ ] M05.02.06 Hessian intuition
- [ ] M05.02.07 integrals/expectations
- [ ] M05.02.08 finite differences
- [ ] M05.02.09 gradient descent
- [ ] M05.02.10 stochastic/minibatch gradients
- [ ] M05.02.11 learning rate
- [ ] M05.02.12 convexity
- [ ] M05.02.13 constrained optimization intuition

### Numerical work

- [ ] M05.03.01 floating point
- [ ] M05.03.02 overflow/underflow
- [ ] M05.03.03 stable softmax/log-sum-exp
- [ ] M05.03.04 conditioning
- [ ] M05.03.05 vectorized implementation
- [ ] M05.03.06 gradient checking

**Pass checkpoint:** Implement linear regression and gradients; check derivatives numerically and explain every tensor shape.

## M06 — Probability, statistics and experiments

Prerequisites: M05. Primary resource: C06. Planning allowance: 75 hours.

### Probability

- [ ] M06.01.01 sample space/events
- [ ] M06.01.02 conditional probability
- [ ] M06.01.03 independence
- [ ] M06.01.04 Bayes rule
- [ ] M06.01.05 random variables
- [ ] M06.01.06 PMF/PDF/CDF
- [ ] M06.01.07 expectation/variance/covariance
- [ ] M06.01.08 Bernoulli/binomial/Gaussian
- [ ] M06.01.09 law of large numbers
- [ ] M06.01.10 central limit theorem

### Statistics

- [ ] M06.02.01 population/sample
- [ ] M06.02.02 estimation
- [ ] M06.02.03 likelihood/log-likelihood
- [ ] M06.02.04 confidence intervals
- [ ] M06.02.05 bootstrap
- [ ] M06.02.06 hypothesis tests
- [ ] M06.02.07 p-values
- [ ] M06.02.08 effect size/power
- [ ] M06.02.09 multiple comparisons
- [ ] M06.02.10 Bayesian intuition
- [ ] M06.02.11 correlation versus causation

### Information and experiments

- [ ] M06.03.01 entropy
- [ ] M06.03.02 cross entropy
- [ ] M06.03.03 KL divergence
- [ ] M06.03.04 perplexity
- [ ] M06.03.05 randomized experiments
- [ ] M06.03.06 observational confounding
- [ ] M06.03.07 paired model comparisons
- [ ] M06.03.08 slice analysis
- [ ] M06.03.09 uncertainty/calibration

**Pass checkpoint:** Design an A/B test and bootstrap interval; distinguish uncertainty from model confidence.

## M07 — Classical machine learning

Prerequisites: M04, M05, M06. Primary resource: C07. Planning allowance: 100 hours.

### Learning problem

- [ ] M07.01.01 supervised/unsupervised/self-supervised
- [ ] M07.01.02 regression/classification/ranking
- [ ] M07.01.03 training/validation/test
- [ ] M07.01.04 objective/loss
- [ ] M07.01.05 inductive bias
- [ ] M07.01.06 overfit/underfit
- [ ] M07.01.07 bias/variance
- [ ] M07.01.08 regularization

### Algorithms

- [ ] M07.02.01 linear/ridge/lasso regression
- [ ] M07.02.02 logistic regression
- [ ] M07.02.03 kNN
- [ ] M07.02.04 naive Bayes
- [ ] M07.02.05 decision trees
- [ ] M07.02.06 random forests
- [ ] M07.02.07 gradient boosting
- [ ] M07.02.08 XGBoost/LightGBM awareness
- [ ] M07.02.09 SVM
- [ ] M07.02.10 k-means
- [ ] M07.02.11 DBSCAN
- [ ] M07.02.12 PCA

### Training and evaluation

- [ ] M07.03.01 scikit-learn Pipeline
- [ ] M07.03.02 scaling/imputation/encoding
- [ ] M07.03.03 cross validation
- [ ] M07.03.04 stratification/group/time splits
- [ ] M07.03.05 hyperparameter search
- [ ] M07.03.06 class imbalance
- [ ] M07.03.07 MAE/RMSE
- [ ] M07.03.08 precision/recall/F1
- [ ] M07.03.09 ROC-AUC/PR-AUC
- [ ] M07.03.10 calibration
- [ ] M07.03.11 threshold selection
- [ ] M07.03.12 error analysis
- [ ] M07.03.13 interpretability and SHAP caveats

**Pass checkpoint:** Beat a simple baseline with leakage-safe evaluation and explain when the baseline should be kept.

## M08 — Deep learning and PyTorch

Prerequisites: M07. Primary resource: C08. Planning allowance: 100 hours.

### Neural networks

- [ ] M08.01.01 perceptron/MLP
- [ ] M08.01.02 activations
- [ ] M08.01.03 computational graph
- [ ] M08.01.04 backpropagation
- [ ] M08.01.05 autograd
- [ ] M08.01.06 initialization
- [ ] M08.01.07 SGD/momentum/Adam
- [ ] M08.01.08 weight decay
- [ ] M08.01.09 dropout
- [ ] M08.01.10 batch/layer norm
- [ ] M08.01.11 residual connections

### PyTorch

- [ ] M08.02.01 tensors/device/dtype
- [ ] M08.02.02 Dataset/DataLoader
- [ ] M08.02.03 nn.Module
- [ ] M08.02.04 train/eval modes
- [ ] M08.02.05 zero_grad/backward/step
- [ ] M08.02.06 no_grad/inference_mode
- [ ] M08.02.07 checkpointing
- [ ] M08.02.08 reproducible seeds
- [ ] M08.02.09 loss functions
- [ ] M08.02.10 mixed precision
- [ ] M08.02.11 tensor shape debugging

### Training diagnosis

- [ ] M08.03.01 overfit one batch
- [ ] M08.03.02 learning curves
- [ ] M08.03.03 NaN detection
- [ ] M08.03.04 gradient clipping
- [ ] M08.03.05 schedules
- [ ] M08.03.06 early stopping
- [ ] M08.03.07 batching
- [ ] M08.03.08 GPU memory
- [ ] M08.03.09 throughput profiling
- [ ] M08.03.10 ablations

**Pass checkpoint:** Implement a small neural network and train a PyTorch equivalent with matching behavior.

## M09 — NLP, transformers and language models

Prerequisites: M08. Primary resource: C09. Planning allowance: 90 hours.

### NLP

- [ ] M09.01.01 text normalization
- [ ] M09.01.02 Unicode/multilingual data
- [ ] M09.01.03 n-grams
- [ ] M09.01.04 TF-IDF/BM25
- [ ] M09.01.05 word/subword embeddings
- [ ] M09.01.06 RNN/LSTM intuition
- [ ] M09.01.07 tokenization/BPE/WordPiece
- [ ] M09.01.08 padding/truncation
- [ ] M09.01.09 attention masks

### Transformers

- [ ] M09.02.01 Q/K/V
- [ ] M09.02.02 scaled dot-product attention
- [ ] M09.02.03 multihead attention
- [ ] M09.02.04 positional embeddings/RoPE
- [ ] M09.02.05 feedforward blocks
- [ ] M09.02.06 residual/layer norm
- [ ] M09.02.07 encoder/decoder/encoder-decoder
- [ ] M09.02.08 causal mask
- [ ] M09.02.09 next-token objective

### Language modeling

- [ ] M09.03.01 pretraining/instruction tuning
- [ ] M09.03.02 base versus instruct
- [ ] M09.03.03 context window
- [ ] M09.03.04 KV cache
- [ ] M09.03.05 temperature/top-p/top-k
- [ ] M09.03.06 greedy/beam sampling
- [ ] M09.03.07 stop tokens
- [ ] M09.03.08 hallucinations
- [ ] M09.03.09 perplexity
- [ ] M09.03.10 HF Transformers/Datasets/Tokenizers

**Pass checkpoint:** Implement tokenization and causal attention; fine-tune a small text classifier and inspect its errors.

## M10 — LLM applications and evaluation

Prerequisites: M03, M09. Primary resource: C10. Planning allowance: 65 hours.

### Model interface

- [ ] M10.01.01 provider SDK
- [ ] M10.01.02 model identifier/version
- [ ] M10.01.03 messages/roles
- [ ] M10.01.04 token budgets
- [ ] M10.01.05 streaming
- [ ] M10.01.06 structured output/JSON schema
- [ ] M10.01.07 function calling
- [ ] M10.01.08 refusals
- [ ] M10.01.09 finish reasons
- [ ] M10.01.10 timeouts
- [ ] M10.01.11 rate limits
- [ ] M10.01.12 usage accounting

### Prompt and context

- [ ] M10.02.01 clear task/constraints
- [ ] M10.02.02 examples
- [ ] M10.02.03 instructions versus data
- [ ] M10.02.04 context assembly
- [ ] M10.02.05 prompt templates/versioning
- [ ] M10.02.06 long-context trade-offs
- [ ] M10.02.07 caching
- [ ] M10.02.08 conversation summaries
- [ ] M10.02.09 model routing

### Evaluation

- [ ] M10.03.01 task rubric
- [ ] M10.03.02 gold dataset
- [ ] M10.03.03 exact match and semantic measures
- [ ] M10.03.04 deterministic checks
- [ ] M10.03.05 human review
- [ ] M10.03.06 judge calibration/bias
- [ ] M10.03.07 pairwise/blind judging
- [ ] M10.03.08 contamination
- [ ] M10.03.09 cost/latency
- [ ] M10.03.10 regression suites
- [ ] M10.03.11 traces

**Pass checkpoint:** Ship a validated extraction service with a held-out evaluation set, retries and a cost report.

## M11 — Search, embeddings and RAG

Prerequisites: M04, M10. Primary resource: C11. Planning allowance: 95 hours.

### Ingestion

- [ ] M11.01.01 HTML/PDF/OCR
- [ ] M11.01.02 tables/layout
- [ ] M11.01.03 extraction quality
- [ ] M11.01.04 normalization
- [ ] M11.01.05 document IDs
- [ ] M11.01.06 metadata/ACLs
- [ ] M11.01.07 incremental updates
- [ ] M11.01.08 checksums
- [ ] M11.01.09 provenance

### Chunks

- [ ] M11.02.01 token/character/sentence splitting
- [ ] M11.02.02 recursive splitting
- [ ] M11.02.03 heading-aware splitting
- [ ] M11.02.04 semantic splitting
- [ ] M11.02.05 overlap
- [ ] M11.02.06 size tuning
- [ ] M11.02.07 tables/code chunks
- [ ] M11.02.08 parent-child chunks
- [ ] M11.02.09 neighboring-window expansion
- [ ] M11.02.10 deduplication
- [ ] M11.02.11 reconstructing context with offsets

### Embeddings and indexes

- [ ] M11.03.01 embedding model selection
- [ ] M11.03.02 dimensionality
- [ ] M11.03.03 query/document asymmetry
- [ ] M11.03.04 cosine/dot/L2
- [ ] M11.03.05 normalization
- [ ] M11.03.06 batches
- [ ] M11.03.07 FAISS
- [ ] M11.03.08 exact versus ANN
- [ ] M11.03.09 HNSW/IVF/PQ
- [ ] M11.03.10 pgvector/Qdrant
- [ ] M11.03.11 index recall/latency
- [ ] M11.03.12 versioned reindexing

### Retrieval

- [ ] M11.04.01 BM25
- [ ] M11.04.02 dense retrieval
- [ ] M11.04.03 hybrid/RRF
- [ ] M11.04.04 metadata filters
- [ ] M11.04.05 reranking/cross-encoders
- [ ] M11.04.06 MMR/diversity
- [ ] M11.04.07 query rewriting/decomposition
- [ ] M11.04.08 HyDE
- [ ] M11.04.09 multi-query fusion
- [ ] M11.04.10 parent retrieval
- [ ] M11.04.11 context compression
- [ ] M11.04.12 GraphRAG
- [ ] M11.04.13 multimodal retrieval

### Answering and evaluation

- [ ] M11.05.01 context packing
- [ ] M11.05.02 citations/source spans
- [ ] M11.05.03 abstention
- [ ] M11.05.04 contradiction handling
- [ ] M11.05.05 recall@k/MRR/nDCG
- [ ] M11.05.06 faithfulness
- [ ] M11.05.07 answer correctness
- [ ] M11.05.08 freshness
- [ ] M11.05.09 authorization filtering
- [ ] M11.05.10 adversarial documents
- [ ] M11.05.11 component ablation

**Pass checkpoint:** Compare lexical, dense and hybrid search; publish retrieval and answer-quality results with citations.

## M12 — Agents, tools and protocols

Prerequisites: M10, M11. Primary resource: C12. Planning allowance: 85 hours.

### Agent core

- [ ] M12.01.01 workflow versus agent
- [ ] M12.01.02 observation/action loop
- [ ] M12.01.03 tool schemas
- [ ] M12.01.04 deterministic routing
- [ ] M12.01.05 planning
- [ ] M12.01.06 ReAct
- [ ] M12.01.07 stopping criteria
- [ ] M12.01.08 max steps
- [ ] M12.01.09 budget/time limits
- [ ] M12.01.10 parallel independent tools
- [ ] M12.01.11 structured state

### Reliability and context

- [ ] M12.02.01 persistent checkpoints
- [ ] M12.02.02 idempotent tools
- [ ] M12.02.03 retry policy
- [ ] M12.02.04 human review
- [ ] M12.02.05 short/long-term memory
- [ ] M12.02.06 retrieval of memory
- [ ] M12.02.07 summarization losses
- [ ] M12.02.08 prompt injection
- [ ] M12.02.09 sandboxing
- [ ] M12.02.10 permission boundaries
- [ ] M12.02.11 audit logs

### Frameworks and protocols

- [ ] M12.03.01 plain Python baseline
- [ ] M12.03.02 LangGraph
- [ ] M12.03.03 LangChain
- [ ] M12.03.04 LlamaIndex workflows
- [ ] M12.03.05 smolagents
- [ ] M12.03.06 CrewAI awareness
- [ ] M12.03.07 PydanticAI awareness
- [ ] M12.03.08 MCP client/server
- [ ] M12.03.09 resources/tools/prompts
- [ ] M12.03.10 transports
- [ ] M12.03.11 authentication
- [ ] M12.03.12 protocol version pinning

### Agent evaluation

- [ ] M12.04.01 task success
- [ ] M12.04.02 tool correctness
- [ ] M12.04.03 side effects
- [ ] M12.04.04 recovery tests
- [ ] M12.04.05 trajectory analysis
- [ ] M12.04.06 simulated tools
- [ ] M12.04.07 safety cases
- [ ] M12.04.08 compare agent against deterministic workflow
- [ ] M12.04.09 multi-agent costs and coordination failure

**Pass checkpoint:** Build a bounded tool agent that resumes after failure and respects explicit action permissions.

## M13 — Adaptation, post-training and RL

Prerequisites: M09, M06. Primary resource: C09. Supplement: C17 for RL; P15–P18 for adaptation/post-training. Planning allowance: 95 hours.

### Training data

- [ ] M13.01.01 instruction/chat templates
- [ ] M13.01.02 supervised labels
- [ ] M13.01.03 dataset curation/dedup
- [ ] M13.01.04 packing
- [ ] M13.01.05 masking labels
- [ ] M13.01.06 train/eval contamination
- [ ] M13.01.07 synthetic data quality

### Adaptation

- [ ] M13.02.01 full fine-tune
- [ ] M13.02.02 LoRA rank/alpha/target modules
- [ ] M13.02.03 QLoRA/4-bit storage
- [ ] M13.02.04 adapters
- [ ] M13.02.05 PEFT/TRL
- [ ] M13.02.06 learning rates
- [ ] M13.02.07 checkpoints
- [ ] M13.02.08 catastrophic forgetting
- [ ] M13.02.09 distillation
- [ ] M13.02.10 merge/evaluate

### Post-training

- [ ] M13.03.01 SFT
- [ ] M13.03.02 preference datasets
- [ ] M13.03.03 reward models
- [ ] M13.03.04 RLHF concepts
- [ ] M13.03.05 DPO objective
- [ ] M13.03.06 reward hacking
- [ ] M13.03.07 verifiable rewards
- [ ] M13.03.08 GRPO awareness
- [ ] M13.03.09 safety evaluation

### RL foundations

- [ ] M13.04.01 MDP/state/action/reward
- [ ] M13.04.02 return/discount
- [ ] M13.04.03 policy/value
- [ ] M13.04.04 exploration
- [ ] M13.04.05 bandits
- [ ] M13.04.06 Bellman equations
- [ ] M13.04.07 policy gradient
- [ ] M13.04.08 REINFORCE
- [ ] M13.04.09 PPO
- [ ] M13.04.10 offline RL limits

**Pass checkpoint:** Compare prompting, retrieval and LoRA on one task; evaluate before and after on held-out data.

## M14 — LLMs from scratch and research methods

Prerequisites: M13, M08. Primary resource: C14. Planning allowance: 110 hours.

### End-to-end LM

- [ ] M14.01.01 BPE tokenizer
- [ ] M14.01.02 corpus cleaning/dedup
- [ ] M14.01.03 data loader
- [ ] M14.01.04 causal Transformer
- [ ] M14.01.05 optimizer/schedule
- [ ] M14.01.06 training loop
- [ ] M14.01.07 checkpoint/resume
- [ ] M14.01.08 perplexity
- [ ] M14.01.09 sampling
- [ ] M14.01.10 scaling-law intuition

### Research practice

- [ ] M14.02.01 reading abstract/method/experiments/limitations
- [ ] M14.02.02 hypothesis
- [ ] M14.02.03 baselines
- [ ] M14.02.04 ablations
- [ ] M14.02.05 seeds
- [ ] M14.02.06 uncertainty
- [ ] M14.02.07 replication versus reproduction
- [ ] M14.02.08 experiment log
- [ ] M14.02.09 negative results
- [ ] M14.02.10 peer review
- [ ] M14.02.11 technical writing

### Advanced architectures

- [ ] M14.03.01 mixture of experts/routing
- [ ] M14.03.02 sparse attention
- [ ] M14.03.03 state-space model awareness
- [ ] M14.03.04 retrieval and reasoning training
- [ ] M14.03.05 architecture trade-offs
- [ ] M14.03.06 benchmark validity

**Pass checkpoint:** Train a small decoder model and reproduce one paper result at an explicitly reduced scale.

## M15 — Vision, audio and multimodal branch

Prerequisites: M08, M09. Primary resource: C15. Planning allowance: 70 hours.

### Vision

- [ ] M15.01.01 image tensors
- [ ] M15.01.02 augmentation
- [ ] M15.01.03 CNNs
- [ ] M15.01.04 ResNet
- [ ] M15.01.05 transfer learning
- [ ] M15.01.06 detection/segmentation concepts
- [ ] M15.01.07 ViT
- [ ] M15.01.08 contrastive learning/CLIP

### Generative media

- [ ] M15.02.01 autoencoders/VAE
- [ ] M15.02.02 GAN intuition
- [ ] M15.02.03 diffusion/noise schedule
- [ ] M15.02.04 denoising
- [ ] M15.02.05 conditioning
- [ ] M15.02.06 latent diffusion
- [ ] M15.02.07 sampling
- [ ] M15.02.08 Diffusers

### Audio and multimodal

- [ ] M15.03.01 sample rate/waveform
- [ ] M15.03.02 STFT/spectrogram
- [ ] M15.03.03 ASR
- [ ] M15.03.04 TTS
- [ ] M15.03.05 diarization awareness
- [ ] M15.03.06 vision-language models
- [ ] M15.03.07 document OCR versus VLM
- [ ] M15.03.08 audio/text/image embeddings
- [ ] M15.03.09 modality-specific evaluation

**Pass checkpoint:** Build one image or speech application and evaluate it on difficult cases.

## M16 — MLOps and data pipelines

Prerequisites: M07, M03. Primary resource: C16. Planning allowance: 90 hours.

### Reproducibility

- [ ] M16.01.01 dataset/version lineage
- [ ] M16.01.02 DVC awareness
- [ ] M16.01.03 experiment tracking
- [ ] M16.01.04 MLflow
- [ ] M16.01.05 artifact/model registry
- [ ] M16.01.06 config management
- [ ] M16.01.07 seeds
- [ ] M16.01.08 train/serve skew
- [ ] M16.01.09 data contracts

### Pipelines

- [ ] M16.02.01 batch/stream
- [ ] M16.02.02 ETL/ELT
- [ ] M16.02.03 orchestration
- [ ] M16.02.04 Airflow/Prefect/Dagster alternatives
- [ ] M16.02.05 feature stores
- [ ] M16.02.06 scheduling
- [ ] M16.02.07 backfills
- [ ] M16.02.08 data quality
- [ ] M16.02.09 training triggers

### Delivery

- [ ] M16.03.01 Docker/images
- [ ] M16.03.02 Compose
- [ ] M16.03.03 CI/CD
- [ ] M16.03.04 model/service/data tests
- [ ] M16.03.05 staged rollout
- [ ] M16.03.06 rollback
- [ ] M16.03.07 batch/online serving
- [ ] M16.03.08 shadow/canary deployments

### Monitoring

- [ ] M16.04.01 latency/availability
- [ ] M16.04.02 data/concept drift
- [ ] M16.04.03 label delay
- [ ] M16.04.04 calibration
- [ ] M16.04.05 performance by slice
- [ ] M16.04.06 alert thresholds
- [ ] M16.04.07 retraining governance
- [ ] M16.04.08 OpenTelemetry
- [ ] M16.04.09 incident review

**Pass checkpoint:** Rebuild, register and deploy a versioned model through CI and catch a deliberate data drift.

## M17 — Serving, cloud and ML systems

Prerequisites: M08, M16. Primary resource: C14. Supplements: C16 and B09 for production systems; P20–P21 for inference. Planning allowance: 105 hours.

### Cloud fundamentals

- [ ] M17.01.01 one cloud first
- [ ] M17.01.02 IAM/least privilege
- [ ] M17.01.03 object storage
- [ ] M17.01.04 compute/GPU rental
- [ ] M17.01.05 networking
- [ ] M17.01.06 managed databases
- [ ] M17.01.07 secrets
- [ ] M17.01.08 budgets
- [ ] M17.01.09 infrastructure as code

### Inference

- [ ] M17.02.01 quantization/precision
- [ ] M17.02.02 ONNX awareness
- [ ] M17.02.03 llama.cpp
- [ ] M17.02.04 vLLM
- [ ] M17.02.05 SGLang awareness
- [ ] M17.02.06 dynamic/continuous batching
- [ ] M17.02.07 KV cache
- [ ] M17.02.08 prefix caching
- [ ] M17.02.09 speculative decoding
- [ ] M17.02.10 TTFT/TPOT
- [ ] M17.02.11 p50/p95/p99
- [ ] M17.02.12 throughput versus latency
- [ ] M17.02.13 memory accounting

### Scale

- [ ] M17.03.01 DDP
- [ ] M17.03.02 FSDP
- [ ] M17.03.03 tensor/pipeline/data parallelism
- [ ] M17.03.04 collectives
- [ ] M17.03.05 communication bottlenecks
- [ ] M17.03.06 gradient accumulation
- [ ] M17.03.07 checkpoint sharding
- [ ] M17.03.08 fault recovery
- [ ] M17.03.09 profiling
- [ ] M17.03.10 CUDA/Triton introduction

### Operations

- [ ] M17.04.01 Kubernetes concepts
- [ ] M17.04.02 autoscaling
- [ ] M17.04.03 resource requests
- [ ] M17.04.04 queues/backpressure
- [ ] M17.04.05 health probes
- [ ] M17.04.06 SLOs
- [ ] M17.04.07 capacity planning
- [ ] M17.04.08 multi-tenant isolation
- [ ] M17.04.09 disaster recovery

**Pass checkpoint:** Benchmark an inference service, identify its bottleneck and demonstrate rollback under load.

## M18 — Safety, privacy and responsible engineering

Prerequisites: M10. Primary resource: C16. Planning allowance: 40 hours.

### Security

- [ ] M18.01.01 prompt injection
- [ ] M18.01.02 untrusted retrieval
- [ ] M18.01.03 tool output trust
- [ ] M18.01.04 authN/authZ
- [ ] M18.01.05 tenant isolation
- [ ] M18.01.06 secrets
- [ ] M18.01.07 dependency supply chain
- [ ] M18.01.08 sandbox escape awareness
- [ ] M18.01.09 data exfiltration
- [ ] M18.01.10 rate limits

### Responsible ML

- [ ] M18.02.01 consent/licensing
- [ ] M18.02.02 privacy/PII
- [ ] M18.02.03 fairness/subgroups
- [ ] M18.02.04 model/data cards
- [ ] M18.02.05 accessibility
- [ ] M18.02.06 misuse limits
- [ ] M18.02.07 uncertainty
- [ ] M18.02.08 human escalation
- [ ] M18.02.09 evaluation of harms
- [ ] M18.02.10 governance

### Testing defenses

- [ ] M18.03.01 adversarial corpus
- [ ] M18.03.02 denied-action tests
- [ ] M18.03.03 output validation
- [ ] M18.03.04 least privilege
- [ ] M18.03.05 safe logging
- [ ] M18.03.06 reproducible risk register
- [ ] M18.03.07 incident response

**Pass checkpoint:** Create a threat model, a red-team test suite and a documented response to failure.

## M19 — Additional AI domains and role branches

Prerequisites: M07. Primary resource: C07. Planning allowance: 45 hours.

### Breadth map

- [ ] M19.01.01 time series/forecasting
- [ ] M19.01.02 recommendation/ranking
- [ ] M19.01.03 graph ML
- [ ] M19.01.04 anomaly detection
- [ ] M19.01.05 causal inference
- [ ] M19.01.06 Bayesian ML
- [ ] M19.01.07 optimization/search
- [ ] M19.01.08 symbolic reasoning
- [ ] M19.01.09 robotics/control
- [ ] M19.01.10 edge/TinyML
- [ ] M19.01.11 federated learning

### Role skills

- [ ] M19.02.01 AI application engineering
- [ ] M19.02.02 ML engineering
- [ ] M19.02.03 data science/experimentation
- [ ] M19.02.04 research engineering
- [ ] M19.02.05 inference/ML systems
- [ ] M19.02.06 platform/MLOps
- [ ] M19.02.07 FDE requirements discovery
- [ ] M19.02.08 customer integration
- [ ] M19.02.09 deployment constraints

### Communication

- [ ] M19.03.01 requirements interviews
- [ ] M19.03.02 product metrics
- [ ] M19.03.03 architecture decisions
- [ ] M19.03.04 technical demos
- [ ] M19.03.05 cost estimates
- [ ] M19.03.06 explaining limitations
- [ ] M19.03.07 writing reproducible case studies

**Pass checkpoint:** Choose one depth branch and explain what it adds to your target role.

## M20 — Portfolio, specialization and final-year project

Prerequisites: M11, M12, M16, M18. Primary resource: C11. Planning allowance: 130 hours.

### Evidence

- [ ] M20.01.01 public README
- [ ] M20.01.02 reproducible setup
- [ ] M20.01.03 dataset/model license
- [ ] M20.01.04 architecture
- [ ] M20.01.05 baseline
- [ ] M20.01.06 test/eval suite
- [ ] M20.01.07 benchmark table
- [ ] M20.01.08 failure cases
- [ ] M20.01.09 demo
- [ ] M20.01.10 user feedback
- [ ] M20.01.11 issue history

### Specialization

- [ ] M20.02.01 choose applied AI OR model/research OR systems primary
- [ ] M20.02.02 identify real users
- [ ] M20.02.03 scoped research question
- [ ] M20.02.04 capstone timeline
- [ ] M20.02.05 compute budget
- [ ] M20.02.06 supervision
- [ ] M20.02.07 measurable acceptance criteria

### Career preparation

- [ ] M20.03.01 Python/SQL interview exercises
- [ ] M20.03.02 ML system design
- [ ] M20.03.03 model debugging
- [ ] M20.03.04 paper discussion
- [ ] M20.03.05 distributed-systems fundamentals for systems roles
- [ ] M20.03.06 open-source contribution
- [ ] M20.03.07 technical communication

**Pass checkpoint:** Deliver a useful evaluated product and an independent technical report reviewed by another person.

