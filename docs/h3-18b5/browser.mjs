import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const require=createRequire(new URL('../../apps/web/package.json',import.meta.url));
const {chromium}=require('@playwright/test'),{default:AxeBuilder}=require('@axe-core/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),checks=[];
try{
 const beforeContext=await browser.newContext(),before=await beforeContext.newPage();
 await before.goto(pathToFileURL(path.resolve('docs/h3-18b5/empty-before-pl.html')).href);
 await before.setViewportSize({width:320,height:900});
 const finding=await new AxeBuilder({page:before}).analyze();
 assert.equal(await before.locator('table tbody:empty').count(),1);
 writeFileSync('docs/h3-18b5/empty-before-axe.json',JSON.stringify({viewport:{width:320,height:900},emptyTables:1,violations:finding.violations,incomplete:finding.incomplete},null,2)+'\n');
 await beforeContext.close();
 for(const locale of ['pl','en','ru','uk'])for(const state of ['populated','zero','empty']){
  const context=await browser.newContext(),page=await context.newPage(),errors=[],network=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
  await page.goto(pathToFileURL(path.resolve(`docs/h3-18b5/dashboard-${locale}-${state}.html`)).href);
  const section=page.locator('[data-engagement="received-session-engagement-v1"]');
  assert.equal(await page.locator('html').getAttribute('lang'),locale);
  assert.equal(await section.locator('[data-metric]').count(),3);assert.equal(await section.locator('h3').count(),3);
  const expected=state==='empty'?['—','—','—']:state==='zero'?['0.00%','0.00%','0.00%']:['25.00%','50.00%','50.00%'];
  assert.deepEqual(await section.locator('.rate').allTextContents(),expected.map(rate=>locale==='en'?rate:rate.replace('.',',')));
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('.skip').focus();await page.keyboard.press('Enter');assert(await page.locator('#report').evaluate(element=>element===document.activeElement));
   const axe=await new AxeBuilder({page}).analyze();assert.deepEqual(axe.violations,[]);assert.deepEqual(axe.incomplete,[]);
   checks.push({locale,state,width,axeViolations:0,axeIncomplete:0,keyboardSkipLink:true,overflow:false});
   if(state==='populated'&&(width===320||width===1440))await section.screenshot({path:`docs/h3-18b5/engagement-${locale}-${width}.png`});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);await context.close();
 }
}finally{await browser.close();writeFileSync('docs/h3-18b5/browser.json',JSON.stringify(checks,null,2)+'\n');}
console.log(`PASS: ${checks.length} localized state/layout/axe/keyboard checks.`);
