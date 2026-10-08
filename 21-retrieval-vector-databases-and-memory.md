# Retrieval frameworks, search storage and memory

Reviewed 2026-10-07. MAG here means **Memory Augmented Generation**, as you clarified. It describes augmentation with remembered information; it does not identify one universally agreed architecture or a fixed set of techniques. Store the exact implementation or paper alongside the acronym when comparing systems.

## What each layer does

An embedding is a numerical representation. Retrieval selects relevant information. A vector database stores/indexes vectors with supporting data. An orchestration framework connects ingestion, retrieval and generation. An agent runtime decides when to invoke tools and maintains execution state. One system can use all of these.

| Layer | Examples and verified references | How to compare |
|---|---|---|
| RAG/application orchestration | [LlamaIndex](https://developers.llamaindex.ai/python/framework/), [Haystack](https://docs.haystack.deepset.ai/docs/intro), LangChain, custom Python | Ingestion abstraction, retriever composition, metadata/citation handling, debugging, testing and provider portability. |
| Program optimization | [DSPy](https://github.com/stanfordnlp/dspy) | Metric-driven optimization of LM programs; adjacent to orchestration, not a vector store. |
| Relational plus vector search | [PostgreSQL + pgvector](https://github.com/pgvector/pgvector) | SQL transactions/joins and existing operations versus specialized search needs; measure exact versus approximate retrieval. |
| Specialized vector stores | [Qdrant](https://qdrant.tech/documentation/manage-data/indexing/), [Milvus](https://milvus.io/docs/overview.md), [Weaviate](https://docs.weaviate.io/weaviate), [Chroma](https://docs.trychroma.com/docs/overview/introduction), [Pinecone](https://docs.pinecone.io/guides/get-started/overview) | Hosting mode, filtering, hybrid retrieval, updates, backup, tenancy, latency, cost and operational burden. Verify edition-specific capabilities. |
| Search/ranking platforms | [Vespa](https://docs.vespa.ai/en/learn/overview.html), [Elasticsearch learning material](https://www.elastic.co/search-labs/tutorials) | Lexical/vector/ranking composition and workload requirements. These have broader responsibilities than basic nearest-neighbor storage. |

“What does industry use instead of LlamaIndex?” depends on the layer. Haystack/custom orchestration may replace its application layer; a database generally complements it. No market-share ranking is established by this review. Test your own corpus, filters, deployment constraints and budget before selecting a stack.

## Ordered drill-down

| Stage | Learn within it | Build and check |
|---|---|---|
| 1. Documents and ingestion | MIME/encoding; PDF text versus scanned images; OCR; tables/layout; normalization; deduplication; document IDs; incremental imports; source permissions | Ingest ten mixed documents with stable IDs and recoverable parsing errors. |
| 2. Chunking | Token/character boundaries; fixed-size/overlap; sentence/paragraph/heading; recursive splitting; semantic splitting; parent-child chunks; tables/code; late chunking as an advanced branch | Keep offsets and parent IDs. Compare citation accuracy and retrieval quality at different sizes. |
| 3. Representations | Sparse/BM25; dense embeddings; dimensions; normalization; cosine/dot/L2; multilingual/domain mismatch; batching; embedding-version migration | Build lexical and dense baselines before hybrid retrieval. |
| 4. Index structures | Exact scan; HNSW graph/search effort; IVF clusters/probes; product/scalar quantization; memory/recall tradeoff; filtering before/after ANN; deleted records | Measure recall against an exact baseline, p95 latency, memory and filtered-query failures. |
| 5. Retrieval pipeline | Query rewriting/decomposition; metadata constraints; dense/sparse fusion; reciprocal-rank fusion; reranking; MMR; routing; context packing; citations; abstention | A labeled query set with unanswerable and permission-restricted cases. |
| 6. RAG variants | Basic retrieval; hybrid; hierarchical; multi-query; query decomposition; corrective/self-reflective; adaptive routing; graph retrieval; multimodal; agentic retrieval; long-context/cache alternatives | Compare one change at a time. Names overlap; there is no canonical count of twelve RAG types. |
| 7. Memory augmentation | Working/session state; episodic events; semantic facts; procedural skills; explicit versus inferred writes; timestamps; provenance; retrieval; consolidation; contradiction; TTL/forgetting | Test stale, contradictory and malicious remembered content; prove deletion and user separation. |
| 8. Production | Access-control filters; tenant isolation; transactional writes; backups; observability; corpus drift; retrieval evaluation; prompt injection; data retention; cost per answered query | A restore drill and an evaluation rerun after changing the corpus or embedding model. |

Prerequisites: M01–M04 for data pipelines; M09/M10 for embeddings/generation; M11 for retrieval; M12/M18 for agent memory and safe execution. Revisit [the existing RAG map](07-rag-and-agents-deep-map.md) and use the structured drill-down in [the expanded topic map](22-ecosystem-drill-down.md).

RAG usually selects external evidence for the current query. CAG explores cached context under particular corpus/context assumptions. MAG adds remembered state, potentially using retrieval itself. They can coexist; compare behavior rather than treating their acronyms as mutually exclusive products. Study the [CAG paper](https://arxiv.org/abs/2412.15605) and [Generative Agents memory example](https://arxiv.org/abs/2304.03442) with the conditions of their experiments intact.
