import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
await fs.mkdir('artifacts/typography',{recursive:true});
try {
  for(const width of [1440,768,390,360]) {
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();
    for(const route of ['/','/services/roof-replacement','/contact','/roof-system']) {
      await page.goto(`http://localhost:3000${route}`,{waitUntil:'networkidle'});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} ${route} overflow`);
      const headings=await page.locator('h1,h2,h3').evaluateAll(es=>es.map(e=>({font:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight})));
      assert.ok(headings.every(h=>h.font.includes('-apple-system')));
      assert.ok(headings.every(h=>Number(h.weight)<=600));
      assert.equal(await page.locator('link[rel="preload"][as="font"]').count(),0);
      if(route==='/'){
        await page.screenshot({path:`artifacts/typography/home-${width}.png`});
        await page.locator('#roof-system').screenshot({path:`artifacts/typography/roof-${width}.png`});
      }
    }
    console.log(`${width}px: four routes pass, native font stack, lighter headings, no overflow or downloaded fonts`);
    await context.close();
  }
} finally {await browser.close();}
