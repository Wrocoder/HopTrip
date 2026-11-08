import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {loadHomeCollections} from '../src/lib/home-collections';
import {localizedHref} from '../src/lib/i18n/routing';

const fixture='http://127.0.0.1:8100';
test.beforeEach(async({request,page})=>{
 expect((await request.post(`${fixture}/__test__/weekend-fixtures?enabled=true&recommendations=true`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post(`${fixture}/__test__/weekend-fixtures?enabled=false`);});

test('real API collections exclude unsuitable stays and leave; general search retains every example',async({request,page})=>{
 const original=process.env.HOPTRIP_API_URL;process.env.HOPTRIP_API_URL=fixture;
 try{
  const collections=await loadHomeCollections('WRO');
  const weekend=collections.find(c=>c.id==='calendar-weekend')!;
  expect(weekend.status).toBe('READY');
  expect(weekend.offers.map(d=>d.slug)).toContain('weekend-fixture-evening');
  for(const collection of collections)for(const deal of collection.offers){
   expect(deal.weekend_assessment?.stay?.eligibility).toBe('ELIGIBLE');
   expect(deal.slug).not.toMatch(/weekend-fixture-(night|early|short|unknown)$/);
   if(collection.id==='calendar-weekend')expect(deal.weekend_assessment?.no_leave).toBe('ELIGIBLE');
  }
  const response=await request.get(`${fixture}/api/v1/deals?destination=weekend-fixture&departure_from=2030-11-01&include_total=true`);
  expect(response.ok()).toBe(true);const result=await response.json();expect(result.total).toBe(8);
  for(const kind of ['night','early','short','unknown','morning','monday'])expect(result.items.map((d:{slug:string})=>d.slug)).toContain(`weekend-fixture-${kind}`);
  await page.goto('/?origin=WRO');
  await expect(page.locator('.catalog-section .deal-card-link')).not.toHaveCount(0);
  for(const kind of ['night','early','short','unknown']){
   await expect(page.locator(`.catalog-section a[href*="/deals/weekend-fixture-${kind}"]`)).toHaveCount(0);
   await expect(page.locator(`.home-collections a[href*="/deals/weekend-fixture-${kind}"]`)).toHaveCount(0);
  }
 }finally{if(original===undefined)delete process.env.HOPTRIP_API_URL;else process.env.HOPTRIP_API_URL=original;}
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: warnings stay visible on general-search cards and detail at 320px`,async({page})=>{
 test.setTimeout(90000);
 await page.goto(localizedHref('/deals?destination=weekend-fixture&departure_from=2030-11-01',locale));
 const night=page.locator('.deal-card').filter({has:page.locator('a[href*="/deals/weekend-fixture-night"]')});
 await expect(night.locator('.stay-warning').first()).toBeVisible();
 await expect(night.locator('.stay-warning').first()).toContainText('00:00–06:00');
 const early=page.locator('.deal-card').filter({has:page.locator('a[href*="/deals/weekend-fixture-early"]')});
 await expect(early.locator('.stay-warning').first()).toContainText('08:00');
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.deal-grid').analyze()).violations).toEqual([]);
 await night.locator('.deal-card-link').click();
 await expect(page.locator('.stay-warning').first()).toBeVisible();
 await expect(page.locator('.stay-warning').first()).toContainText('00:00–06:00');
});
