# Your free learning route — one next step at a time

Updated 8 October 2026. You do not need to finish every playlist. This guide selects one main resource per module; companions are optional explanations, not extra prerequisites. The app now attaches a named assignment and matching notes to every one of its 28 authored lessons. Days are sequence labels, not deadlines.

## Start today

Open [Harvard CS50P Week 0](https://cs50.harvard.edu/python/weeks/0/). Spend about 20 minutes on the introduction and input/output examples. Run `print("Hello")`, change the text, and explain what changed. Read [the matching notes](https://cs50.harvard.edu/python/notes/0/) if a video explanation is unclear. You do not need LangChain, LangGraph, a GPU, or an API account for this task.

## How to use the route

1. Follow the current module and its prerequisite order.
2. Open the primary resource and follow the assignment, not the entire catalog.
3. Build the small exercise and explain it in your own words.
4. Use one optional explanation only when stuck.
5. Continue at your pace; discovering another course does not add a new obligation.

Free means the learning material, not unlimited compute or free certificates. Prefer local examples, small models and supplied exercises. Some courses require a free login; do not buy a certificate, membership or notes bundle to follow this route.

## Module assignments

### M00 — Computer and learning foundations

Prerequisites: None.
Primary: [CS50’s Introduction to Programming with Python](https://cs50.harvard.edu/python/).
Assignment: Week 0: run one program, use print and input, distinguish a file from its output.
Reading: [Think Python, third edition](https://allendowney.github.io/ThinkPython/).
Ready to move on: Create hello.py, run it, change one line and explain the result.
Optional alternatives: [freeCodeCamp / Dave Gray · Python for Beginners](https://www.youtube.com/watch?v=qwAFL1597eM); [CodeWithHarry · The Ultimate Python Course](https://www.youtube.com/watch?v=UrsmFxEIp5k)

### M01 — Python from zero

Prerequisites: M00.
Primary: [CS50’s Introduction to Programming with Python](https://cs50.harvard.edu/python/).
Assignment: CS50P weeks 0–9 in order: functions, conditionals, loops, exceptions, libraries, tests, files, regex, classes. Complete exercises between lectures.
Reading: [Think Python, third edition](https://allendowney.github.io/ThinkPython/).
Ready to move on: Write a small command-line tool with functions, validation, files and tests.
Optional alternatives: [CodeWithHarry · The Ultimate Python Course](https://www.youtube.com/watch?v=UrsmFxEIp5k)

### M02 — Engineering tools and environments

Prerequisites: M01.
Primary: [MIT Missing Semester 2026](https://missing.csail.mit.edu/).
Assignment: Shell basics → files/pipes → Git → debugging → environments. Use current uv documentation alongside the packaging section.
Reading: [Think Python, third edition](https://allendowney.github.io/ThinkPython/).
Ready to move on: Create a repository and reproducible Python environment; explain how to recreate it.
Optional alternatives: None assigned. Stay with the primary resource.

### M03 — CS, algorithms and backend foundations

Prerequisites: M02.
Primary: [CS50x](https://cs50.harvard.edu/x/).
Assignment: Algorithms → memory → data structures → Python/SQL/web. Work through exercises; add HTTP/API practice after the CS foundations.
Reading: [Think Python, third edition](https://allendowney.github.io/ThinkPython/).
Ready to move on: Explain a data structure and build a tested API endpoint.
Optional alternatives: None assigned. Stay with the primary resource.

### M04 — Data analysis and SQL

Prerequisites: M02.
Primary: [CS50 SQL](https://cs50.harvard.edu/sql/).
Assignment: SQL querying and joins first; then Python for Data Analysis chapters on NumPy, pandas, cleaning, grouping and time series.
Reading: [Python for Data Analysis, third edition](https://wesmckinney.com/book/).
Ready to move on: Clean one dataset, join two tables and explain missing-value decisions.
Optional alternatives: None assigned. Stay with the primary resource.

### M05 — Linear algebra and calculus

Prerequisites: M00, M01.
Primary: [3Blue1Brown Essence of Linear Algebra](https://www.3blue1brown.com/topics/linear-algebra).
Assignment: Vectors and linear transformations → matrix operations → eigenvectors; then derivatives, gradients and the chain rule. MIT 18.06 supplies deeper exercises.
Reading: [Mathematics for Machine Learning](https://mml-book.github.io/).
Ready to move on: Derive and implement a small gradient-descent example.
Optional alternatives: [3Blue1Brown · Calculus intuition](https://www.3blue1brown.com/topics/calculus); [MIT OCW · 18.06 Linear Algebra](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/video-lectures/)

### M06 — Probability, statistics and experiments

Prerequisites: M05.
Primary: [Harvard Stat 110](https://projects.iq.harvard.edu/stat110/home).
Assignment: Start with counting, conditional probability and Bayes; then random variables, expectations, estimation and experiments. Use Khan Academy if the prerequisite math feels unfamiliar.
Reading: [Introduction to Probability, second edition](https://projects.iq.harvard.edu/stat110/home).
Ready to move on: Simulate a probability result and explain a confidence interval.
Optional alternatives: [Khan Academy · Statistics and probability bridge](https://www.khanacademy.org/math/statistics-probability); [StatQuest · Statistics Fundamentals](https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9)

### M07 — Classical machine learning

Prerequisites: M04, M05, M06.
Primary: [Statistical Learning with Python (ISLP)](https://www.statlearning.com/online-courses).
Assignment: Introduction → regression → classification → resampling → regularization → trees → unsupervised learning; reproduce Python labs.
Reading: [Introduction to Statistical Learning with Python](https://www.statlearning.com/).
Ready to move on: Compare a baseline and two models without train/test leakage.
Optional alternatives: [CampusX · 100 Days of Machine Learning](https://www.youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH); [Krish Naik · Complete Machine Learning](https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe); [Stanford CS229 · Machine Learning lectures and notes](https://cs229.stanford.edu/)

### M08 — Deep learning and PyTorch

Prerequisites: M07.
Primary: [fast.ai Practical Deep Learning for Coders, part 1](https://course.fast.ai/).
Assignment: Train a small model → tensors and autodiff → training loops → regularization → CNNs/sequence models. Reimplement a tiny network after the guided lesson.
Reading: [Dive into Deep Learning](https://d2l.ai/).
Ready to move on: Write a PyTorch train/validation loop and diagnose overfitting.
Optional alternatives: [Daniel Bourke · Learn PyTorch for Deep Learning](https://www.youtube.com/watch?v=Z_ikDlimN6A); [Andrej Karpathy · Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ); [MIT 6.S191 · Introduction to Deep Learning](https://introtodeeplearning.com/); [CampusX · 100 Days of Deep Learning](https://www.youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn)

### M09 — NLP, transformers and language models

Prerequisites: M08.
Primary: [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter1/1).
Assignment: Transformer concepts → tokenizers/datasets → inference → fine-tuning and evaluation. Build a tiny attention example before reading architecture papers.
Reading: [Speech and Language Processing, third-edition draft](https://web.stanford.edu/~jurafsky/slp3/).
Ready to move on: Explain tokenization and attention and evaluate an NLP model.
Optional alternatives: [Andrej Karpathy · Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ); [Stanford CS224N · Public 2024 lectures](https://www.youtube.com/playlist?list=PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D)

### M10 — LLM applications and evaluation

Prerequisites: M03, M09.
Primary: [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/).
Assignment: LLM foundations → prompt and structured output → application architecture → evaluation and deployment. Use a small fixed test set before adding tools.
Reading: [Made With ML online reference](https://madewithml.com/).
Ready to move on: Build a typed LLM workflow with failure handling and cost measurements.
Optional alternatives: [CampusX · Generative AI using LangChain](https://www.youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0)

### M11 — Search, embeddings and RAG

Prerequisites: M04, M10.
Primary: [LangChain RAG from Scratch](https://github.com/langchain-ai/rag-from-scratch).
Assignment: Indexing → chunking/embeddings → retrieval → generation → hybrid search/reranking → retrieval and answer evaluation. Start with a tiny local corpus.
Reading: [Speech and Language Processing, third-edition draft](https://web.stanford.edu/~jurafsky/slp3/).
Ready to move on: Compare retrieval variants using labeled questions and grounded answers.
Optional alternatives: [CampusX · RAG](https://www.youtube.com/playlist?list=PLKnIA16_Rmva0dRLWEHLznSHKbFD_RJfX); [DataTalksClub · LLM Zoomcamp](https://www.youtube.com/playlist?list=PL3MmuxUbc_hLZFNgSad56pDBKK8KO0XIv); [Qdrant Essentials](https://qdrant.tech/course/essentials/)

### M12 — Agents, tools and protocols

Prerequisites: M10, M11.
Primary: [Hugging Face Agents Course](https://huggingface.co/learn/agents-course/en/unit0/introduction).
Assignment: Hugging Face units 0–1 first; build one tool loop. Then select ONE unit-2 framework, practice memory and approvals, and do the course evaluation. LangChain basics precede the optional LangGraph series.
Reading: [Made With ML online reference](https://madewithml.com/).
Ready to move on: Build one bounded tool-using agent, test failures and add a human approval step.
Optional alternatives: [CampusX · Generative AI using LangChain](https://www.youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0); [CampusX · Agentic AI using LangGraph](https://www.youtube.com/playlist?list=PLKnIA16_RmvYsvB8qkUQuJmJNuiCUJFPL); [Berkeley LLM Agents · History and Overview, Shunyu Yao](https://www.youtube.com/watch?v=RM6ZArd2nVc)

### M13 — Adaptation, post-training and RL

Prerequisites: M09, M06.
Primary: [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter1/1).
Assignment: Fine-tuning foundations → dataset quality → PEFT/LoRA → preference optimization; study RL fundamentals before advanced post-training papers.
Reading: [Dive into Deep Learning](https://d2l.ai/).
Ready to move on: Compare an adapted small model to its base model on a held-out task.
Optional alternatives: None assigned. Stay with the primary resource.

### M14 — LLMs from scratch and research methods

Prerequisites: M13, M08.
Primary: [Stanford CS336 Language Modeling from Scratch, 2026](https://cs336.stanford.edu/).
Assignment: Tokenization → model/training implementation → optimizers → systems → scaling and data; use course assignments at a scale your hardware permits.
Reading: [Deep Learning](https://www.deeplearningbook.org/).
Ready to move on: Train a tiny language model and reproduce one controlled ablation.
Optional alternatives: [Andrej Karpathy · Neural Networks: Zero to Hero](https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ); [Deep Learning Systems · CMU course](https://dlsyscourse.org/)

### M15 — Vision, audio and multimodal branch

Prerequisites: M08, M09.
Primary: [fast.ai Deep Learning Foundations to Stable Diffusion, part 2](https://course.fast.ai/Lessons/part2.html).
Assignment: Choose vision, diffusion OR audio first. Follow one specialization; use the audio course only after transformers. Do not attempt all branches simultaneously.
Reading: [Dive into Deep Learning](https://d2l.ai/).
Ready to move on: Evaluate one modality-specific model and document failure cases.
Optional alternatives: [MIT 6.S191 · Introduction to Deep Learning](https://introtodeeplearning.com/); [Hugging Face · Audio Course](https://huggingface.co/learn/audio-course/en/chapter0/introduction)

### M16 — MLOps and data pipelines

Prerequisites: M07, M03.
Primary: [DataTalksClub MLOps Zoomcamp](https://github.com/DataTalksClub/mlops-zoomcamp).
Assignment: Environment → experiment tracking → orchestration → deployment → monitoring → testing/CI. Begin locally before renting cloud resources.
Reading: [Made With ML online reference](https://madewithml.com/).
Ready to move on: Version data and models and reproduce a training-to-serving pipeline.
Optional alternatives: [Full Stack Deep Learning · 2022 course](https://fullstackdeeplearning.com/course/2022/); [Krish Naik · End-to-End Data Science Projects](https://www.youtube.com/playlist?list=PLZoTAELRMXVPS-dOaVbAux22vzqdgoGhG)

### M17 — Serving, cloud and ML systems

Prerequisites: M08, M16.
Primary: [Full Stack Deep Learning · 2022 course](https://fullstackdeeplearning.com/course/2022/).
Assignment: FSDL deployment/monitoring plus ML Systems serving chapters; then batching, quantization, caching, load tests and capacity planning.
Reading: [Machine Learning Systems, two volumes](https://mlsysbook.ai/).
Ready to move on: Serve a small model and measure latency, throughput and resource usage.
Optional alternatives: [Deep Learning Systems · CMU course](https://dlsyscourse.org/)

### M18 — Safety, privacy and responsible engineering

Prerequisites: M10.
Primary: [Made With ML online reference](https://madewithml.com/).
Assignment: Study testing, data validation, monitoring and reliability in Made With ML; add privacy, misuse and permission analysis to your own system. This is a reading/practice route, not a complete security certification.
Reading: [Machine Learning Systems, two volumes](https://mlsysbook.ai/).
Ready to move on: Write a threat model and test access boundaries, data leakage and recovery.
Optional alternatives: None assigned. Stay with the primary resource.

### M19 — Additional AI domains and role branches

Prerequisites: M07.
Primary: [Statistical Learning with Python (ISLP)](https://www.statlearning.com/online-courses).
Assignment: Choose ONE branch after core ML: time series, recommendation, graphs, causal inference or RL. Use the branch map in document 22 to choose its specialist resources.
Reading: [Dive into Deep Learning](https://d2l.ai/).
Ready to move on: Compare a simple baseline to a specialist method on one domain dataset.
Optional alternatives: None assigned. Stay with the primary resource.

### M20 — Portfolio, specialization and final-year project

Prerequisites: M11, M12, M16, M18.
Primary: [Full Stack Deep Learning · 2022 course](https://fullstackdeeplearning.com/course/2022/).
Assignment: Select a real user problem → reproducible baseline → evaluations → deployment → feedback → technical report. Revisit only the lessons needed by your project.
Reading: [Made With ML online reference](https://madewithml.com/).
Ready to move on: Publish a reproducible project with measured results, limitations and a demo.
Optional alternatives: None assigned. Stay with the primary resource.

## What the CampusX playlists mean

LangChain is an application-library track; LangGraph emphasizes stateful workflows. They are related topics, not two complete AI degrees to start now. Their examples overlap: prompts, models, tools and retrieval. In this route, learn those concepts once, build a small agent, then study workflow state, persistence and approval in LangGraph. Public videos are free; CampusX separately sells notes. Those paid notes are not required. API examples may need adaptation to current versions.

## Coverage and evidence

This pass adds explicit assignments to 28 daily lessons and resource routes for all 21 modules. It does not claim a unique video timestamp for each of the 740 concepts, or daily scheduling for the entire multi-year curriculum. Existing course selections remain in document 03; optional independent teachers are in document 23. M19 requires a later branch choice rather than prescribing every specialty at once.

Checked official Harvard week/notes pages, MIT 18.06, Stanford CS229/CS336, ISLP, Hugging Face introductions, FSDL and Made With ML, plus CampusX creator videos/repositories. Existing resources retain their previous audits. Full recordings and all code exercises have not been reproduced.
