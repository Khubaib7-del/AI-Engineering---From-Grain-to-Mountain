// Idempotent content integration. Existing curriculum/topic IDs are not changed.
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = n => JSON.parse(fs.readFileSync(path.join(root,'data',`${n}.json`),'utf8'));
const write = (n,v) => fs.writeFileSync(path.join(root,'data',`${n}.json`),JSON.stringify(v,null,2)+'\n');
const add = (list,item) => { const i=list.findIndex(x=>x.id===item.id); if(i<0)list.push(item);else list[i]=item; };
const videos=read('video-companions');
const additions=[
 ['V08','Andrej Karpathy · Neural Networks: Zero to Hero','https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ','M08/M09/M14','English','Python and elementary calculus first. micrograd → makemore → GPT; reproduce code independently.','https://karpathy.ai/zero-to-hero.html'],
 ['V09','Andrej Karpathy · Build GPT from scratch','https://www.youtube.com/watch?v=kCc8FmEb1nY','M09/M14','English','After tensors, backpropagation and language-model basics; implement causal attention and compare validation loss.','https://github.com/karpathy/nn-zero-to-hero'],
 ['V10','freeCodeCamp / Dave Gray · Python for Beginners','https://www.youtube.com/watch?v=qwAFL1597eM','M00/M01','English','Alternative beginner explanation; CS50P remains primary. Use current packaging docs.','https://www.freecodecamp.org/news/ultimate-beginners-python-course'],
 ['V11','CodeWithHarry · The Ultimate Python Course','https://www.youtube.com/watch?v=UrsmFxEIp5k','M00/M01','Hindi','Alternative beginner course with official code/problem sets; do not watch three complete Python courses in parallel.','https://github.com/CodeWithHarry/The-Ultimate-Python-Course'],
 ['V12','Daniel Bourke · Learn PyTorch for Deep Learning','https://www.youtube.com/watch?v=Z_ikDlimN6A','M08','English','Free first five sections; the full free book includes exercises. Check current PyTorch APIs.','https://www.learnpytorch.io/'],
 ['V13','Krish Naik · Complete Agentic AI long-form course','https://www.youtube.com/watch?v=rV3HJ4LEZ7k','M10/M11/M12','English / Hinglish','Targeted integration companion. Metadata/title checked; chapters, notebook execution and API currency not audited end to end.','https://www.youtube.com/watch?v=rV3HJ4LEZ7k'],
 ['V14','MIT 6.S191 · Introduction to Deep Learning','https://introtodeeplearning.com/','M08/M15','English','Official 2026 syllabus links lecture videos and labs; a compact survey alongside exercises, not a zero-Python starting point.','https://introtodeeplearning.com/'],
 ['V15','Stanford CS229 · Machine Learning lectures and notes','https://cs229.stanford.edu/','M07','English','Official course page; follow public recording links. Python, linear algebra, calculus and probability required.','https://cs229.stanford.edu/'],
 ['V16','3Blue1Brown · Calculus intuition','https://www.3blue1brown.com/topics/calculus','M05','English','Author topic page; visual intuition must be paired with written derivative/chain-rule exercises.','https://www.3blue1brown.com/topics/calculus'],
 ['V17','Khan Academy · Statistics and probability bridge','https://www.khanacademy.org/math/statistics-probability','M06','English','Gentler bridge before Stat110. Page text was not extractable during this pass; exercise/video availability not individually verified.','https://www.khanacademy.org/math/statistics-probability']
];
for(const [id,title,url,modules,language,notes,source] of additions) add(videos,{id,title,url,type:'video',modules,language,notes,source,verification:id==='V17'?'page-text-unavailable':'official-creator-page-or-linked-recording-reviewed'});
write('video-companions',videos);
const papers=read('papers');
for(const [id,arxiv,title,year,after,learn,exercise] of [
 ['P25','2303.11366','Reflexion: Language Agents with Verbal Reinforcement Learning','2023','M12','Feedback and reflection memory between attempts','Compare bounded retries with and without reflection at equal call budget.'],
 ['P26','2304.03442','Generative Agents: Interactive Simulacra of Human Behavior','2023','M12','Memory, reflection and planning in social simulation','Build three simulated characters and ablate memory retrieval; report limits of plausibility metrics.'],
 ['P27','2308.08155','AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation','2023','M12','Multi-agent conversation orchestration','Compare two-agent collaboration and one agent at equal budget; check current framework maintenance guidance.'],
 ['P28','2412.15605',"Don't Do RAG: When Cache-Augmented Generation is All You Need for Knowledge Tasks",'2024','M11','Bounded-corpus long-context caching and retrieval tradeoffs','Compare retrieval and cached context on identical queries, cold/warm latency, corpus updates and citations.']
]) add(papers,{id,arxiv,title,year,after,priority:'branch',learn,exercise,url:`https://arxiv.org/abs/${arxiv}`,verification:'landing-page-and-abstract-reviewed'});
write('papers',papers);
const resources=read('resources');
for(const p of papers.filter(p=>['P25','P26','P27','P28'].includes(p.id))) add(resources,{id:p.id,title:p.title,url:p.url,type:'paper',modules:p.after,notes:`After ${p.after}. ${p.exercise}`,verification:p.verification});
for(const [id,title,url,modules] of [
 ['R01','Andrew Ng · Machine Learning Specialization','https://www.deeplearning.ai/specializations/machine-learning','M07'],
 ['R02','Andrew Ng · Deep Learning Specialization','https://www.deeplearning.ai/specializations/deep-learning','M08']
]) add(resources,{id,title,url,type:'course',modules,language:'English',notes:'Alternative to the primary route; platform audit/lab/certificate access can vary. Do not assume all graded material is free.',verification:'official-page-reviewed'});
write('resources',resources);
const md=fs.readFileSync(path.join(root,'15-coverage-audit-and-learning-extensions.md'),'utf8');
const units=[...md.matchAll(/### (X\d+) — (.*?) · after (.*?) · (\d+) hours\n([\s\S]*?)(?=\n### |\n## Study sequence)/g)].map(m=>({id:m[1],title:m[2],prerequisites:m[3].split(', ').map(s=>s.trim()),hours:Number(m[4]),topics:[...m[5].matchAll(/- \[ \] (X\d+\.\d+) (.*)/g)].map(t=>({id:t[1],title:t[2]})),assessment:(m[5].match(/\*\*Evidence:\*\* (.*)/)||[])[1]||'Compare retrieval, cache and memory on fixed queries, updates and cold-start cost.'}));
write('learning-extensions',{schemaVersion:1,prepared:'2026-10-07',scope:'Optional deeper units; not part of existing 740 topic IDs or the first 28 daily sessions.',units});
const projectMd=fs.readFileSync(path.join(root,'18-final-year-projects-reviewed.md'),'utf8');
const projects=projectMd.split('\n').filter(l=>/^\| \d+ /.test(l)).map(l=>{const cells=l.split('|').slice(1,-1).map(s=>s.trim());const link=cells[0].match(/\[([^\]]+)\]\(([^)]+)\)/);return {id:`SP${cells[0].match(/^\d+/)[0].padStart(2,'0')}`,label:cells[0],url:link[2],prerequisites:cells[1],deliverable:cells[2],verification:'official-repository-readme-reviewed'};});
const frameworkMd=fs.readFileSync(path.join(root,'16-agent-frameworks-and-protocols.md'),'utf8');
const frameworks=frameworkMd.split('\n').filter(l=>/^\| \[/.test(l)).map(l=>{const cells=l.split('|').slice(1,-1).map(s=>s.trim());const link=cells[0].match(/\[([^\]]+)\]\(([^)]+)\)/);return {name:link[1],url:link[2],purpose:cells[1],exercise:cells[2],origin:link[1]==='LlamaIndex'?'additional-comparison':'user-saved-list',verification:'official-repository-readme-reviewed'};});
write('saved-material-review',{prepared:'2026-10-07',source:'User-transcribed Instagram posts; original reels were not accessed.',frameworks,projects,papers:['P13','P14','P25','P26','P27'],corrections:['Heading says nine frameworks; eight supplied. LlamaIndex is an added comparison.','feast-dev/feats corrected to feast-dev/feast.','qodo-ai/pr-agent redirects to The-PR-Agent/pr-agent.','Perfect likely Prefect; Reddis means Redis; NVIDIA is an ecosystem/vendor.'],unresolved:[],resolved:{MAG:'Memory Augmented Generation; user clarification, no single canonical architecture',primeAgent:'https://github.com/PrimeIntellect-ai/prime-agent',deepseekHarness:'https://github.com/deepseek-ai/deepseek-harness'},limits:'README/abstract/creator-page review only; no all-video viewing, repository execution, benchmark runs or employment guarantees.'});
const registry=read('tool-registry');
for(const [id,names] of [['T18',['Agno','OpenAI Agents SDK','Mastra','Letta','Google ADK']],['T14',['Redis']],['T27',['Kedro']]]) {
 const category=registry.find(t=>t.id===id); for(const name of names)if(!category.tools.includes(name))category.tools.push(name);
}
write('tool-registry',registry);
const audit=read('source-audit');
for(const item of [...frameworks,...projects,...additions.map(([id,title,url,modules,language,notes,source])=>({url:source,title,verification:id==='V17'?'page-text-unavailable':'official-creator-page-reviewed'})),...papers.filter(p=>['P25','P26','P27','P28'].includes(p.id))]) {
 if(audit.sources.some(s=>s.url===item.url))continue;
 audit.sources.push({id:`S${String(audit.sources.length+1).padStart(3,'0')}`,url:item.url,retrieved:'2026-10-07',title:item.name||item.title||item.label,reviewStatus:item.verification||'official-repository-readme-reviewed',notes:'Saved-material expansion: README/abstract/creator-page review; no full video or code-execution audit.'});
}
write('source-audit',audit);
console.log(JSON.stringify({videos:videos.length,papers:papers.length,extensions:units.length,extensionTopics:units.reduce((n,u)=>n+u.topics.length,0),projects:projects.length,frameworks:frameworks.length}));

