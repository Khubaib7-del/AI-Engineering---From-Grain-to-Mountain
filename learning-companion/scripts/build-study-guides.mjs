import fs from 'node:fs';
const read=n=>JSON.parse(fs.readFileSync(`../data/${n}.json`,'utf8'));
const save=(n,v)=>fs.writeFileSync(`../data/${n}.json`,JSON.stringify(v,null,2)+'\n');
const courses=read('courses'),books=read('books'),videos=read('video-companions');
const extras=[
 {id:'V28',title:'CampusX · Generative AI using LangChain',url:'https://www.youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0',modules:'M10/M11/M12',notes:'Optional Hinglish companion: models, prompts, structured output, chains, retrieval and tools. Free videos; paid notes are not required. Older examples need current API checks.',language:'Hindi / Hinglish',verification:'Series introduction verified on creator video _3ezSpJw2E8; playlist identity cross-checked; not every recording watched.'},
 {id:'V29',title:'MIT OCW · 18.06 Linear Algebra',url:'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/video-lectures/',modules:'M05',notes:'Optional rigorous follow-up after visual intuition: lectures, problem sets and solutions. Foundational mathematics remains useful despite the recording date.',language:'English',verification:'Official MIT course page and video-lecture section checked 2026-10-08.'},
 {id:'V30',title:'Hugging Face · Audio Course',url:'https://huggingface.co/learn/audio-course/en/chapter0/introduction',modules:'M15',notes:'Optional audio specialization after Python, PyTorch and transformers. Free course material; model training may need compute.',language:'English',verification:'Official introduction and prerequisites checked 2026-10-08.'}
];
for(const x of extras) if(!videos.some(v=>v.id===x.id)) videos.push({...x,type:'video'});
save('video-companions',videos);
const resources=read('resources');
const all=[...courses,...books,...videos,...resources];
const link=id=>{const r=all.find(x=>x.id===id);if(!r)throw Error(id);return {title:r.title,url:r.url};};
const specs=[
 ['M00','C01','B01',['V10'],'Week 0: run one program, use print and input, distinguish a file from its output.','Create hello.py, run it, change one line and explain the result.'],
 ['M01','C01','B01',['V11'],'CS50P weeks 0–9 in order: functions, conditionals, loops, exceptions, libraries, tests, files, regex, classes. Complete exercises between lectures.','Write a small command-line tool with functions, validation, files and tests.'],
 ['M02','C02','B01',[],'Shell basics → files/pipes → Git → debugging → environments. Use current uv documentation alongside the packaging section.','Create a repository and reproducible Python environment; explain how to recreate it.'],
 ['M03','C03','B01',[],'Algorithms → memory → data structures → Python/SQL/web. Work through exercises; add HTTP/API practice after the CS foundations.','Explain a data structure and build a tested API endpoint.'],
 ['M04','C04','B02',[],'SQL querying and joins first; then Python for Data Analysis chapters on NumPy, pandas, cleaning, grouping and time series.','Clean one dataset, join two tables and explain missing-value decisions.'],
 ['M05','C05','B03',['V16'],'Vectors and linear transformations → matrix operations → eigenvectors; then derivatives, gradients and the chain rule. MIT 18.06 supplies deeper exercises.','Derive and implement a small gradient-descent example.'],
 ['M06','C06','B04',['V17'],'Start with counting, conditional probability and Bayes; then random variables, expectations, estimation and experiments. Use Khan Academy if the prerequisite math feels unfamiliar.','Simulate a probability result and explain a confidence interval.'],
 ['M07','C07','B05',['V01','V05','V15','R01'],'Follow the Stanford chapter lecture playlist, read the matching ISLP chapter, then run the separate Python lab video for that chapter.','Compare a baseline and two models without train/test leakage.'],
 ['M08','C08','B06',['V12','V08','V14','V02','R02'],'Train a small model → tensors and autodiff → training loops → regularization → CNNs/sequence models. Reimplement a tiny network after the guided lesson.','Write a PyTorch train/validation loop and diagnose overfitting.'],
 ['M09','C09','B08',[],'Transformer concepts → tokenizers/datasets → inference → fine-tuning and evaluation. Build a tiny attention example before reading architecture papers.','Explain tokenization and attention and evaluate an NLP model.'],
 ['M10','C10','B11',['V28','C20'],'LLM foundations → prompt and structured output → application architecture → evaluation and deployment. Use a small fixed test set before adding tools.','Build a typed LLM workflow with failure handling and cost measurements.'],
 ['M11','C11','B08',['V04','V22'],'Indexing → chunking/embeddings → retrieval → generation → hybrid search/reranking → retrieval and answer evaluation. Start with a tiny local corpus.','Compare retrieval variants using labeled questions and grounded answers.'],
 ['M12','C12','B11',['V03','V23'],'Start with agent foundations and the plain tool loop; then compare reflection, tool use, planning, multi-agent patterns and evals. Add context, memory, permission boundaries, human approval and traces to one bounded agent.','Build one bounded tool-using agent, test failures and add a human approval step.'],
 ['M13','C19','B06',['C09'],'Separate weight training from runtime inference: study SFT, preference data, reward models and RL, then compare them with prompting and RAG.','Compare an adapted small model to its base model on a held-out task.'],
 ['M14','C14','B07',['V27'],'Tokenization → model/training implementation → optimizers → systems → scaling and data; use course assignments at a scale your hardware permits.','Train a tiny language model and reproduce one controlled ablation.'],
 ['M15','C15','B06',['V14'],'Choose vision, diffusion OR audio first. Follow one specialization; use the audio course only after transformers. Do not attempt all branches simultaneously.','Evaluate one modality-specific model and document failure cases.'],
 ['M16','C16','B11',['V21','V06'],'Environment → experiment tracking → orchestration → deployment → monitoring → testing/CI. Begin locally before renting cloud resources.','Version data and models and reproduce a training-to-serving pipeline.'],
 ['M17','V21','B09',['V27'],'FSDL deployment/monitoring plus ML Systems serving chapters; then batching, quantization, caching, load tests and capacity planning.','Serve a small model and measure latency, throughput and resource usage.'],
 ['M18','B11','B09',[],'Study testing, data validation, monitoring and reliability in Made With ML; add privacy, misuse and permission analysis to your own system. This is a reading/practice route, not a complete security certification.','Write a threat model and test access boundaries, data leakage and recovery.'],
 ['M19','DR07','B06',[],'Choose one branch only: time series, recommendation, graphs, causal/Bayesian ML, vision/audio, robotics/edge, AI applications, ML systems or research. Follow one course in the selected branch instead of sampling every playlist.','Complete one small project in your branch and explain its baseline, metric, failures and deployment constraints.'],
 ['M20','V21','B11',[],'Select a real user problem → reproducible baseline → evaluations → deployment → feedback → technical report. Revisit only the lessons needed by your project.','Publish a reproducible project with measured results, limitations and a demo.']
];
const practice={
 M00:['CS50P Problem Set 0 — a small first program','https://cs50.harvard.edu/python/psets/0/'],
 M01:['CS50P problem sets — practice the matching week','https://cs50.harvard.edu/python/psets/'],
 M02:['MIT Missing Semester — current lessons and exercises','https://missing.csail.mit.edu/2026/'],
 M03:['CS50x problem sets','https://cs50.harvard.edu/x/psets/'],
 M04:['CS50 SQL problem sets','https://cs50.harvard.edu/sql/psets/'],
 M05:['MIT OCW 18.06 lecture series','https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/video-lectures/'],
 M06:['StatQuest — statistics fundamentals playlist','https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9'],
 M07:['Stanford ISLP Python lab videos','https://www.youtube.com/playlist?list=PLoROMvodv4rNHU1-iPeDRH-J0cL-CrIda'],
 M08:['PyTorch beginner tutorials — build the training loop','https://pytorch.org/tutorials/beginner/basics/intro.html'],
 M09:['Stanford CS224N public lecture playlist','https://www.youtube.com/playlist?list=PLoROMvodv4rOaMFbaqxPDoLWjDaRAdP9D'],
 M10:['Full Stack LLM Bootcamp — launch a small LLM app','https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/launch-an-llm-app-in-one-hour/'],
 M11:['Qdrant Essentials — vector search exercises','https://qdrant.tech/course/essentials/'],
 M12:['DeepLearning.AI — Agentic AI course','https://www.deeplearning.ai/courses/agentic-ai'],
 M13:['DeepLearning.AI — where post-training fits in LLM training','https://learn.deeplearning.ai/courses/fine-tuning-and-reinforcement-learning-for-llms-intro-to-post-training/lesson/fwxgd0/where-post-training-%28fine-tuning-and-rl%29-fits-into-llm-training'],
 M14:['Stanford CS336 Assignment 1 — basics','https://github.com/stanford-cs336/assignment1-basics/tree/main'],
 M15:['Hugging Face Audio Course','https://huggingface.co/learn/audio-course/en/chapter0/introduction'],
 M16:['DataTalksClub MLOps Zoomcamp — official lecture playlist','https://www.youtube.com/playlist?list=PL3MmuxUbc_hIUISrluw_A7wDSmfOhErJK'],
 M17:['vLLM quickstart — run a model server','https://docs.vllm.ai/en/latest/getting_started/quickstart.html'],
 M18:['OpenAI — safety best practices for applications','https://platform.openai.com/docs/guides/safety-best-practices'],
 M19:['Choose one specialty using the AI engineer roadmap','https://roadmap.sh/ai-engineer'],
 M20:['Open-SWE — inspect a real agent project structure','https://github.com/langchain-ai/open-swe']
};
const guides=specs.map(([moduleId,primary,reading,optional,assignment,finish])=>({moduleId,primary:link(primary),reading:link(reading),practice:{title:practice[moduleId][0],url:practice[moduleId][1]},optional:optional.map(link),assignment,finish,access:'Learning material is free where noted. Some platforms require an account; graded DeepLearning.AI assignments/certificates may require PRO. API calls, GPUs and hosting may cost money.',checked:'2026-10-17'}));
const guideById=Object.fromEntries(guides.map(g=>[g.moduleId,g]));
guideById.M00.primary={title:'Harvard CS50P — Week 0: Functions and Variables',url:'https://cs50.harvard.edu/python/weeks/0/'};
guideById.M01.primary={title:'Harvard CS50P — full Python course, weeks 0–9',url:'https://cs50.harvard.edu/python/weeks/'};
guideById.M01.reading={title:'The Python Tutorial — official language guide',url:'https://docs.python.org/3/tutorial/'};
guideById.M02.reading={title:'uv documentation — Python and project environments',url:'https://docs.astral.sh/uv/'};
guideById.M03.reading={title:'CS50x Week 3 — algorithms and data structures',url:'https://cs50.harvard.edu/x/weeks/3/'};
guideById.M11.reading={title:'LlamaIndex — understanding RAG',url:'https://developers.llamaindex.ai/python/framework/understanding/rag/'};
guideById.M12.reading={title:'Hugging Face Agents Course — when to use LangGraph',url:'https://huggingface.co/learn/agents-course/unit2/langgraph/when_to_use_langgraph'};
guideById.M13.reading={title:'Hugging Face TRL — post-training library guide',url:'https://huggingface.co/docs/trl/en/index'};
guideById.M15.reading={title:'Dive into Deep Learning — computer vision chapters',url:'https://d2l.ai/chapter_computer-vision/index.html'};
guideById.M16.reading={title:'MLflow Tracking — official documentation',url:'https://mlflow.org/docs/latest/ml/tracking/'};
guideById.M18.reading={title:'NIST AI Risk Management Framework Playbook',url:'https://airc.nist.gov/airmf-resources/playbook/'};
guideById.M18.primary={title:'OpenAI — safety best practices for applications',url:'https://platform.openai.com/docs/guides/safety-best-practices'};
guideById.M18.practice={title:'NVIDIA NeMo Guardrails — inspect a guardrail implementation',url:'https://github.com/NVIDIA/NeMo-Guardrails'};
guideById.M19.primary={title:'Hugging Face Learn — choose one specialist course',url:'https://huggingface.co/learn'};
guideById.M19.reading={title:'DeepLearning.AI course catalog — compare one role-specific course',url:'https://www.deeplearning.ai/courses'};
guideById.M20.reading={title:'Full Stack LLM Bootcamp — what to build next',url:'https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/whats-next/'};
guideById.M20.primary={title:'LangGraph 101 — portfolio capstone starting point',url:'https://github.com/langchain-ai/langgraph-101'};
guideById.M20.assignment='Choose one real user workflow, define a measurable baseline, then build a reliable agent or ML system around it. Use LangGraph 101 as one example implementation and adapt the scope to your own specialization.';
save('study-guides',guides);
const plan=read('first-28-days');
for(const l of plan.days){const week=Number(l.resourceUrl.match(/weeks\/(\d+)/)?.[1]??0);l.study={title:`Harvard CS50P · Week ${week}: ${['Functions and variables','Conditionals','Loops','Exceptions'][week]}`,assignment:l.tasks[0].description,readingTitle:`CS50P Week ${week} written notes`,readingUrl:`https://cs50.harvard.edu/python/notes/${week}/`,stopWhen:l.tasks[2].description,smallStep:l.day===1?'Spend 20 minutes on the introduction, then run print("Hello") once. You can continue the rest of this lesson another day.':'Study one relevant example for 20 minutes, change it yourself, and write what you understood. Continue this same lesson next time if needed.',playlistUrl:courses.find(c=>c.id==='C01').video};}
save('first-28-days',plan);
const md=['# Your free learning route — one next step at a time','','Updated 8 October 2026. You do not need to finish every playlist. This guide selects one main resource per module; companions are optional explanations, not extra prerequisites. The app now attaches a named assignment and matching notes to every one of its 28 authored lessons. Days are sequence labels, not deadlines.','','## Start today','','Open [Harvard CS50P Week 0](https://cs50.harvard.edu/python/weeks/0/). Spend about 20 minutes on the introduction and input/output examples. Run `print("Hello")`, change the text, and explain what changed. Read [the matching notes](https://cs50.harvard.edu/python/notes/0/) if a video explanation is unclear. You do not need LangChain, LangGraph, a GPU, or an API account for this task.','','## How to use the route','','1. Follow the current module and its prerequisite order.','2. Open the primary resource and follow the assignment, not the entire catalog.','3. Build the small exercise and explain it in your own words.','4. Use one optional explanation only when stuck.','5. Continue at your pace; discovering another course does not add a new obligation.','','Free means the learning material, not unlimited compute or free certificates. Prefer local examples, small models and supplied exercises. Some courses require a free login; do not buy a certificate, membership or notes bundle to follow this route.','','## Module assignments',''];
const modules=read('curriculum').modules;
for(const g of guides){const m=modules.find(x=>x.id===g.moduleId);md.push(`### ${g.moduleId} — ${m.title}`,'',`Prerequisites: ${m.prerequisites.join(', ')||'None'}.`,`Primary: [${g.primary.title}](${g.primary.url}).`,`Assignment: ${g.assignment}`,`Reading: [${g.reading.title}](${g.reading.url}).`,`Ready to move on: ${g.finish}`,`Optional alternatives: ${g.optional.map(x=>`[${x.title}](${x.url})`).join('; ')||'None assigned. Stay with the primary resource.'}`,'');}
md.push('## What the CampusX playlists mean','','LangChain is an application-library track; LangGraph emphasizes stateful workflows. They are related topics, not two complete AI degrees to start now. Their examples overlap: prompts, models, tools and retrieval. In this route, learn those concepts once, build a small agent, then study workflow state, persistence and approval in LangGraph. Public videos are free; CampusX separately sells notes. Those paid notes are not required. API examples may need adaptation to current versions.','','## Coverage and evidence','','This pass adds explicit assignments to 28 daily lessons and resource routes for all 21 modules. It does not claim a unique video timestamp for each of the 740 concepts, or daily scheduling for the entire multi-year curriculum. Existing course selections remain in document 03; optional independent teachers are in document 23. M19 requires a later branch choice rather than prescribing every specialty at once.','','Checked official Harvard week/notes pages, MIT 18.06, Stanford CS229/CS336, ISLP, Hugging Face introductions, FSDL and Made With ML, plus CampusX creator videos/repositories. Existing resources retain their previous audits. Full recordings and all code exercises have not been reproduced.');
let route=md.join('\n')+'\n';
route=route.replace('Updated 8 October 2026. You do not need to finish every playlist. This guide selects one main resource per module; companions are optional explanations, not extra prerequisites. The app now attaches a named assignment and matching notes to every one of its 28 authored lessons. Days are sequence labels, not deadlines.','Updated 17 October 2026. You do not need to finish every playlist. Each module has a visible order: learn, read, then practice. Companions stay optional. The app attaches one clear assignment and matching notes to each of its 28 starter lessons. Days are sequence labels, not deadlines.');
route=route.replace('1. Follow the current module and its prerequisite order.\n2. Open the primary resource and follow the assignment, not the entire catalog.','1. Follow the recommended prerequisite order when possible.\n2. Open Learn, Read and Practice in that order.\n3. After the 28 starter lessons, choose any module from Path; prerequisites gate its assessment, not study notes.');
route=route.replace('3. After the 28 starter lessons, choose any module from Path; prerequisites gate its assessment, not study notes.\n3. Build the small exercise and explain it in your own words.\n4. Use one optional explanation only when stuck.\n5. Continue at your pace; discovering another course does not add a new obligation.','3. After the 28 starter lessons, choose any module from Path; prerequisites gate its assessment, not study notes.');
for(const g of guides){
 const marker='Ready to move on: '+g.finish;
 route=route.replace(marker,'Practice: ['+g.practice.title+']('+g.practice.url+').\n'+marker);
}
route=route.replace('This pass adds explicit assignments to 28 daily lessons and resource routes for all 21 modules. It does not claim a unique video timestamp for each of the 740 concepts, or daily scheduling for the entire multi-year curriculum. Existing course selections remain in document 03; optional independent teachers are in document 23. M19 requires a later branch choice rather than prescribing every specialty at once.','The core path has 21 modules and 777 checkpoints: the original 740 topic IDs plus 37 appended topics for pretraining/post-training/inference, agent harness engineering and LLM operations. The 28-day starter remains the only daily plan; afterward you can choose any module and save topic notes before its final assessment. ISLP opens directly to Stanford chapter lectures and separate Python lab videos. DeepLearning.AI specializations are optional; graded work/certificates for Agentic AI and Post-training courses require PRO.');
fs.writeFileSync('../24-guided-free-learning-route.md',route);
console.log(`Wrote ${guides.length} module guides and ${plan.days.length} daily assignments; ${videos.length} companions.`);
