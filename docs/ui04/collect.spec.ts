import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';

for(const [locale,width] of [['pl',1440],['ru',320]] as const)test(`UI-04 baseline ${locale}/${width}`,async({page},info)=>{
 test.setTimeout(180000);await page.setViewportSize({width,height:900});
 await page.addInitScript(()=>{
  localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('test-only');}}});
 });
 await page.route('**/api/v1/deals/*/events?**',route=>route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[{
  id:'accessibility-fixture',name:'Test-only accessibility event',venue:'Fixture venue',city:'Barcelona',category:'MUSIC',
  start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',
  url:'https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fa11y',price_from:null,currency:null,
 }]}}));
 const results:unknown[]=[];const url=(path:string)=>`${locale==='pl'?'':`/${locale}`}${path}`;
 const scan=async(state:string)=>{
  const axe=await new AxeBuilder({page}).analyze();
  const refs=await page.evaluate(()=>[...document.querySelectorAll('[aria-labelledby],[aria-describedby],[aria-controls],[aria-activedescendant]')].flatMap(el=>
   ['aria-labelledby','aria-describedby','aria-controls','aria-activedescendant'].flatMap(attr=>(el.getAttribute(attr)??'').split(/\s+/).filter(Boolean).filter(id=>!document.getElementById(id)).map(id=>({tag:el.tagName,attr,id})))));
  results.push({state,url:page.url(),violations:axe.violations,incomplete:axe.incomplete,refs});
  writeFileSync(info.outputPath(`audit-${locale}-${width}.json`),JSON.stringify(results,null,2));
 };
 for(const path of ['/','/deals','/info/trip-budget','/info','/saved','/alerts']){
  await page.goto(url(path));await expect(page.locator('main')).toBeVisible();
  if(path==='/deals')await expect(page.locator('.deal-card').first()).toBeVisible();
  await scan(path);
 }
 await page.goto(url('/deals/browser-deal'));await expect(page.locator('#budget-flight')).toBeEnabled();
 const start=await page.locator('#budget-start').inputValue(),end=new Date(start+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+2);
 await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
 const add=page.locator('#trip-events button[aria-label$=": Test-only accessibility event"]');await expect(add).toBeVisible();await add.click();
 await scan('detail-with-planned-event');
 await page.locator('#budget-flight').fill('-1');await page.locator('#planned-events input[inputmode="numeric"]').fill('0');
 await scan('detail-input-errors');
 await page.locator('#budget-flight').fill('200.25');await page.locator('#planned-events input[inputmode="numeric"]').fill('1');
 await page.locator('#trip-save .trip-actions button').nth(0).click();await page.locator('#trip-save .trip-actions button').nth(1).click();
 const shared=await page.locator('#trip-share-link').inputValue();
 await page.goto(url('/saved'));await scan('saved-populated');
 await page.goto(shared);await expect(page.locator('#budget-flight')).toBeEnabled();await scan('shared');
 await page.goto(url('/deals'));const trigger=page.locator('.score-trigger').first();await trigger.focus();await page.keyboard.press('Enter');
 await expect(page.locator('dialog[open]')).toBeVisible();await scan('score-dialog');await page.keyboard.press('Escape');
 await page.locator('.filters input[name="origin"]').fill('missing-airport');await page.locator('.filters button[type="submit"]').click();
 await expect(page.locator('.filters [role="alert"]')).toBeVisible();await scan('filter-error');
 await page.locator('.privacy-settings').click();
 await expect(page.locator('.consent-panel')).toBeVisible();await scan('consent');
 writeFileSync(info.outputPath(`aria-${locale}.txt`),await page.locator('.consent-panel').ariaSnapshot());
});
