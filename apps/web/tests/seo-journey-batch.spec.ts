import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {guideUi} from '../src/lib/i18n/guide-ui';

for(const locale of ['pl','en','ru','uk'] as const)test(`SEO batch ${locale}: guide journey, preserved origin and bounded KRK preview`,async({page,request},info)=>{
 test.setTimeout(120000);await page.setViewportSize({width:info.project.name==='mobile'?320:1280,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const errors:string[]=[],analytics:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/api/v1/analytics/events'))analytics.push(r.url());});
 for(const slug of ['alicante-airport','malaga-airport','lisbon-airport']){
  await page.goto(localizedHref('/info/'+slug,locale));
  const summary=page.locator('[data-alicante-arrival],[data-airport-arrival]');
  await expect(summary.locator(`a[href="${localizedHref('/info/trip-budget#calculator',locale)}"]`)).toHaveCount(1);
  const photo=page.locator('[data-article-photo="cover"] img');await expect(photo).toHaveAttribute('loading','lazy');
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(0);
  await photo.scrollIntoViewIfNeeded();await expect.poll(()=>photo.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 }
 for(const slug of ['alicante-weekend','malaga-weekend','lisbon-3-days','rome-3-days']){
  const path=localizedHref('/info/'+slug,locale),response=await request.get(path),html=await response.text();expect(response.status()).toBe(200);
  expect(html.indexOf('data-guide-journey')).toBeGreaterThan(0);expect(html.indexOf('data-guide-journey')).toBeLessThan(html.indexOf('data-article-photo="cover"'));
  await page.goto(path);const nav=page.locator('[data-guide-journey]');await expect(nav).toHaveCount(1);
  const budget=nav.locator(`a[href="${localizedHref('/info/trip-budget#calculator',locale)}"]`);await expect(budget).toHaveCount(1);
  await budget.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/info\/trip-budget#calculator$/);
 }
 await page.goto(localizedHref('/from/KRK',locale));
 await expect(page.locator('.deal-card')).toHaveCount(Math.min(12,(await(await request.get('http://127.0.0.1:8100/api/v1/deals?origin=KRK&limit=100')).json()).length));
 await expect(page.locator(`a[href="${localizedHref('/deals?origin=KRK',locale)}"]`)).not.toHaveCount(0);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100'+localizedHref('/from/KRK',locale));
 await page.goto(localizedHref('/tanie-loty-na-weekend?origin=KRK&budget=300&destination=rome',locale));
 const shortcuts=page.getByRole('navigation',{name:locale==='pl'?'Zaplanuj podróż':locale==='en'?'Plan your trip':locale==='ru'?'Спланируйте поездку':'Сплануйте подорож',exact:true});
 await expect(shortcuts).toHaveCount(1);
 const noLeave=shortcuts.locator('a[href*="weekend_mode=no-leave-v1"]');
 const target=new URL((await noLeave.getAttribute('href'))!,'http://127.0.0.1:3100');
 expect(target.pathname).toBe(localizedHref('/tanie-loty-na-weekend',locale));
 expect(Object.fromEntries(target.searchParams)).toMatchObject({weekend_mode:'no-leave-v1',origin:'KRK',budget:'300',destination:'rome'});
 expect(target.searchParams.has('weekend')).toBe(false);
 expect(await shortcuts.evaluate(el=>!!el.compareDocumentPosition(document.querySelector('#search-filters')!)&&(el.compareDocumentPosition(document.querySelector('#search-filters')!)&Node.DOCUMENT_POSITION_FOLLOWING)!==0)).toBe(true);
 await noLeave.click();await expect(page).toHaveURL(/weekend_mode=no-leave-v1/);await expect(page).toHaveURL(/origin=KRK/);
 expect(new URL(page.url()).searchParams.get('budget')).toBe('300');expect(new URL(page.url()).searchParams.get('destination')).toBe('rome');
 await expect(page.locator('[name="weekend_mode"]')).toHaveValue('no-leave-v1');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('.route-link-grid').analyze()).violations).toEqual([]);
 expect(errors).toEqual([]);expect(analytics).toEqual([]);
 await info.attach('contract',{body:JSON.stringify({locale,guideBudgetLabel:guideUi(locale,'budgetLink'),analytics:'existing PAGE_VIEW/SEARCH_RESULT only; denial sends none'}),contentType:'application/json'});
});

test('journey links, scoped sitemap dates and previews are available without JavaScript',async({browser,request})=>{
 const context=await browser.newContext({baseURL:'http://127.0.0.1:3100',javaScriptEnabled:false});
 try{const page=await context.newPage();await page.goto('/info/rome-3-days');await page.locator('[data-guide-journey] a[href="/info/trip-budget#calculator"]').click();await expect(page).toHaveURL(/trip-budget#calculator$/);
  const sitemap=await(await request.get('/sitemap.xml')).text();expect(sitemap).toContain('2026-11-07');
  await page.goto('/from/KRK');expect(await page.locator('.deal-card').count()).toBeLessThanOrEqual(12);
 }finally{await context.close();}
});

test('technical indexability sample preserves reviewed index/noindex and sitemap policy',async({browser,request})=>{
 test.setTimeout(120000);
 const context=await browser.newContext({baseURL:'http://127.0.0.1:3100',javaScriptEnabled:false});
 const paths=['/','/info','/info/alicante-airport','/info/malaga-airport','/info/lisbon-airport','/info/valencia-airport','/info/copenhagen-airport','/info/porto-airport','/info/stockholm-airports','/info/wmi-airport','/info/baggage','/from/KRK','/routes/krakow-rome','/tanie-loty-na-weekend','/destinations/rome'];
 try{
  const page=await context.newPage(),sitemap=await(await request.get('/sitemap.xml')).text();
  const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match=>new URL(match[1]).href);
  for(const path of paths){
   expect((await page.goto(path))?.status()).toBe(200);await expect(page.locator('h1')).toHaveCount(1);
   const canonical=page.locator('link[rel="canonical"]');await expect(canonical).toHaveCount(1);
   expect(new URL((await canonical.getAttribute('href'))!).href).toBe(new URL(path,'http://127.0.0.1:3100').href);
   const indexed=path!=='/destinations/rome';
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',indexed?'index, follow':'noindex, follow');
   if(indexed)expect(urls).toContain(new URL(path,'http://127.0.0.1:3100').href);
   else expect(urls).not.toContain(new URL(path,'http://127.0.0.1:3100').href);
  }
  await page.goto('/deals?origin=KRK');await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','noindex, follow');
  expect((await(await request.get('/robots.txt')).text())).toContain('Sitemap: http://127.0.0.1:3100/sitemap.xml');
 }finally{await context.close();}
});
