import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {collectionCopy} from '../src/lib/i18n/collection-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import type {Deal} from '../src/lib/api';
const fixture='http://127.0.0.1:8100';

test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/short-trips?enabled=true`)).ok()).toBe(true);
 expect((await request.post(`${fixture}/__test__/connection-fixtures?enabled=true`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{
 await request.post(`${fixture}/__test__/connection-fixtures?enabled=false`);
 await request.post(`${fixture}/__test__/short-trips?enabled=false`);
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: factual previews exclude risky connections and retain a clear route to the full catalog`,async({page,request},info)=>{
 test.setTimeout(120000);
 const response=await request.get(`${fixture}/api/v1/deals?destination=connection-fixture&limit=100`);
 expect(response.ok()).toBe(true);
 const rows:Deal[]=await response.json();
 expect(rows.some(row=>row.trip_quality?.recommendation?.reasons.includes('OVERNIGHT_CONNECTION'))).toBe(true);
 expect(rows.some(row=>row.trip_quality?.recommendation?.reasons.includes('LONG_CONNECTION'))).toBe(true);
 expect(rows.every(row=>row.trip_quality?.recommendation?.planning_eligible===false)).toBe(true);
 await page.goto(localizedHref('/?origin=WAW',locale));
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(6);
 await expect(page.locator('.catalog-section')).toContainText(collectionCopy[locale].preview);
 await page.goto(localizedHref('/?origin=WRO',locale));
 await expect(page.locator('.catalog-section .deal-card')).toHaveCount(0);
 await expect(page.locator('.catalog-section')).toContainText(collectionCopy[locale].empty);
 await expect(page.locator('.home-collections [data-state="empty"]')).toHaveCount(3);
 await expect(page.locator('.home-collections .deal-card')).toHaveCount(0);
 await expect(page.locator('[data-collection="upcoming-short"]')).toContainText(collectionCopy[locale].criteria['upcoming-short']);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.catalog-section').include('.home-collections').analyze()).violations).toEqual([]);
 await page.locator('.home-collections').screenshot({path:info.outputPath(`empty-selection-${locale}-320.png`)});
 await page.locator('[data-collection="upcoming-short"]').getByRole('link').click();
 await expect(page).toHaveURL(/sort=departure/);
 await expect(page.locator('.deal-card-link[href*="connection-fixture-"]').first()).toBeVisible();
 for(const route of ['/city-break?destination=connection-fixture','/tanie-loty-na-weekend?destination=connection-fixture']){
  await page.goto(localizedHref(route,locale));
  await expect(page.locator('.deal-card-link[href*="connection-fixture-"]').first()).toBeVisible();
 }
});
