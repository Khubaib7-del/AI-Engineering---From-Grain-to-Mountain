import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.open=(url)=>{window.__studyOpened=String(url);return null;};});
try {
 await page.goto('http://127.0.0.1:8090/session/D001');
 await page.getByText('Only this step today',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Read matching notes',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__studyOpened),'https://cs50.harvard.edu/python/notes/0/');
 await page.getByRole('button',{name:'Open course lesson',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__studyOpened),'https://cs50.harvard.edu/python/weeks/0/');
 await page.goto('http://127.0.0.1:8090/module/M12');
 await page.getByText('Your guided route',{exact:true}).waitFor();
 assert.equal(await page.getByRole('button',{name:'CampusX · Agentic AI using LangGraph',exact:true}).count(),0);
 await page.getByRole('button',{name:'Optional explanations — only if stuck',exact:true}).click();
 await page.getByRole('button',{name:'CampusX · Generative AI using LangChain',exact:true}).click();
 assert.equal(await page.evaluate(()=>window.__studyOpened),'https://www.youtube.com/playlist?list=PLKnIA16_RmvaTbihpo4MtzVm4XOQa0ER0');
 await page.getByRole('button',{name:'CampusX · Agentic AI using LangGraph',exact:true}).waitFor();
 await page.getByRole('button',{name:'Hide optional explanations',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'CampusX · Agentic AI using LangGraph',exact:true}).count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'design/shots/guided-module-mobile.png',fullPage:false});
 console.log('PASS: daily course/notes targets, collapsed optional resources, both CampusX tracks, mobile overflow/runtime checks.');
} finally {await browser.close();}
