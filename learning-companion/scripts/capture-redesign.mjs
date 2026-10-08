import {chromium} from 'playwright-core';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('design/shots/redesign',{recursive:true});
for(const size of [{name:'desktop',width:1440,height:1080},{name:'mobile',width:390,height:844}]) {
  await page.setViewportSize(size);
  for(const theme of ['light','dark']) {
    await page.goto('http://127.0.0.1:8090/settings');
    await page.getByRole('button',{name:theme==='light'?'Light':'Dark',exact:true}).click();
    await page.waitForFunction(theme=>JSON.parse(localStorage.getItem('ai-learning-v1')).settings.theme===theme,theme);
    for(const [name,route] of [['today','/'],['path','/path'],['library','/library'],['progress','/progress'],['lesson','/session/D001'],['module','/module/M00'],['settings','/settings']]) {
      await page.goto('http://127.0.0.1:8090'+route);
      await page.getByRole('heading').first().waitFor();
      await page.evaluate(()=>document.fonts.ready);
      await page.waitForTimeout(400); // Allow the deliberate entry transition to settle before layout capture.
      if (name === 'today' && size.name === 'mobile') {
        const action = await page.getByTestId('open-lesson').boundingBox();
        const journey = await page.getByText('YOUR LEARNING JOURNEY', {exact:true}).boundingBox();
        assert.ok(journey.y > action.y + action.height, 'Stacked journey panel must follow the lesson action without overlap');
      }
      await page.screenshot({path:`design/shots/redesign/${size.name}-${theme}-${name}.png`});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${size.name} ${theme} ${name} overflow`);
    }
  }
}
assert.deepEqual(errors,[]);
console.log('PASS: 28 desktop/mobile light/dark route captures; no horizontal overflow or runtime errors.');
await browser.close();
