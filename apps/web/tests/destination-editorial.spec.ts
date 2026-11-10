import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {destinationEditorial} from '../src/lib/destination-editorial';
import {localizedHref} from '../src/lib/i18n/routing';
import {destinationCopy} from '../src/lib/i18n/destination-copy';
test.beforeEach(async({page,request})=>{
 expect((await request.post('http://127.0.0.1:8100/__test__/destination-images?slug=berlin&slug=aalesund&empty_offers=true')).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post('http://127.0.0.1:8100/__test__/destination-images');});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: pilot city information remains useful without flight offers`,async({page,request},info)=>{
 test.setTimeout(120000);
 for(const slug of ['berlin','aalesund']){
  const path=localizedHref('/destinations/'+slug,locale),profile=destinationEditorial[slug];
  expect((await page.goto(path))?.status()).toBe(200);
  await expect(page.locator('[data-destination-editorial]')).toContainText(profile.logistics.text[locale]);
  await expect(page.locator('[data-destination-season]')).toHaveText(profile.season.text[locale]);
  await expect(page.locator('[data-destination-planning] time')).toHaveCount(2);
  await expect(page.locator(`a[href="${profile.logistics.source}"]`)).toBeVisible();
  await expect(page.locator(`a[href="${profile.season.source}"]`)).toBeVisible();
  await expect(page.locator('.deal-card')).toHaveCount(0);
  await expect(page.getByText(destinationCopy[locale].empty,{exact:true})).toBeVisible();
  await expect(page.locator('[data-destination-search]').first()).toHaveAttribute('href',localizedHref('/deals?destination='+slug,locale));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(path,info.project.use.baseURL).href);
  await expect(page.locator('link[hreflang]')).toHaveCount(5);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
  expect(await(await request.get('/sitemap.xml')).text()).not.toContain('/destinations/'+slug+'</loc>');
  await page.setViewportSize({width:320,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect((await new AxeBuilder({page}).include('[data-destination-planning]').analyze()).violations).toEqual([]);
  await page.locator('[data-destination-planning]').screenshot({path:info.outputPath(`${slug}-${locale}.png`)});
 }
});
test('pilot information and sources are readable without JavaScript',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:info.project.use.baseURL});
 try{
  const page=await context.newPage();
  for(const slug of ['berlin','aalesund']){
   await page.goto('/en/destinations/'+slug);
   await expect(page.locator('[data-destination-editorial]')).toContainText(destinationEditorial[slug].logistics.text.en);
   await expect(page.locator('[data-destination-season]')).toContainText(destinationEditorial[slug].season.text.en);
  }
 }finally{await context.close();}
});
