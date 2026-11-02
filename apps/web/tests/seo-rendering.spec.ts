import {test,expect} from '@playwright/test';
import {localizedHref} from '../src/lib/i18n/routing';
test.use({javaScriptEnabled:false});
for(const locale of ['pl','en','ru','uk'] as const)test(`catalog is visible without script in ${locale}`,async({page},info)=>{
 test.setTimeout(90000);
 const states=[];
 for(const path of ['/deals','/city-break','/deals?origin=WRO&budget=987654']){
  const response=await page.goto(localizedHref(path,locale));
  expect(response?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('.filters')).toBeVisible();
  await expect(page.locator('.result-count')).toBeVisible();
  await expect(page.locator('[data-state="loading"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  expect(await page.locator('link[rel="alternate"][hreflang]').count()).toBe(5);
  states.push({path,status:response?.status(),title:await page.title(),canonical:await page.locator('link[rel="canonical"]').getAttribute('href'),cards:await page.locator('.deal-card').count()});
 }
 await info.attach('no-script-seo',{body:JSON.stringify(states,null,2),contentType:'application/json'});
 if(locale==='pl')await page.screenshot({path:info.outputPath('no-script.png'),scale:'css'});
});
