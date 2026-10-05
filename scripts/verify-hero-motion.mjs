import {chromium} from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
await fs.mkdir('artifacts/hero-motion',{recursive:true});
const results=[];
try {
 for(const mode of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844},{name:'compact',width:360,height:640},{name:'reduced',width:1440,height:1000,reducedMotion:'reduce'},{name:'nojs',width:390,height:844,javaScriptEnabled:false}]) {
  const context=await browser.newContext({viewport:{width:mode.width,height:mode.height},reducedMotion:mode.reducedMotion||'no-preference',javaScriptEnabled:mode.javaScriptEnabled!==false});
  await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
  const states=[];
  for(const [label,y] of [['opening',0],['middle',250],['exit',530]]) {
   await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(150);
   states.push(await page.locator('.hero').evaluate(el=>({state:el.dataset.scVerifyState,photo:getComputedStyle(el.querySelector('.hero-photo')).transform,roof:getComputedStyle(el.querySelector('.hero-roof-depth')).transform,trace:getComputedStyle(el.querySelector('.hero-roof-trace')).strokeDashoffset,form:getComputedStyle(el.querySelector('.hero-form')).transform})));
   await page.screenshot({path:`artifacts/hero-motion/${mode.name}-${label}.png`});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  }
  assert.ok(states.every(s=>s.form==='none'));
  if(mode.name==='reduced')assert.ok(states.every(s=>s.photo==='none'&&s.roof==='none'));
  else if(mode.javaScriptEnabled!==false){assert.notEqual(states[0].photo,states[2].photo);assert.notEqual(states[0].roof,states[2].roof);assert.notEqual(states[0].trace,states[2].trace);}
  if(mode.javaScriptEnabled!==false){
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   const scan=await new AxeBuilder({page}).include('.hero').withTags(['wcag2a','wcag2aa']).analyze();assert.deepEqual(scan.violations,[]);
   const hero=page.locator('.hero');await hero.getByLabel('Property ZIP code').fill('20905');await hero.getByLabel('What can we help with?').selectOption('Roof inspection');await hero.getByRole('button',{name:'Continue to contact details',exact:true}).press('Enter');assert.equal(await hero.getByLabel('First name',{exact:true}).isVisible(),true);
  }
  assert.deepEqual(errors,[]);results.push({mode:mode.name,states,errors});await context.close();console.log(`${mode.name} passed`);
 }
 await fs.writeFile('artifacts/hero-motion/results.json',JSON.stringify(results,null,2));
} finally {await browser.close();}
