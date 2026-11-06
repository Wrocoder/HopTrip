import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const require=createRequire(new URL('../../apps/web/package.json',import.meta.url));
const {chromium,expect}=require('@playwright/test'),{default:AxeBuilder}=require('@axe-core/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),checks=[];
try{
 for(const locale of ['pl','en','ru','uk'])for(const state of ['populated','unknown','empty']){
  const context=await browser.newContext(),page=await context.newPage(),errors=[],network=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
  await page.goto(pathToFileURL(path.resolve(`docs/h3-18b9/dashboard-${locale}-${state}.html`)).href);
  const section=page.locator('[data-locale-cohorts="first-received-locale-cohorts-v1"]');
  assert.equal(await page.locator('html').getAttribute('lang'),locale);
  assert.equal(await section.locator('tbody tr').count(),state==='populated'?5:state==='unknown'?1:0);
  if(state!=='empty')assert.equal(await section.locator('thead th').count(),6);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('.skip').focus();await page.keyboard.press('Enter');assert(await page.locator('#report').evaluate(element=>element===document.activeElement));
   let horizontalKeyboardScroll=false;
   if(state!=='empty'){
    const region=section.locator('.table-scroll');
    if(await region.evaluate(element=>element.scrollWidth>element.clientWidth)){
     await region.evaluate(element=>element.scrollLeft=0);await region.focus();await page.keyboard.press('ArrowRight');
     await expect.poll(()=>region.evaluate(element=>element.scrollLeft)).toBeGreaterThan(0);horizontalKeyboardScroll=true;
     await region.evaluate(element=>element.scrollLeft=0);
    }
   }
   const axe=await new AxeBuilder({page}).analyze();assert.deepEqual(axe.violations,[]);assert.deepEqual(axe.incomplete,[]);
   checks.push({locale,state,width,axeViolations:0,axeIncomplete:0,keyboardSkipLink:true,horizontalKeyboardScroll,overflow:false});
   if(state==='populated'&&((locale==='ru'&&width===320)||(locale==='en'&&width===1440)))await section.screenshot({path:`docs/h3-18b9/locales-${locale}-${width}.png`});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);await context.close();
 }
}finally{await browser.close();writeFileSync('docs/h3-18b9/dashboard-browser.json',JSON.stringify(checks,null,2)+'\n');}
console.log(`PASS: ${checks.length} localized state/layout/axe/keyboard checks.`);
