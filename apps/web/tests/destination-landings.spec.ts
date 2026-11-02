import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import config from '../playwright.config';
import {localizedHref} from '../src/lib/i18n/routing';
import {destinationCopy} from '../src/lib/i18n/destination-copy';
const servers=config.webServer;
if(!Array.isArray(servers)||!servers[0]?.url)throw new Error('Fixture API URL required');
const api=new URL(servers[0].url).origin;
test.afterEach(async({request})=>{expect((await request.post(`${api}/__test__/catalog-state?unavailable=false`)).ok()).toBe(true);});

for(const locale of ['pl','en','ru','uk'] as const)test(`destination remains useful without offers in ${locale}`,async({page,request},info)=>{
 test.setTimeout(90000);
 if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(localizedHref('/destinations/milan',locale));expect(response?.status()).toBe(200);
 await expect(page.locator('main h1')).toHaveCount(1);
 await expect(page.locator('[data-state="empty"]')).toContainText(destinationCopy[locale].empty);
 await expect(page.locator('.deal-card')).toHaveCount(0);
 const planning=page.locator('[data-destination-planning]');await expect(planning).toContainText('IT');
 await expect(planning.getByRole('link',{name:destinationCopy[locale].source})).toHaveAttribute('href',/^https:\/\/www2\.comune\.milano\.it\//);
 await expect(page.locator('[data-destination-guides] .related-reason')).toHaveCount(2);
 await expect(page.locator('[data-destination-guides] a').first()).toHaveAttribute('href',localizedHref('/info/milan-weekend',locale));
 await expect(page.locator('[data-destination-search]').first()).toHaveAttribute('href',localizedHref('/deals?destination=milan',locale));
 await expect(page.locator('main a[href*="/city-break?destination=milan"]')).not.toHaveCount(0);
 await expect(page.locator('[data-destination-attractions]')).toHaveAttribute('href',localizedHref('/info/milan-weekend#destination-activities',locale));
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(localizedHref('/destinations/milan',locale),info.project.use.baseURL).href);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
 expect((await new AxeBuilder({page}).include('[data-destination-planning]').include('[data-destination-guides]').include('[data-state="empty"]').analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl'){
  await planning.evaluate(element=>window.scrollTo(0,scrollY+element.getBoundingClientRect().top-16));
  await page.screenshot({path:info.outputPath('planning.png'),scale:'css'});
 }
 // Native href navigation is verified without script in the separate test below.
 expect((await request.post(`${api}/__test__/catalog-state?unavailable=true`)).ok()).toBe(true);
 await page.goto(localizedHref('/destinations/milan',locale));
 await expect(page.locator('[data-state="error"] h1')).toHaveCount(1);
 await expect(page.locator('[data-state="empty"],[data-destination-attractions]')).toHaveCount(0);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^noindex/);
 expect((await request.post(`${api}/__test__/catalog-state?unavailable=false`)).ok()).toBe(true);
 await page.goto(localizedHref('/destinations/milan',locale));await expect(page.locator('[data-state="empty"]')).toBeVisible();
 expect(errors).toEqual([]);
});

test.describe('ordinary browser without JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('empty and populated destinations have honest content and working search links',async({page},info)=>{
  test.setTimeout(90000);
  if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
  for(const [slug,index,hasOffers] of [['milan',true,false],['barcelona',false,true],['rome',false,false]] as const){
   expect((await page.goto(`/destinations/${slug}`))?.status()).toBe(200);
   await expect(page.locator('main h1')).toHaveCount(1);
   await expect(page.locator('[data-destination-planning]')).toBeVisible();
   await expect(page.locator('[data-destination-guides] .related-reason').first()).toBeVisible();
   await expect(page.locator('[data-destination-attractions]')).toBeVisible();
   if(hasOffers){await expect(page.locator('.deal-card').first()).toBeVisible();await expect(page.locator('[data-state="empty"]')).toHaveCount(0);}
   else{await expect(page.locator('[data-state="empty"]')).toBeVisible();await expect(page.locator('.deal-card')).toHaveCount(0);}
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',index?'index, follow':'noindex, follow');
   const attractions=page.locator('[data-destination-attractions]'),guideURL=new URL((await attractions.getAttribute('href'))!,info.project.use.baseURL).href;
   await Promise.all([page.waitForURL(guideURL),attractions.click()]);
   await expect(page.locator('#destination-activities')).toBeVisible();
   const external=page.locator('#destination-activities a[target="_blank"]');expect(await external.count()).toBeGreaterThan(0);
   for(const rel of await external.evaluateAll(elements=>elements.map(el=>el.getAttribute('rel')!))){expect(rel).toContain('noopener');expect(rel).toContain('noreferrer');}
   await page.goto(`/destinations/${slug}`);
   const search=page.locator('[data-destination-search]').first();
   await expect(search).toHaveAttribute('href',`/deals?destination=${slug}`);
   const expected=new URL(`/deals?destination=${slug}`,info.project.use.baseURL).href;
   await Promise.all([page.waitForURL(expected),search.click()]);await expect(page).toHaveURL(expected);
   await expect(page.locator('.result-count')).toBeVisible();
  }
 });
});
