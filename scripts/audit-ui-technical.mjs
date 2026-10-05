import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = 'http://localhost:3000';
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const routes = [...new Set([
  ...[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname),
  '/thank-you',
  ...['silver-spring','bethesda','rockville','gaithersburg','wheaton','takoma-park','laurel','bowie'].map(s => `/service-areas/${s}-md`),
])];
const browser = await chromium.launch({headless:true, executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results = [];
await fs.mkdir('artifacts/ui-audit', {recursive:true});
try {
  for (const width of [1440,360]) {
    const context = await browser.newContext({viewport:{width,height:900}});
    await context.addInitScript(() => {Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};});
    const page = await context.newPage();
    for (const route of routes) {
      const errors=[];
      const listener=e=>errors.push(e.message);
      page.on('pageerror',listener);
      const response=await page.goto(base+route,{waitUntil:'networkidle'});
      const diagnostics=await page.evaluate(() => {
        const visible=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
        const label=e=>(e.textContent||e.getAttribute('aria-label')||e.getAttribute('alt')||'').trim().slice(0,95);
        return {
          title:document.title,
          h1:[...document.querySelectorAll('h1')].map(e=>e.textContent),
          headings:[...document.querySelectorAll('main h1,main h2,main h3,main h4')].map(e=>({level:e.tagName,text:label(e)})),
          overflow:document.documentElement.scrollWidth>innerWidth+1,
          overflowing:[...document.querySelectorAll('main *')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right>innerWidth+1;}).slice(0,15).map(e=>({tag:e.tagName,class:e.className,text:label(e)})),
          brokenImages:[...document.images].filter(e=>e.loading!=='lazy'&&(!e.complete||!e.naturalWidth)).map(e=>e.src),
          missingAlt:[...document.images].filter(e=>!e.hasAttribute('alt')).map(e=>e.src),
          links:[...document.querySelectorAll('a')].map(e=>({href:e.getAttribute('href'),text:label(e)})),
          smallControls:[...document.querySelectorAll('button,summary,input:not([type=hidden]),select')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return{tag:e.tagName,text:label(e),width:r.width,height:r.height};}).filter(r=>r.height<44||r.width<44),
        };
      });
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
      results.push({width,route,status:response.status(),errors,...diagnostics,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))}))});
      page.off('pageerror',listener);
      console.log(`${width} ${route}: status=${response.status()} axe=${axe.violations.length} overflow=${diagnostics.overflow}`);
    }
    await context.close();
  }
  await fs.writeFile('artifacts/ui-audit/technical-after.json', JSON.stringify(results,null,2));
  console.log(JSON.stringify({routes:routes.length,views:results.length,axe:results.filter(r=>r.violations.length).map(r=>({width:r.width,route:r.route,violations:r.violations})),overflow:results.filter(r=>r.overflow),badStatuses:results.filter(r=>r.status!==200)},null,2));
}finally{await browser.close();}
