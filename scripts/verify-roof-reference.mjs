import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
const browser = await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
await fs.mkdir('artifacts/roof-reference',{recursive:true});
try {
  for (const [name,width,height,javaScriptEnabled] of [['desktop',1440,1000,true],['mobile',390,844,true],['nojs',390,844,false]]) {
    const context = await browser.newContext({viewport:{width,height},javaScriptEnabled,reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://localhost:3000/#roof-system',{waitUntil:'networkidle'});
    const section=page.locator('#roof-system');await section.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
    const image=section.locator('img');
    await image.waitFor();
    assert.equal(await image.getAttribute('src'),'/assets/roof-system-reference.png');
    assert.equal(await image.evaluate(el=>el.naturalWidth),640);
    assert.ok((await image.boundingBox()).width<=640);
    assert.equal(await section.locator('svg').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await section.locator('summary').first().click();
    assert.ok(await section.locator('details').first().evaluate(el=>el.open));
    await section.screenshot({path:`artifacts/roof-reference/${name}.png`});
    if(javaScriptEnabled){const result=await new AxeBuilder({page}).include('#roof-system').withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(result.violations,[]);}
    assert.deepEqual(errors,[]);await context.close();console.log(`${name}: exact image, width, accessible details and overflow checks passed`);
  }
} finally {await browser.close();}
