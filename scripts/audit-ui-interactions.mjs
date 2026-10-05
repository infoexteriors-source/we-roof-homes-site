import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';

const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results={pages:[],images:[],menu:{},form:{},noJS:{}};
try {
  const context=await browser.newContext({viewport:{width:360,height:800}});
  await context.addInitScript(()=>{Element.prototype.requestPointerLock=()=>{};Element.prototype.setPointerCapture=()=>{};});
  const page=await context.newPage();
  for(const route of ['/contact','/services/roof-repair','/financing','/services','/']) {
    await page.goto(`http://localhost:3000${route}`,{waitUntil:'networkidle'});
    results.pages.push({route,...await page.evaluate(()=>({formY:document.querySelector('.lead-card')?.getBoundingClientRect().top,active:[...document.querySelectorAll('nav [aria-current=page]')].map(e=>e.textContent),navHighlight:[...document.querySelectorAll('nav [data-active=true]')].map(e=>e.textContent),fonts:[...document.querySelectorAll('.lead-card label,.form-legal,.step-line,.secure-note')].map(e=>({text:e.textContent.trim().slice(0,50),font:getComputedStyle(e).fontSize})).slice(0,12),summaryHeights:[...document.querySelectorAll('summary')].map(e=>e.getBoundingClientRect().height)}))});
  }
  await page.goto('http://localhost:3000/services',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Open menu'}).click();
  results.menu.targets=await page.locator('.mobile-nav a').evaluateAll(es=>es.map(e=>({text:e.textContent,height:e.getBoundingClientRect().height})));
  results.menu.toggle=await page.locator('.menu-toggle').evaluate(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
  await page.keyboard.press('Escape');
  results.menu.escapeCloses=await page.getByRole('button',{name:'Open menu'}).count()===1;
  results.menu.focus=await page.evaluate(()=>document.activeElement.getAttribute('aria-label'));
  await page.goto('http://localhost:3000/contact',{waitUntil:'networkidle'});
  await page.getByLabel('Property ZIP code').fill('20905');
  await page.getByLabel('What can we help with?').selectOption('Roof inspection');
  await page.locator('.lead-card .form-submit').click();
  results.form.step2=await page.locator('.lead-card').evaluate(e=>({height:e.getBoundingClientRect().height,smsChecked:e.querySelector('[name=smsConsent]').checked,active:document.activeElement.name,legalFont:getComputedStyle(e.querySelector('.form-legal')).fontSize,consentFont:getComputedStyle(e.querySelector('.check')).fontSize,backHeight:e.querySelector('.form-back').getBoundingClientRect().height}));
  await page.getByRole('button',{name:'Back to project'}).click();
  await page.waitForTimeout(100);
  results.form.back=await page.evaluate(()=>({active:document.activeElement.name,zip:document.querySelector('[name=zip]').value,service:document.querySelector('[name=service]').value}));
  const paths=['/','/services','/about','/contact','/financing','/projects','/reviews','/roof-system','/service-areas','/resources',...['roof-replacement','roof-repair','roof-inspection','storm-damage','insurance-assistance','siding','gutters'].map(x=>`/services/${x}`)];
  for(const route of paths){
    await page.goto('http://localhost:3000'+route,{waitUntil:'networkidle'});
    const images=page.locator('img');
    for(let i=0;i<await images.count();i++){
      const img=images.nth(i);
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(e=>e.complete?null:new Promise(resolve=>{e.addEventListener('load',resolve,{once:true});e.addEventListener('error',resolve,{once:true});setTimeout(resolve,10000);}));
      results.images.push({route,...await img.evaluate(e=>({src:e.currentSrc||e.src,alt:e.alt,loaded:e.complete&&e.naturalWidth>0,naturalWidth:e.naturalWidth,displayWidth:e.getBoundingClientRect().width}))});
    }
  }
  const nojs=await browser.newContext({viewport:{width:360,height:800},javaScriptEnabled:false});
  const nojsPage=await nojs.newPage();
  await nojsPage.goto('http://localhost:3000/contact');
  results.noJS.toggleHidden=!(await nojsPage.locator('.menu-toggle').isVisible());
  results.noJS.links=await nojsPage.locator('header .nav a').evaluateAll(es=>es.map(e=>({text:e.textContent,visible:e.getBoundingClientRect().height>0})));
  results.noJS.fields=await nojsPage.locator('.lead-card').evaluate(e=>({firstNameVisible:e.querySelector('[name=firstName]').getBoundingClientRect().height>0,emailVisible:e.querySelector('[name=email]').getBoundingClientRect().height>0,smsUnchecked:!e.querySelector('[name=smsConsent]').checked}));
  await fs.writeFile('artifacts/ui-audit/interactions-after.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify({...results,images:{count:results.images.length,broken:results.images.filter(x=>!x.loaded)}},null,2));
}finally{await browser.close();}
