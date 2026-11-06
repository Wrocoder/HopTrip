import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {filterText} from '../src/lib/i18n/filter-copy';
import {destinationTimeCopy} from '../src/lib/destination-time';
import type {Deal} from '../src/lib/api';
const fixture='http://127.0.0.1:8100';
test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/weekend-fixtures?enabled=true`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post(`${fixture}/__test__/weekend-fixtures?enabled=false`);});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: destination sort matches API, detail, history, errors and narrow layout`,async({page,request})=>{
 test.setTimeout(120000);
 const c=destinationTimeCopy[locale];
 await page.goto(localizedHref('/deals?destination=weekend-fixture&sort=price',locale));
 await page.locator('select[name="sort"]').selectOption('destination_time');
 await expect(page).toHaveURL(/sort=destination_time/);
 await expect(page.locator('.filters')).toHaveAttribute('aria-busy','false');
 const response=await request.get(`${fixture}/api/v1/deals?destination=weekend-fixture&sort=destination_time&include_total=true&limit=12`);
 expect(response.ok()).toBe(true);
 const result=await response.json() as {items:Deal[];total:number};
 const slugs=()=>page.locator('.deal-card-link').evaluateAll(links=>links.map(a=>new URL((a as HTMLAnchorElement).href).pathname.split('/').at(-1)));
 expect(await slugs()).toEqual(result.items.map(d=>d.slug));
 await expect(page.locator('.deal-card')).toHaveCount(result.total);
 await expect(page.locator('.deal-card .destination-time').first()).toContainText(c.city);
 await expect(page.locator('.deal-card').filter({has:page.locator('a[href*="weekend-fixture-unknown"]')}).locator('.destination-time')).toContainText(c.unknown);
 await page.locator('.preset-rules > summary').click();
 await expect(page.locator('.sort-explanation')).toContainText(filterText(locale,'Najwięcej czasu na miejscu'));
 expect((await new AxeBuilder({page}).include('.filter-panel').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.deal-card').first().screenshot({path:test.info().outputPath(`${locale}-destination-320.png`)});
 await page.reload();await expect(page.locator('select[name="sort"]')).toHaveValue('destination_time');
 await page.locator('.deal-card-link').first().click();
 await expect(page.locator('.destination-time')).toHaveCount(1);
 await expect(page.locator('.destination-time')).toContainText(c.city);
 await page.locator('.back-link').click();await expect(page.locator('select[name="sort"]')).toHaveValue('destination_time');
 await page.locator('select[name="sort"]').selectOption('price');await expect(page).toHaveURL(/sort=price/);
 await page.goBack();await expect(page.locator('select[name="sort"]')).toHaveValue('destination_time');
 for(const [budget,message] of [['987650',c.broad],['987649',c.unsupported]]){
  await page.goto(localizedHref(`/deals?sort=destination_time&budget=${budget}`,locale));
  await expect(page.locator('[data-state="error"]')).toContainText(message);
  await expect(page.locator('.deal-card')).toHaveCount(0);
 }
});
