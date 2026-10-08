# AI ecosystem: tools by purpose

Prepared 2026-10-07. This is a broad representative registry, not an exhaustive list of every existing package. Tools appear and disappear continuously. Learn the concept and one implementation; inspect alternatives when a real constraint requires them. Inclusion does not certify maintenance, security, price or superiority.

The source in each row supports the category or the primary learning stack; it is not a verification of every alternative named in that row. Core framework landing pages were inspected separately; the audit records exactly what was read. Before installing an alternative, verify its official repository, license, current release and migration documentation.

| Category | Tools / alternatives | Learn first | Concepts that transfer | Stage / source |
|---|---|---|---|---|
| Runtime/package management | Python, pip, venv, uv, conda, Poetry | Use Python + uv; understand pip/venv first | Interpreter, isolated environment, dependency resolution, lockfiles | M02; [reference](https://docs.astral.sh/uv/) |
| Quality and notebooks | pytest, Ruff, mypy, Jupyter, IPython | pytest + Ruff; notebooks for exploration, scripts for pipelines | Testing, types, linting, debugging, reproducibility | M02; [reference](https://docs.python.org/3/tutorial/) |
| Arrays/data | NumPy, SciPy, pandas, Polars, PyArrow, DuckDB | NumPy + pandas; DuckDB for SQL over files | Shapes, vectorization, types, missing values, joins, columnar storage | M04; [reference](https://wesmckinney.com/book/) |
| Relational storage | SQLite, PostgreSQL, SQLAlchemy, Alembic | SQLite first, PostgreSQL for services | SQL, schema, transactions, indexes, migrations | M04; [reference](https://cs50.harvard.edu/sql/) |
| Classical ML | scikit-learn, XGBoost, LightGBM, CatBoost, Optuna | scikit-learn, one boosting library when justified | Splits, baselines, preprocessing, objectives, tuning | M07; [reference](https://scikit-learn.org/stable/user_guide.html) |
| DL runtimes | PyTorch, JAX, TensorFlow, Keras | PyTorch deeply; others for the selected team/role | Autograd, tensor programs, training loops, compilation | M08; [reference](https://pytorch.org/tutorials/beginner/basics/intro.html) |
| Model/data distribution | Hugging Face Hub, Transformers, Datasets, Tokenizers, Accelerate, Safetensors | Transformers + Datasets | Model cards, dataset licenses, tokenization, device mapping | M09; [reference](https://huggingface.co/learn/llm-course/en/chapter1/1) |
| Adaptation and training | PEFT, TRL, bitsandbytes, DeepSpeed, Megatron-LM | PEFT/TRL only when adapting a model | SFT, LoRA, quantization, preference objectives, memory | M13; [reference](https://huggingface.co/learn/llm-course/en/chapter1/1) |
| Vision/media/audio | torchvision, timm, OpenCV, Diffusers, librosa, Whisper, torchaudio | One modality stack for a real task | Image transforms, spectrograms, encoders, diffusion, modality metrics | M15; [reference](https://course.fast.ai/) |
| RL | Gymnasium, Stable-Baselines3, CleanRL, RLlib | One simple environment and one implementation | MDP, rewards, value/policy, exploration, reproducibility | M13; [reference](https://huggingface.co/learn/deep-rl-course/en/unit0/introduction) |
| Model API/access layer | Provider SDKs, OpenAI-compatible endpoints, LiteLLM, OpenRouter | One provider SDK, then optional gateway | Network failures, schemas, model capabilities, accounting | M10; [reference](https://fullstackdeeplearning.com/llm-bootcamp/) |
| Embedding/reranking models | Sentence Transformers, HF embedding models, hosted embedding APIs, cross-encoders | One embedding model and a measured reranker | Representation, normalization, asymmetric retrieval, multilingual performance | M11; [reference](https://huggingface.co/learn/llm-course/en/chapter1/1) |
| Vector indexes | FAISS, hnswlib, Annoy, ScaNN | Exact small baseline, then FAISS/ANN as needed | kNN versus ANN, HNSW/IVF/PQ, recall-memory-latency trade-offs | M11; [reference](https://github.com/pgvector/pgvector) |
| Vector databases | pgvector, Qdrant, Weaviate, Milvus, Pinecone, Chroma, LanceDB | pgvector OR Qdrant; compare one alternative | Persistence, filters, updates/deletes, replicas, tenant boundaries | M11; [reference](https://qdrant.tech/documentation/) |
| Lexical/hybrid search | BM25, Elasticsearch, OpenSearch, Lucene, reciprocal rank fusion | BM25 baseline + optional RRF | Token statistics, rank fusion, filters, reranking | M11; [reference](https://github.com/langchain-ai/rag-from-scratch) |
| Document ingestion | Docling, Unstructured, PyMuPDF, Apache Tika, Tesseract, LlamaParse, Firecrawl | Choose one parser based on corpus; evaluate extraction | OCR/layout, tables, metadata, source offsets, freshness | M11; [reference](https://docs.llamaindex.ai/) |
| RAG orchestration | LlamaIndex, LangChain, Haystack, LightRAG | Plain Python baseline, then one framework | Ingestion/index/query boundaries, component replacement, observable pipelines | M11; [reference](https://docs.llamaindex.ai/) |
| Agent runtime/framework | LangGraph, smolagents, PydanticAI, CrewAI, provider agent SDKs | Plain loop → LangGraph in depth | State, tools, budgets, checkpoints, replay, review | M12; [reference](https://docs.langchain.com/oss/python/langgraph/overview) |
| Other enterprise agent ecosystems | Microsoft Agent Framework, AutoGen, Semantic Kernel | Awareness; verify current migration/support docs before selecting | Contracts, orchestration, interoperability; team-specific adoption | M12; [reference](https://huggingface.co/learn/agents-course/en/unit0/introduction) |
| Program optimization/structured output | DSPy, Instructor, Pydantic, constrained decoding tools | Pydantic/schema validation first; DSPy after a scored task exists | Typed outputs, optimization objectives, validation and repair | M10; [reference](https://dspy.ai/) |
| Tool interoperability | MCP, JSON Schema, HTTP APIs, OpenAPI, agent-to-agent protocols | HTTP/tool contracts, then MCP | Client/server boundaries, transports, auth, capabilities, versioning | M12; [reference](https://modelcontextprotocol.io/docs/getting-started/intro) |
| Evaluation | Ragas, DeepEval, promptfoo, lm-evaluation-harness, HELM, Lighteval | Small gold dataset + deterministic scoring; add one tool | Task metrics, held-out data, judge bias, regression and contamination | M10; [reference](https://docs.ragas.io/en/stable/) |
| Tracing/observability | LangSmith, Langfuse, Phoenix, OpenTelemetry, Helicone | One tracing tool with safe data handling | Spans, tool traces, token spend, latency, version linkage | M10; [reference](https://academy.langchain.com/) |
| Local/model serving | llama.cpp, Ollama, vLLM, SGLang, TensorRT-LLM, ONNX Runtime, Triton Inference Server | Small local model, then vLLM for GPU service if needed | Quantization, batching, KV cache, TTFT, throughput, memory | M17; [reference](https://docs.vllm.ai/en/latest/) |
| Services/UI | FastAPI, Pydantic, Gradio, Streamlit, React, TypeScript | FastAPI + Gradio first; React when custom UX warrants it | Contracts, validation, streaming, loading/errors, usability | M03; [reference](https://fastapi.tiangolo.com/tutorial/) |
| Experiment/model lifecycle | MLflow, Weights & Biases, DVC, Feast | MLflow and versioned datasets; feature store only if needed | Lineage, artifacts, registries, train/serve skew | M16; [reference](https://mlflow.org/docs/latest/) |
| Data/job orchestration | Airflow, Prefect, Dagster, Spark, Ray | One orchestrator for a real scheduled workload | DAGs, retries, idempotency, backfills, data contracts | M16; [reference](https://github.com/DataTalksClub/mlops-zoomcamp) |
| Deployment/platform | Docker, Compose, Kubernetes, Terraform, GitHub Actions, KServe, BentoML, Ray Serve | Docker + CI + one deployment target | Images, secrets, rollout, rollback, autoscaling, SLOs | M16/M17; [reference](https://madewithml.com/) |
| Metrics/monitoring | Prometheus, Grafana, Evidently, Great Expectations, Pandera | Service metrics + simple data checks | Data quality, drift, label delay, alerting and incidents | M16; [reference](https://madewithml.com/) |
| GPU/distributed systems | CUDA, Triton kernel language, NCCL, DDP, FSDP, torch.compile, Ray Train | PyTorch profiling, then DDP; kernels for systems specialty | Memory hierarchy, collectives, parallelism, bottleneck analysis | M17; [reference](https://cs336.stanford.edu/) |
| Safety and isolation | NeMo Guardrails, Guardrails AI, Docker isolation, E2B, policy/auth layers | Threat model, application permissions and deterministic validation first | Untrusted data, least privilege, sandbox limits, adversarial eval | M18; [reference](https://huggingface.co/docs/smolagents/en/index) |
| Mobile learning app, later | React Native, Expo, expo-notifications, expo-sqlite, Flutter alternative | Provisional Expo/React Native route, see app specification | Offline data, notifications, permission UX, progress and scheduling | After foundations; [reference](https://docs.expo.dev/versions/latest/sdk/notifications/) |

## Frameworks do different jobs

| Tool | Primary job | Why study it | Depth recommendation |
|---|---|---|---|
| [LangChain](https://docs.langchain.com/oss/python/langgraph/overview) | Model/tool integrations and agent abstractions | Common interfaces and composable application pieces | Understand abstraction; do one small implementation |
| [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) | Stateful agent/workflow orchestration runtime | Checkpoints, recovery, streaming and human review | Selected primary for advanced agent orchestration |
| [LlamaIndex](https://docs.llamaindex.ai/) | Data/context augmentation, RAG and workflows | Document-to-index-to-query boundaries | Build the same retrieval task once for comparison |
| [Haystack](https://docs.haystack.deepset.ai/docs/intro) | Component pipelines for search/RAG/agents | Explicit reusable processing components | Awareness; investigate if a pipeline suits the product |
| [smolagents](https://huggingface.co/docs/smolagents/en/index) | Lightweight code/tool agent loops | Makes agent mechanics inspectable | Good small learning implementation; sandbox code execution |
| [CrewAI](https://docs.crewai.com/) | Crews and flows with multiple specialist agents | Role/task organization and coordination | Later comparison; do not assume more agents improve outcomes |
| [PydanticAI](https://ai.pydantic.dev/) | Python agent programming with typed outputs/dependencies | Contracts and validation | Alternative when typed Python integration fits |
| [DSPy](https://dspy.ai/) | Structured LLM programs and optimization against metrics | Systematic optimization rather than manual prompt guessing | After evaluation dataset exists |
| [LightRAG](https://github.com/HKUDS/LightRAG) | Named graph-oriented retrieval project | One implementation to compare with ordinary retrieval | Optional; project name does not define the whole RAG category |

LangSmith is an evaluation/tracing/deployment platform, whereas LangGraph is an orchestration runtime. MCP is an interoperability protocol, not a replacement for an agent framework or a model. A vector database stores and searches vectors; an embedding model produces them. FAISS is an index/search library, not automatically a managed database. A model provider is different from a model architecture, and an “open-weight” model does not necessarily grant unrestricted use.

The saved-material pass adds Agno, OpenAI Agents SDK, Mastra, Letta and Google ADK explicitly to the registry, plus Redis and Kedro. The registry now has 174 illustrative entries. See [framework comparisons](16-agent-frameworks-and-protocols.md) and [prerequisite-based depth units](15-coverage-audit-and-learning-extensions.md); awareness of an option does not mean it must become your primary tool.

## Names from your message

“small agent” likely means **smolagents**, which is verified above. “QAI” and “LangRAG” remain ambiguous: they could refer to different products or be speech transcription errors. CrewAI, LangGraph and LightRAG are separate verified names included for orientation; I have not silently declared any of them the intended term. Add the exact links when you find your saved material.

## What to master first

Python → Git/testing → NumPy/pandas/SQL → scikit-learn → PyTorch → HF Transformers → one provider SDK → plain retrieval plus one vector store → one agent runtime → evaluation/tracing → Docker/MLflow/deployment.

The rest is an awareness map or role-specific expansion. Collecting every framework would undermine the depth you want. You should be able to rebuild a smaller version of the abstraction you use and explain its cost, failure modes and replacement options.
