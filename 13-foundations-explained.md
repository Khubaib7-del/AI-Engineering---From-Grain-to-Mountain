# Beginner distinctions that make the ecosystem less confusing

This is an orientation, not a substitute for the course exercises. Use M00–M04 and the linked primary resources for practice.

## What a program does

Source code is a text file containing instructions. An interpreter executes those instructions. An editor helps you write the file; a terminal lets you run commands. The working directory determines how relative file paths are resolved. A running program is a process.

Python is a programming language used throughout this curriculum. A library is reusable code you import. A framework also provides structure and control conventions for building an application. An API is a contract for interacting with code or a service; an SDK is a convenient library around that contract. A remote model API is still a network service with timeouts, limits and failures.

## Conditions and loops

```python
minutes = 30
if minutes >= 60:
    print("Long session")
elif minutes >= 20:
    print("Short session")
else:
    print("Review one concept")

for topic in ["variables", "conditions", "loops"]:
    print(topic)

remaining = 3
while remaining > 0:
    remaining -= 1
```

A for loop iterates over items. Python does not need a separate “each loop”: for item in collection performs that job. A while loop repeats while a condition holds. A comprehension constructs a collection from iteration; it is not automatically the clearest form for every task.

## Mutability

```python
a = [1, 2]
b = a
b.append(3)
print(a)  # [1, 2, 3]
```

a and b refer to the same list; no copy was made. Lists/dictionaries/sets are mutable. Strings and tuples are immutable, although a tuple can contain a mutable object. Equality compares values; identity asks whether two names refer to the same object. Learn shallow/deep copying and mutable default arguments through small experiments.

## pip, uv, environments and caches

An isolated environment prevents one project’s installed dependencies from interfering with another’s. Python’s venv creates environments; pip installs packages into an interpreter’s environment. uv can manage Python versions, project environments, dependencies and lockfiles as well as offering pip-compatible commands. Use it because reproducible project management is helpful, not because pip is inherently wrong. [uv documentation](https://docs.astral.sh/uv/).

- .venv: the project environment’s interpreter/packages.
- pyproject.toml: project metadata and dependency/config declarations.
- Lockfile: resolved versions used to reproduce an environment.
- __pycache__: cached Python bytecode created when importing modules; different from your virtual environment and package-manager download cache.
- Package cache: downloaded/build artifacts reused by the package manager.
- .gitignore: tells Git which generated/local files to leave untracked; typically includes the environment and bytecode caches.

A cache is not your source code and does not teach the model anything. Avoid memorizing installation commands without knowing which interpreter and environment they affect. The [official Python tutorial](https://docs.python.org/3/tutorial/) is a later reference; it assumes prior programming knowledge.

## ML versus DL versus GenAI versus agents

Machine learning learns patterns from data under an objective. Deep learning uses layered neural networks. Generative AI produces new outputs such as text/images/audio; it is broader than chatbots. An LLM is a language model with large capacity, not the entire AI ecosystem.

Inference uses a trained model. Training changes its parameters. Fine-tuning continues training for adaptation. RAG supplies external evidence at inference time. An agent combines a model with a control loop and tools; it need not train a new model.

## Embeddings, tokens and vectors

Tokens are the model’s input/output units, often subword pieces. An embedding is a vector learned to represent some properties of text or another modality. Tokens, embedding dimensions and document length are different quantities. More dimensions do not automatically guarantee better retrieval.

A vector index helps find nearby representations. A vector database adds storage/operational capabilities. You preserve original text separately so retrieved vectors can lead back to readable evidence.

## Learning versus familiarity

Knowing a tool’s name is familiarity. Running its quickstart is first exposure. Being able to choose it, measure it, debug it and replace it is working competence. The curriculum checks the latter through projects and unseen changes.

