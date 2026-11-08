import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {connectionWarnings} from '../src/lib/connections';
import type {Deal} from '../src/lib/api';

const fixture='http://127.0.0.1:8100';
test.beforeAll(async({request})=>{
 // Consume a complete SSR catalogue before mutating the shared fixture database.
 // A streamed HTTP 200 from the homepage is not a catalogue/API readiness check.
 const response=await request.get('/deals?sort=price');expect(response.ok()).toBe(true);
 expect(await response.text()).toContain('deal-card-link');
});
test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/connection-fixtures?enabled=true`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post(`${fixture}/__test__/connection-fixtures?enabled=false`);});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: connection warnings are visible outside disclosures on cards and detail`,async({page,request},info)=>{
 test.setTimeout(90000);
 const response=await request.get(`${fixture}/api/v1/deals?destination=connection-fixture`);
 expect(response.ok()).toBe(true);const deals:Deal[]=await response.json();expect(deals).toHaveLength(6);
 await page.goto(localizedHref('/deals?destination=connection-fixture',locale));
 await expect(page.locator('.deal-card')).toHaveCount(6);
 for(const deal of deals){
  const card=page.locator('.deal-card').filter({has:page.locator(`a[href*="/deals/${deal.slug}"]`)});
  const warnings=connectionWarnings(deal,locale);
  const visible=card.locator('.flight-schedule-compact [data-connection-warnings]');
  expect(warnings.length).toBeGreaterThan(0);
  await expect(visible).toBeVisible();
  for(const warning of warnings){
   await expect(visible.locator('.connection-warning strong')).toContainText(warning.title);
   for(const detail of warning.details)await expect(visible).toContainText(detail);
  }
  await expect(card.locator('.trip-details')).not.toHaveAttribute('open','');
 }
 const airport=page.locator('.deal-card').filter({has:page.locator('a[href*="/deals/connection-fixture-airport"]')});
 await expect(airport.locator('.flight-schedule-compact .connection-warning strong')).toContainText('LHR → LGW');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.deal-grid').analyze()).violations).toEqual([]);
 await airport.locator('.deal-card-link').click();
 await expect(page).toHaveURL(/\/deals\/connection-fixture-airport(?:\?|$)/);
 await expect(page.locator('.flight-schedule-compact [data-connection-warnings]')).toBeVisible();
 await expect(page.locator('.flight-schedule-compact .connection-warning strong')).toContainText('LHR → LGW');
 await page.screenshot({path:info.outputPath(`connection-${locale}-320.png`),fullPage:true});
});

test('server rendered warnings remain readable without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:info.project.use.baseURL});
 try{
  const page=await context.newPage();await page.goto('/en/deals?destination=connection-fixture');
  const visible=page.locator('.flight-schedule-compact [data-connection-warnings]');
  await expect(visible).toHaveCount(6);
  await expect(visible.locator('.connection-warning').filter({hasText:'LHR → LGW'})).toContainText('Ground transfer between airports is not confirmed.');
  await expect(visible.locator('.connection-warning').filter({hasText:'360 min'})).toContainText('Long layover.');
 }finally{await context.close();}
});
