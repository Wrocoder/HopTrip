import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {homeCollectionDefinitions,loadHomeCollections,collectionsMatchOrigin} from '../src/lib/home-collections';
import {localizedHref} from '../src/lib/i18n/routing';
import {getMessages} from '../src/lib/i18n/messages';
import {filterText} from '../src/lib/i18n/filter-copy';
const fixture='http://127.0.0.1:8100';
test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/short-trips?enabled=true`)).ok()).toBe(true);
 expect((await request.post(`${fixture}/__test__/weekend-fixtures?enabled=true`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{
 await request.post(`${fixture}/__test__/short-trips?enabled=false`);
 await request.post(`${fixture}/__test__/weekend-fixtures?enabled=false`);
});
test('collection loader uses the real catalog and retains independent states and origin',async()=>{
 const original=process.env.HOPTRIP_API_URL;process.env.HOPTRIP_API_URL=fixture;
 try{
  const wro=await loadHomeCollections('WRO');
  expect(collectionsMatchOrigin(wro,'WRO')).toBe(true);
  expect(wro.map(c=>c.status)).toEqual(['READY','READY','READY']);
  for(const collection of wro){
   expect(collection.offers.length).toBeGreaterThan(0);expect(collection.offers.length).toBeLessThanOrEqual(3);
   for(const deal of collection.offers){expect(deal.origin_code).toBe('WRO');expect(deal.trip_type).toBe('ROUND_TRIP');expect(deal.flight_quality?.recommendation_eligible).toBe(true);}
  }
  const gdansk=await loadHomeCollections('GDN');
  expect(collectionsMatchOrigin(gdansk,'GDN')).toBe(true);expect(gdansk.every(c=>c.status==='EMPTY')).toBe(true);
  expect(collectionsMatchOrigin(wro,'GDN')).toBe(false);
 }finally{if(original===undefined)delete process.env.HOPTRIP_API_URL;else process.env.HOPTRIP_API_URL=original;}
});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: collection catalog URL preserves the round-trip constraint through form and chips`,async({page,request})=>{
 test.setTimeout(90000);
 const collection=homeCollectionDefinitions('KTW').find(c=>c.id==='under-300')!;
 await page.goto(localizedHref(collection.href,locale));
 await expect(page.locator('.deal-card')).toHaveCount(2);
 const roundTripChip=page.locator('.filter-chip').filter({hasText:filterText(locale,'Rodzaj lotu')});
 await expect(roundTripChip).toHaveText(new RegExp(getMessages(locale).roundTrip));
 await expect(page.locator('.filters input[name="round_trip"]')).toHaveValue('true');
 await page.locator('input[name="budget"]').fill('299');
 await page.locator('.filters').getByRole('button',{name:getMessages(locale).filter,exact:true}).click();
 await expect(page.locator('.filters')).toHaveAttribute('aria-busy','false',{timeout:30000});
 await expect(page).toHaveURL(/round_trip=true/);await expect(page).toHaveURL(/budget=299/);
 const response=await request.get(`${fixture}/api/v1/deals?origin=KTW&round_trip=true&budget=299&duration_min=2&duration_max=4`);
 expect(response.ok()).toBe(true);expect((await response.json()).every((d:{trip_type:string})=>d.trip_type==='ROUND_TRIP')).toBe(true);
 await roundTripChip.click();await expect(page).not.toHaveURL(/round_trip=/);
 await expect(page).toHaveURL(/budget=299/);await expect(page).toHaveURL(/origin=KTW/);
 await page.goBack();await expect(page.locator('.filters input[name="round_trip"]')).toHaveValue('true');
 expect((await new AxeBuilder({page}).include('.filter-panel').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
