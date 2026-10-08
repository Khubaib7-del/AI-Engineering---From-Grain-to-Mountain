import { chromium } from 'playwright-core';
import fs from 'node:fs';
const pieces='<path fill="#C8EFDB" d="M260 292q0-48 48-48h56q48 0 48 48v432H260z M440 408q0-48 48-48h56q48 0 48 48v316H440z M620 524q0-48 48-48h56q48 0 48 48v200H620z"/>';
const svg=background=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${background?'<path fill="#075C51" d="M0 0h1024v1024H0z"/>':''}${pieces}</svg>`;
fs.writeFileSync('assets/learning-mark.svg',svg(true));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1024,height:1024},deviceScaleFactor:1});
for(const [name,bg] of [['icon.png',true],['android-icon-foreground.png',false]]){await page.setContent(`<style>html,body{margin:0}svg{display:block;width:100%;height:100%}</style>${svg(bg)}`);await page.screenshot({path:`assets/${name}`,omitBackground:!bg});}
await page.setViewportSize({width:64,height:64});await page.setContent(`<style>html,body{margin:0}svg{display:block;width:100%;height:100%}</style>${svg(true)}`);await page.screenshot({path:'assets/favicon.png'});
await browser.close();
