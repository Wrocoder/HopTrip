import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../apps/web/package.json',import.meta.url));
const {chromium}=require('@playwright/test'),{default:AxeBuilder}=require('@axe-core/playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),rows=[];
try{for(const locale of ['pl','en','ru','uk']){
 const context=await browser.newContext(),page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(`docs/h3-18b1/dashboard-${locale}.html`)).href);
 assert.equal(await page.locator('html').getAttribute('lang'),locale);
 assert.equal(await page.locator('[data-funnel] tbody tr').count(),5);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.skip').focus();await page.keyboard.press('Enter');assert(await page.locator('#report').evaluate(e=>e===document.activeElement));
  const axe=await new AxeBuilder({page}).analyze();assert.deepEqual(axe.violations,[]);
  rows.push({locale,width,axeViolations:0,needsReview:axe.incomplete.map(r=>r.id),keyboardSkipLink:true,overflow:false});
  if(width===320||width===1440)await page.locator('section:has(#ordered-funnel)').screenshot({path:`docs/h3-18b1/funnel-${locale}-${width}.png`});
 }
 assert.deepEqual(errors,[]);await context.close();
}}finally{await browser.close();writeFileSync('docs/h3-18b1/browser.json',JSON.stringify(rows,null,2));}
console.log(`PASS:${rows.length} localized admin layout/axe/keyboard checks.`);

