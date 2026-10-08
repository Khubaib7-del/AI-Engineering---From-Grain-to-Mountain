# Review of the two repositories and roadmap.sh

Reviewed 2026-10-07. This is a targeted source review, not an execution audit of every lesson.

## Your friend’s AI-ML-Course

[Repository](https://github.com/hassanhashmi16/AI-ML-Course) · [91-module outline](https://github.com/hassanhashmi16/AI-ML-Course/blob/main/AI_Engineer_StepByStep.html) · [Phase 0](https://github.com/hassanhashmi16/AI-ML-Course/tree/main/Phase%200) · [Phase 1](https://github.com/hassanhashmi16/AI-ML-Course/tree/main/Phase%201(AI))

The HTML outline specifies 91 modules: Python/engineering foundations, AI application engineering, ML engineering, then specialization. It deliberately places useful API/RAG products before the deeper ML track. That is a reasonable build-first route, but your stated aim also requires the mathematical and training track; finishing its first app phase does not imply ML or research readiness.

I read the outline, both visible phase directories, the generators/decorators/context-managers lesson, and the chunking and retrieval-quality lessons. The public directory includes growing notes and deliverables through the RAG/API/UI work, whereas the outline extends much further. Planned modules must be distinguished from completed teaching material. I did not certify all 91 modules as present or runnable.

The strengths are engineering basics, named deliverables, explicit retrieval quality, and practical evaluation. The visible Project 2 commit even reports that dense retrieval matched the more complex hybrid/rerank pipeline on its small corpus. That is exactly the engineering habit to retain: let measurements decide whether complexity helps. The source’s numerical results are author-reported, not independently reproduced here.

There are qualifications worth teaching explicitly:

- An embedding limit does not mean every service silently truncates overlong inputs. Depending on the API/client/model it may reject, truncate, or otherwise handle the request. Inspect the current contract and test it.
- Larger chunks do not universally produce better recall. Evaluate size, overlap, corpus and query interactions.
- A production pipeline has no universal required “rewrite → hybrid → rerank → top five” shape. Keep a simple baseline and add steps only when evaluation justifies their cost.
- Claims in the outline about industry percentages, universal hiring requirements or what is “the standard” were not used as verified demand evidence.
- Advanced Python protocols need precise definitions: an iterable implements iteration; an iterator also supplies next-item behavior. Teach that distinction rather than memorize a shorthand.

**How to use it:** as a practical companion after CS50P, especially Python tooling and the RAG projects. Follow one deliverable at a time and keep your own explanations. Treat SDK constants, model names and framework APIs as dated examples.

## Rohit’s AI Engineering from Scratch

[Repository](https://github.com/rohitg00/ai-engineering-from-scratch) · [curriculum phases](https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases) · [math sample](https://github.com/rohitg00/ai-engineering-from-scratch/blob/main/phases/01-math-foundations/01-linear-algebra-intuition/docs/en.md)

The README advertises 523 lessons, 20 phases and approximately 342 hours, spanning mathematics, ML, DL, modalities, LLMs, protocols, agents and production. Those counts and hours are repository claims, not an independent mastery estimate. It also offers free release books generated from the same lesson content.

Its explicit prerequisite is existing programming ability. The setup sample asks for several toolchains and GPU verification, which is more than an absolute beginner needs. The math sample moves quickly through several university-level concepts. Its lesson duration therefore should not be interpreted as the time a new programmer needs to acquire those skills.

The build-from-scratch/compare-with-library approach and consistent lesson artifacts are valuable. I inspected the README plus setup and first linear-algebra lesson; I did not run or grade 523 lessons. The sampled prose simplifies embeddings and similarity: a dot product includes vector magnitude, and semantic meaning depends on training and the selected metric. Add normalization and empirical retrieval tests when studying it.

**How to use it:** after the Python bridge, select lessons matching the current module. Keep Python as your main language initially. Learn TypeScript for interfaces, and CUDA/Triton or another systems language only when a specialization requires them. No tutor skills were installed.

## roadmap.sh

[AI engineer](https://roadmap.sh/ai-engineer) · [AI and data scientist](https://roadmap.sh/ai-data-scientist) · [Python](https://roadmap.sh/python)

The AI engineer map emphasizes pretrained-model applications, model APIs, embeddings, RAG, agents, evaluation and observability. The data-scientist map complements it with mathematics and modeling. These maps are useful coverage checks, but the maps alone do not supply a zero-prerequisite teaching sequence, exercise feedback or proof of competence.

Use them after each stage to identify gaps. This curriculum supplies the order, teaching resources and evidence checkpoints that a broad diagram cannot supply.

## Decision

Use CS50P as the beginner teaching spine, your friend’s repository as a project companion, Rohit’s repository as a broad implementation reference, and roadmap.sh as a coverage map. Beyond foundations, official course assignments and current library documentation remain the execution authority. Do not combine all four into four simultaneous complete courses.

