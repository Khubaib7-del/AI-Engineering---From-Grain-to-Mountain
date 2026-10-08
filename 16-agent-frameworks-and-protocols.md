# Agent frameworks: what to learn and why

Your heading says nine frameworks, but you supplied eight. LlamaIndex below is an additional comparison, not an invented missing item from the reel. Reviewed official project pages on 2026-10-07; do not infer that every companion cloud product is open source or free.

| Framework | Main study angle | Prerequisites and experiment |
|---|---|---|
| [CrewAI](https://github.com/crewAIInc/crewAI) | Role/task crews and controlled flows | Python, tools, state; compare crew with a deterministic workflow |
| [LangGraph](https://github.com/langchain-ai/langgraph) | Stateful graphs, persistence and recovery | Python, state machines, async; interrupt, resume and replay a failed tool |
| [Agno](https://github.com/agno-agi/agno) | Agents, teams and operational platform | Python, APIs, storage; inspect what runtime versus service layers own |
| [OpenAI Agents SDK](https://github.com/openai/openai-agents-python) | Lightweight orchestration, handoffs and tracing | Python and tool contracts; trace a handoff and test its failure boundary |
| [smolagents](https://github.com/huggingface/smolagents) | Compact agents and code actions | Python and sandboxing; compare code execution with typed function tools |
| [Mastra](https://github.com/mastra-ai/mastra) | TypeScript agents and workflows | JavaScript/TypeScript, promises, HTTP; implement the same bounded tool task |
| [Letta](https://github.com/letta-ai/letta) | Stateful agents and memory | Persistence, retrieval and privacy; test erroneous memory writes and deletion |
| [Google ADK](https://github.com/google/adk-python) | Agent development, evaluation and deployment | Python and contracts; compare sequential/parallel orchestration with one agent |
| [LlamaIndex](https://github.com/run-llama/llama_index) | Data ingestion/retrieval and workflows | M11; trace document → node → retrieval → cited answer |

Use plain Python first, LangGraph for primary state/recovery depth, then ONE contrasting framework selected for your purpose. Study all names at awareness level; implement two deeply. This is a learning choice, not a universal ranking. LangChain is an integration/agent ecosystem, while LangGraph offers lower-level orchestration; they are related, not interchangeable labels.

Compare the same task across implementations: provider compatibility, tool schema validation, event lifecycle, memory ownership, recovery, concurrency, trace export, evaluation, sandboxing, permission checks and deployment constraints. Pin releases and preserve environment files. A friendly UI or a large integration count does not prove correctness.

MCP provides host/client/server connectivity to tools, resources and prompts. It does not supply the reasoning model or authorize side effects. Plugins package host-specific capabilities; skills provide reusable instructions. A2A addresses interactions between agents. The exact capabilities and authorization still come from the host, credentials and contracts. [MCP introduction](https://modelcontextprotocol.io/docs/getting-started/intro), [A2A specification](https://a2a-protocol.org/latest/).

Historical [AutoGen](https://github.com/microsoft/autogen) is useful for multi-agent research comparison. Its current README points new development toward Microsoft Agent Framework; read maintenance/migration guidance before treating a 2023 paper tutorial as a current stack recommendation.
