import {chromium} from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
const out='artifacts/verification';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--disable-gpu']});
const results=[];
try{
 for(const mode of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844},{name:'compact',width:360,height:640},{name:'reduced',width:1440,height:1000,reducedMotion:'reduce'},{name:'nojs',width:390,height:844,javaScriptEnabled:false}]){
 const context=await browser.newContext({viewport:{width:mode.width,height:mode.height},reducedMotion:mode.reducedMotion||'no-preference',javaScriptEnabled:mode.javaScriptEnabled!==false});
 await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base,{waitUntil:'networkidle'});await page.screenshot({path:`${out}/${mode.name}-opening.png`});
 const horizontal=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(horizontal,false,`${mode.name} has horizontal overflow`);
 assert.equal(await page.locator('h1').count(),1);assert.ok(await page.locator('meta[name="description"]').getAttribute('content'));
 const roof=page.locator('#roof-system');const box=await roof.boundingBox();
 for(const[p,label]of [[0,'assembled'],[.35,'expanded'],[.65,'layers'],[1,'resolved']]){await page.evaluate(({top,height,p})=>window.scrollTo({top:top-86+p*Math.max(0,height-innerHeight+86),behavior:'instant'}),{top:box.y,height:box.height,p});await page.waitForTimeout(120);await page.screenshot({path:`${out}/${mode.name}-roof-${label}.png`});}
 const transforms=await page.locator('.roof-layer').evaluateAll(es=>es.slice(0,9).map(e=>getComputedStyle(e).transform));
 if(mode.name==='desktop'){
  await page.getByRole('button',{name:'4 Underlayment',exact:true}).click();assert.equal(await page.locator('.roof-explainer .layer-summary').textContent(),'A second line of defense');
  await page.getByRole('button',{name:'8. Ridge caps',exact:true}).press('Enter');assert.equal(await page.locator('.roof-explainer .layer-summary').textContent(),'The finishing protection at the peak');
 }
 if(mode.name==='mobile'||mode.name==='compact'){assert.equal(await page.locator('.roof-sticky').evaluate(el=>getComputedStyle(el).position),'static');await page.locator('.mobile-parts summary').nth(3).click();assert.ok(await page.locator('.mobile-parts details').nth(3).getAttribute('open')!==null);}
 let violations=[];if(mode.javaScriptEnabled!==false){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();violations=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));}
 if(mode.name==='desktop'){
  await page.goto(`${base}/contact`,{waitUntil:'networkidle'});await page.getByLabel('Property ZIP code').fill('20905');await page.getByLabel('What can we help with?').selectOption('Roof inspection');await page.getByRole('button',{name:'Get My Free Inspection',exact:true}).click();await page.getByLabel('First name',{exact:true}).fill('Preview');await page.getByLabel('Phone',{exact:true}).fill('2405550100');await page.getByLabel('Email',{exact:true}).fill('preview@example.test');await page.getByLabel('Property address',{exact:true}).fill('10 Example Street');assert.equal(await page.locator('[name=smsConsent]').isChecked(),false);
  await page.route('**/api/leads',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Test delivery failed. Please retry.'})}));await page.getByRole('button',{name:'Request My Inspection & Estimate'}).click();await page.getByRole('alert').filter({hasText:'Test delivery failed'}).waitFor();assert.equal(await page.getByLabel('Email',{exact:true}).inputValue(),'preview@example.test');await page.unroute('**/api/leads');
  await page.route('**/api/leads',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,id:'test-only'})}));await page.getByRole('button',{name:'Request My Inspection & Estimate'}).click();await page.waitForURL('**/thank-you');
 }
 if(mode.name==='nojs'){await page.goto(`${base}/contact`);assert.equal(await page.getByLabel('Email',{exact:true}).isVisible(),true);assert.equal(await page.locator('form').getAttribute('method'),'post');}
 results.push({mode:mode.name,horizontalOverflow:horizontal,errors,violations,transforms});await context.close();
 }
 const context=await browser.newContext();const page=await context.newPage();const routes=['/','/about','/services','/financing','/contact','/service-areas','/projects','/reviews','/resources','/privacy-policy','/terms','/roof-system','/services/roof-replacement','/services/roof-repair','/services/roof-inspection','/services/storm-damage','/services/insurance-assistance','/services/siding','/services/gutters','/service-areas/silver-spring-md','/service-areas/bethesda-md','/service-areas/rockville-md','/service-areas/gaithersburg-md','/service-areas/wheaton-md','/service-areas/takoma-park-md','/service-areas/laurel-md','/service-areas/bowie-md','/resources/maryland-roof-replacement-cost','/resources/repair-or-replace','/resources/storm-damage-checklist','/resources/roof-financing','/resources/roof-warning-signs'];
 const titles=new Set();for(const route of routes){const response=await page.goto(base+route,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,route);assert.equal(await page.locator('h1').count(),1,route);const title=await page.title();assert.ok(!titles.has(title),`Duplicate title ${title}`);titles.add(title);assert.ok(await page.locator('link[rel=canonical]').getAttribute('href'),route);for(const data of await page.locator('script[type="application/ld+json"]').allTextContents())JSON.parse(data);}
 for(const[from,to]of [['/about-us','/about'],['/our-services','/services'],['/contact-us','/contact'],['/copy-of-contact-us','/terms']]){const r=await context.request.get(base+from,{maxRedirects:0});assert.equal(r.status(),308);assert.equal(new URL(r.headers().location,base).pathname,to);}
 assert.equal((await context.request.get(base+'/does-not-exist')).status(),404);assert.equal((await context.request.get(base+'/opengraph-image')).status(),200);assert.equal((await context.request.get(base+'/sitemap.xml')).status(),200);await context.close();results.push({routesVerified:routes.length,redirectsVerified:4});
 await fs.writeFile(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({mode,errors,violations,...r})=>({mode,errors,violations,...r,transforms:undefined})),null,2));
 if(results.some(r=>r.errors?.length||r.violations?.length))process.exitCode=1;
}finally{await browser.close();}
