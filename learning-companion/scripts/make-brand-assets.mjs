import fs from 'node:fs';
import {chromium} from 'playwright-core';
const mark='<path d="M12 47V25L30 14V36L12 47Z M34 36V14L52 25V47L34 36Z M16 51L32 41L48 51L32 59Z" fill="url(#silver)"/>';
const svg=(foreground=false)=>`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><defs><linearGradient id="silver" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#fff"/><stop offset=".55" stop-color="#ededed"/><stop offset="1" stop-color="#999"/></linearGradient><radialGradient id="bg"><stop stop-color="#262626"/><stop offset="1" stop-color="#080808"/></radialGradient></defs>${foreground?'':'<rect width="1024" height="1024" fill="url(#bg)"/>'}<g transform="translate(224 174) scale(9)">${mark}</g></svg>`;
fs.mkdirSync('assets/brand',{recursive:true});
fs.writeFileSync('assets/brand/ai-learning.svg',svg());
fs.writeFileSync('assets/brand/mark.svg',svg(true));
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1024,height:1024},deviceScaleFactor:1});
for(const [file,fg] of [['icon.png',false],['android-icon-foreground.png',true],['android-icon-monochrome.png',true]]) {
 const source=file.includes('monochrome')?svg(fg).replace('fill="url(#silver)"','fill="#fff"'):svg(fg);
 await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${source}`);
 await page.screenshot({path:`assets/${file}`,omitBackground:fg});
}
await page.setViewportSize({width:64,height:64});
await page.setContent(`<style>html,body{margin:0}svg{width:64px;height:64px}</style>${svg()}`);
await page.screenshot({path:'assets/favicon.png'});
await browser.close();
console.log('Original vector logo and Android/iOS PNG assets generated.');
