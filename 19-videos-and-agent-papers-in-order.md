# Videos and agent papers in learning order

Reviewed 2026-10-07. Prefer a main course with exercises, then a companion for a specific missing explanation. “Top teacher” is not a universal quality metric; selections below match different needs. Official course/creator pages and linked recordings were inspected, not every lesson watched or code example run.

## Your saved roadmap, reconciled

| Stage | Main route | Saved/added alternative and use |
|---|---|---|
| Python, M00/M01 | [CS50P](https://cs50.harvard.edu/python/) | [freeCodeCamp Dave Gray course](https://www.freecodecamp.org/news/ultimate-beginners-python-course) for an alternative English explanation; [CodeWithHarry course + problems](https://github.com/CodeWithHarry/The-Ultimate-Python-Course) for Hindi. Do not complete three overlapping beginner courses before writing programs. |
| Tools/CS/SQL, M02–M04 | Missing Semester, CS50x, CS50 SQL | Saved reels omit much of this; keep it. Git, Linux/shell, testing, HTTP, async and databases underpin agent engineering. |
| Maths, M05/M06 | 3Blue1Brown + written exercises; Stat110 | [Khan probability](https://www.khanacademy.org/math/statistics-probability) is a gentler bridge. [3Blue1Brown calculus](https://www.3blue1brown.com/topics/calculus) gives intuition; solve derivative/probability problems independently. Khan page text was not extractable in this check. |
| ML, M07 | ISLP + labs | [Andrew Ng ML specialization](https://www.deeplearning.ai/specializations/machine-learning) is a guided alternative; [CS229](https://cs229.stanford.edu/) is deeper theory after Python, linear algebra, calculus and probability, not a zero-background first course. CampusX/Krish Naik companions already exist in document 14. |
| DL, M08 | fast.ai + PyTorch exercises | [Andrew Ng DL specialization](https://www.deeplearning.ai/specializations/deep-learning) for systematic theory (framework examples can differ); [MIT 6.S191](https://introtodeeplearning.com/) for a current compact survey; [Daniel Bourke PyTorch](https://www.learnpytorch.io/) for tensor-to-deployment implementation. Public book is free; do not assume all videos/hosted courses are free. |
| Backprop → LM, M08/M09 | [Karpathy Zero to Hero](https://karpathy.ai/zero-to-hero.html) | Most useful addition for your goal: micrograd → makemore → MLP → activations/gradients → manual backprop → WaveNet → GPT. Work with [official notebooks](https://github.com/karpathy/nn-zero-to-hero). |
| GenAI/RAG/agents, M10–M12 | Full Stack LLM Bootcamp, RAG from Scratch, HF Agents, LangGraph Academy | [Krish Naik agentic AI long-form course](https://www.youtube.com/watch?v=rV3HJ4LEZ7k) is a targeted implementation companion, not a replacement for models/math/evaluation. Metadata/title checked; exact chapters and APIs need checking while studying. |
| Production, M16/M17 | MLOps Zoomcamp and serving docs | Krish Naik projects from document 14 help with integration. Add cost/load/failure tests instead of merely reproducing the demo. |
| LLM research, M13/M14 | CS336 after model-building prerequisites | Revisit Karpathy GPT implementation, then implement and compare one modern block. Do not attempt frontier-scale pretraining on a personal laptop. |

Andrew Ng course audit/assignment/certificate access can vary by platform/account; free study does not imply all graded labs are free. The selection is based on fit and exercises, not claimed universal superiority or the newest upload date.

## Karpathy: what to actually produce

1. **micrograd:** a scalar autodiff engine; compare analytic and finite-difference gradients, explain the chain rule. Python + elementary calculus first.
2. **makemore:** bigram baseline, tensor indexing, train/dev/test split, negative log-likelihood, sampling. Explain shapes and compare with a simple frequency baseline.
3. **MLP + activations:** embedding lookup, optimization, initialization and gradient distributions. Diagnose one intentionally broken training run.
4. **Backprop Ninja:** derive and manually implement gradients, compare with autograd and document discrepancies.
5. **WaveNet/GPT:** causal dependency, attention masks, residual connections and autoregressive sampling. Rebuild a small decoder and log validation loss/compute.

Watch a section, code along, then rebuild it without the video and change one requirement. A toy reproduction teaches mechanics; it does not prove you reproduced frontier training.

## Five agent papers: order, prerequisites and exercises

ReAct and Toolformer already existed as P13/P14; three papers are newly added as P25–P27. “Papers I read” is preserved as the reel title, not recorded as your personal completion.

| Paper | Read after | Contribution and your experiment |
|---|---|---|
| [ReAct — Yao et al., 2022 preprint / 2023 publication](https://arxiv.org/abs/2210.03629) | M10 and agent-loop basics in M12 | Interleave reasoning-oriented planning and actions/observations. Compare a bounded tool agent with direct answering on fixed lookup tasks; measure correctness and tool errors. |
| [Toolformer — Schick et al., 2023](https://arxiv.org/abs/2302.04761) | M09/M12; M13 for training reproduction | Learn API use through self-supervised training. Implement candidate tool-call annotation/filtering at toy scale; ordinary API orchestration is not a Toolformer reproduction. |
| [Reflexion — Shinn et al., 2023](https://arxiv.org/abs/2303.11366) | M12 and evaluation basics | Use feedback/reflection memory between attempts. Compare retries with/without reflection at equal call budget; verbal reinforcement is not automatically gradient-based RL. |
| [Generative Agents — Park et al., 2023](https://arxiv.org/abs/2304.03442) | M11/M12 | Memory, reflection and planning for simulated behavior. Build a three-character simulation and ablate memory retrieval; social plausibility is not business-task success. |
| [AutoGen — Wu et al., 2023](https://arxiv.org/abs/2308.08155) | M12/X03 | Multi-agent conversation as an application pattern. Compare two-agent collaboration with one agent, bounded cost and identical tasks. Historical paper remains useful; [current AutoGen maintenance guidance](https://github.com/microsoft/autogen) directs new projects to Microsoft Agent Framework. |

For every paper: identify question, method, assumptions, datasets, metric, baseline, ablation, limitations and compute. Read method/experiments in full when studying; the research pass verified titles/abstracts, not full experimental validity. Write one page in your learning log and reproduce one controlled result at your scale.

The [CAG paper](https://arxiv.org/abs/2412.15605) is an optional M11/X07 comparison. Read its experimental conditions before accepting its provocative title as universal advice. MAG means Memory Augmented Generation here, as you clarified; compare concrete memory designs using [the memory drill-down](21-retrieval-vector-databases-and-memory.md). The term alone does not select one canonical paper or architecture.
