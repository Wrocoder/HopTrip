import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {getMessages} from '../src/lib/i18n/messages';
import {filterText} from '../src/lib/i18n/filter-copy';
import {tripQualityCopy,tripQualitySummary} from '../src/lib/trip-quality';
import type {DealResults} from '../src/lib/api';
const fixture='http://127.0.0.1:8100';
const slugs=(page:Page)=>page.locator('.deal-card-link').evaluateAll(links=>links.map(link=>new URL((link as HTMLAnchorElement).href).pathname.split('/').at(-1)));
test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/weekend-fixtures?enabled=true&recommendations=true`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post(`${fixture}/__test__/weekend-fixtures?enabled=false`);});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: recommended order, pagination, history and independent model`,async({page,request},info)=>{
 test.setTimeout(120000);
 const response=await request.get(`${fixture}/api/v1/deals?origin=WRO&sort=recommended&include_total=true&limit=100`);
 expect(response.ok()).toBe(true);const result:DealResults=await response.json();expect(result.total).toBeGreaterThan(12);
 const evening=result.items.find(d=>d.slug==='weekend-fixture-evening')!;
 const monday=result.items.find(d=>d.slug==='weekend-fixture-monday')!;
 expect(evening.trip_quality_score!).toBeGreaterThan(monday.trip_quality_score!);
 await page.goto(localizedHref('/deals?origin=WRO&sort=recommended',locale));
 const select=page.locator('select[name="sort"]');
 await expect(select).toHaveValue('recommended');
 await expect(select.locator('option[value="recommended"]')).toHaveText(filterText(locale,'Polecane'));
 await expect(page.locator('.deal-card')).toHaveCount(12);
 expect(await slugs(page)).toEqual(result.items.slice(0,12).map(d=>d.slug));
 for(const [index,deal] of result.items.slice(0,12).entries()){
  expect(deal.trip_quality_score).toBe(deal.trip_quality?.score);
  await expect(page.locator('.deal-card').nth(index).locator('.trip-quality-summary')).toHaveText(tripQualitySummary(deal,locale)!);
 }
 await page.locator('.preset-rules > summary').click();
 await expect(page.locator('.sort-explanation')).toContainText(filterText(locale,'Polecane'));
 await page.getByRole('link',{name:getMessages(locale).next,exact:true}).click();
 await expect(page).toHaveURL(/sort=recommended/);await expect(page).toHaveURL(/offset=12/);
 await expect(page.locator('.deal-card')).toHaveCount(result.items.slice(12,24).length);
 expect(await slugs(page)).toEqual(result.items.slice(12,24).map(d=>d.slug));
 await page.reload();await expect(select).toHaveValue('recommended');
 await page.goBack();await expect(page).not.toHaveURL(/offset=/);
 await expect(page.locator('.deal-card')).toHaveCount(12);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.filter-panel').include('.deal-grid').analyze()).violations).toEqual([]);
 await page.locator('.deal-card').first().screenshot({path:info.outputPath(`trip-quality-${locale}-320.png`)});
 const first=result.items[0];await page.locator('.deal-card-link').first().click();
 await expect(page).toHaveURL(new RegExp(`/deals/${first.slug}(?:\\?|$)`));
 await expect(page.locator('.detail-summary .trip-quality-summary')).toHaveText(tripQualitySummary(first,locale)!);
});

test('recommended errors are explicit and price sorting remains available',async({page})=>{
 for(const [budget,copy] of [['987648',tripQualityCopy.en.broad],['987647',tripQualityCopy.en.unsupported]]){
  await page.goto(`/en/deals?sort=recommended&budget=${budget}`);
  await expect(page.locator('[data-state="error"]')).toContainText(copy);
  await expect(page.locator('.deal-card')).toHaveCount(0);
 }
 await page.locator('select[name="sort"]').selectOption('price');await expect(page).toHaveURL(/sort=price/);
 await expect(page.locator('.deal-card').first()).toBeVisible();
});
test('recommended order and convenience labels render without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:info.project.use.baseURL});
 try{
  const page=await context.newPage();await page.goto('/en/deals?destination=weekend-fixture&sort=recommended');
  await expect(page.locator('select[name="sort"]')).toHaveValue('recommended');
  await expect(page.locator('.trip-quality-summary').first()).toContainText(tripQualityCopy.en.label);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^noindex,/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/sort=recommended/);
 }finally{await context.close();}
});
