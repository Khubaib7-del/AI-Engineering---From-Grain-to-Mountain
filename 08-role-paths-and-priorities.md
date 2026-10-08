# Role paths, priorities and AI-lab readiness

Prepared 2026-10-07. This is a skills plan, not a guarantee of employment or effortless transfer between roles. Role titles vary by company.

## Shared foundation and distinct depth

| Role | Primary responsibility | Depth after shared foundations | Best evidence |
|---|---|---|---|
| AI / GenAI application engineer | Turn models into reliable user-facing systems | M10–M12, M16–M18; backend, evaluation, retrieval, tools and product judgment | Evaluated real-user product with cost/latency and failure analysis |
| ML engineer | Build and operate learned models | M04–M09, M13, M16–M18; data, training, optimization and serving | Leakage-safe training pipeline and monitored deployment |
| Research engineer | Implement, test and accelerate research ideas | M05–M09, M13–M14, M17; strong coding, math, experiments and systems | Paper reproduction, ablations and a useful implementation contribution |
| Inference / ML systems engineer | Make training/inference efficient and reliable | M03, M08, M14, M17; hardware, distributed systems, profiling, CUDA/Triton | Controlled benchmark with a measured optimization |
| MLOps / ML platform engineer | Make delivery and lifecycle reproducible | M03–M04, M16–M18; orchestration, CI/CD, lineage, monitoring and recovery | Reproducible rollout/rollback and observable pipelines |
| Data scientist / experimentation engineer | Infer from data and evaluate changes | M04–M07, M06 in depth; experiments, uncertainty and causal reasoning | Sound analysis and experiment design with limitations |
| Forward-deployed engineer (secondary interest) | Solve a customer’s workflow in their environment | Application stack plus discovery, integration, deployment and communication | A scoped customer problem solved with documented adoption evidence |

An AI engineer does not have to master every named framework. An ML engineer needs more than calling model APIs. A research engineer is not the same as a research scientist; original scientific research can require additional deep specialization.

## What current employer evidence supports

The official [OpenAI Research Engineer role](https://openai.com/careers/research-engineer-san-francisco/) emphasizes strong programming and experience with distributed systems, with high-performance DL implementation relevant to the work. The official [Model Inference role](https://openai.com/careers/software-engineer-model-inference-san-francisco/) emphasizes latency, throughput, efficiency, GPU utilization and production distributed systems. The latter listing also asks for at least five years of professional software engineering experience.

These two inspected roles are examples of technical expectations, not a statistical survey of all hiring demand. They support prioritizing engineering and measurable implementation depth; they do not establish that a particular agent framework guarantees hiring. Requirements and openings can change.

## Recommended priority for you

Start with the shared foundation. Make applied AI engineering your first portfolio route because it lets you build useful things and receive feedback. Keep the full math/ML/DL route; after M08/M09 choose either model/research depth or inference/systems depth as the main specialty. Take the other to awareness level and expand later. FDE can remain a communication/integration branch.

Do not remove classical ML, SQL, testing or statistics because agent products are popular. Those skills make your comparisons meaningful and your deployments reliable.

## Competency ladder

1. **Programming-ready:** build and debug the CLI without a generated solution.
2. **ML-ready:** design a leakage-safe split, choose metrics and train a baseline.
3. **AI-product-ready:** ship an evaluated service with appropriate permissions and failure handling.
4. **Model-ready:** adapt or train a small model and explain the loss, data and evaluation.
5. **Systems-ready:** profile a bottleneck, improve it and benchmark fairly.
6. **Research-ready for deeper study:** reproduce a reduced-scale result, run ablations and communicate uncertainty.
7. **Lab-candidate evidence:** sustained substantial work, strong references/feedback, technical depth and contributions relevant to a specific role.

These are checkpoints, not credentials. “Top-level” should mean independently solving hard problems with evidence, not completing a long list of video titles.

## Interview and contribution preparation

During the second half: solve Python/SQL exercises, discuss a paper, debug a broken training run, design an ML service and explain a model’s cost/memory. For systems roles, deepen distributed-systems and GPU programming. For research roles, deepen mathematical reasoning and experimental design.

Choose an open-source issue after understanding the project. Start with a reproducible bug, benchmark correction, documented edge case or useful implementation. A small reviewed contribution is stronger evidence than an untested large generated repository.

