import {test,expect} from '@playwright/test';
import {localizedHref} from '../src/lib/i18n/routing';
test.use({javaScriptEnabled:false,viewport:{width:320,height:844}});
for(const locale of ['pl','en','ru','uk'] as const)test(`guide structured data matches rendered breadcrumbs in ${locale}`,async({page},info)=>{
 await page.goto(localizedHref('/info/trip-budget',locale));
 await expect(page.locator('main h1')).toHaveCount(1);await expect(page.locator('main h1')).toBeVisible();
 const data=JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
 expect(data['@type']).toBe('BreadcrumbList');expect(data.itemListElement).toHaveLength(3);
 const names=await page.locator('.breadcrumbs li').allTextContents();
 const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');
 for(const [index,item] of data.itemListElement.entries()){
  expect(item.position).toBe(index+1);expect(item.name).toBe(names[index]);
  expect(new URL(item.item).origin).toBe(new URL(info.project.use.baseURL!).origin);
 }
 expect(data.itemListElement[2].item).toBe(canonical);
 expect(data.aggregateRating).toBeUndefined();expect(data.offers).toBeUndefined();
});
