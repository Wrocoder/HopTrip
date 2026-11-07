import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {collectionCopy} from '../src/lib/i18n/collection-copy';
import {imageryCopy,destinationImages} from '../src/lib/destination-imagery';
import {homeCollectionDefinitions,homeCollectionIds} from '../src/lib/home-collections';
import {localizedHref} from '../src/lib/i18n/routing';
import {chooseOrigin} from './origin-helpers';
import {writeFileSync} from 'node:fs';

const fixture='http://127.0.0.1:8100';
test.setTimeout(90000);
test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/short-trips?enabled=true`)).ok()).toBe(true);
 expect((await request.post(`${fixture}/__test__/weekend-fixtures?enabled=true`)).ok()).toBe(true);
 expect((await request.post(`${fixture}/__test__/home-collections?scenario=normal`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{
 await request.post(`${fixture}/__test__/home-collections?scenario=normal`);
 await request.post(`${fixture}/__test__/weekend-fixtures?enabled=false`);
 await request.post(`${fixture}/__test__/short-trips?enabled=false`);
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: real previews, criteria, photos, essential conditions and catalog CTA`,async({page,request},info)=>{
 const errors:string[]=[],analytics:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.url().includes('/api/v1/analytics/events'))analytics.push(request.url());});
 await page.goto(localizedHref('/?origin=KTW',locale));
 const section=page.locator('.home-collections'),copy=collectionCopy[locale];
 await expect(section).toHaveAttribute('aria-busy','false');
 await expect(section).toContainText(copy.preview);
 for(const definition of homeCollectionDefinitions('KTW')){
  const collection=section.locator(`[data-collection="${definition.id}"]`);
  await expect(collection.getByRole('heading',{name:copy.titles[definition.id],exact:true})).toBeVisible();
  await expect(collection).toContainText(copy.criteria[definition.id]);
  await expect(collection.getByRole('link',{name:new RegExp(copy.search)})).toHaveAttribute('href',localizedHref(definition.href,locale));
  const response=await request.get(`${fixture}/api/v1/deals?${new URLSearchParams({...definition.filters,limit:'100'})}`);
  expect(response.ok()).toBe(true);
  const eligible=(await response.json()).filter((row:{flight_quality?:{recommendation_eligible:boolean}})=>row.flight_quality?.recommendation_eligible);
  await expect(collection).toHaveAttribute('data-state',eligible.length?'ready':'empty');
  await expect(collection.locator('.deal-card')).toHaveCount(Math.min(3,eligible.length));
 }
 const budget=section.locator('[data-collection="under-300"]');
 for(const card of await budget.locator('.deal-card').all()){
  await expect(card.locator('.deal-origin')).toContainText('KTW');
  await expect(card.locator('.deal-price')).toContainText(locale==='pl'?'zł':'PLN');
  await expect(card.locator('.flight-cost-scope')).toBeVisible();
  await expect(card.locator('.flight-baggage-scope')).toBeVisible();
  await expect(card.locator('.flight-schedule')).toBeVisible();
 }
 const photo=budget.getByAltText(destinationImages.barcelona.alt[locale]).first();
 await expect(photo).toHaveAttribute('loading','lazy');await expect(photo).toHaveAttribute('width','960');await expect(photo).toHaveAttribute('height','600');
 await expect(photo).toHaveAttribute('sizes',/max-width/);await expect(photo).toHaveAttribute('srcset',/640w/);
 expect(await page.locator('link[rel="preload"][as="image"]').count()).toBe(0);
 await photo.scrollIntoViewIfNeeded();await expect.poll(()=>photo.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 const box=await photo.boundingBox();expect(box!.width/box!.height).toBeCloseTo(1.6,1);
 const credit=budget.locator('summary').filter({hasText:'essetefano'}).first();await credit.focus();await credit.press('Enter');
 await expect(budget.getByRole('link',{name:destinationImages.barcelona.title,exact:true}).first()).toHaveAttribute('href',destinationImages.barcelona.source);
 await expect(budget.getByRole('link',{name:'CC BY 3.0',exact:true}).first()).toHaveAttribute('href',destinationImages.barcelona.licenseUrl);
 expect((await new AxeBuilder({page}).include('.home-collections').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await budget.screenshot({path:info.outputPath('budget-320.png'),animations:'disabled'});
 const cta=budget.getByRole('link',{name:new RegExp(copy.search)});await cta.focus();await cta.press('Enter');
 await expect(page).toHaveURL(new RegExp(localizedHref('/deals',locale)+'\\?'));
 const query=new URL(page.url()).searchParams;
 expect(Object.fromEntries(query)).toMatchObject({origin:'KTW',round_trip:'true',budget:'300',duration_min:'2',duration_max:'4',sort:'price'});
 await expect(page.locator('.deal-card')).toHaveCount(2);expect(errors).toEqual([]);expect(analytics).toEqual([]);
});

test('origin transitions hide previous snapshots, last selection wins and Back restores the right offers',async({page,request})=>{
 await request.post(`${fixture}/__test__/home-collections?scenario=delay`);
 await page.goto('/?origin=KTW');
 const section=page.locator('.home-collections'),input=page.locator('#home-origin');
 await expect(section.locator('.deal-card').first()).toBeVisible();
 await input.fill('GDN');await input.press('ArrowDown');await input.press('Enter');
 await expect(section).toHaveAttribute('aria-busy','true');await expect(section.locator('[data-collection]')).toHaveCount(0);
 await input.fill('WAW');await input.press('ArrowDown');await input.press('Enter');
 await expect(page).toHaveURL(/origin=WAW/);await expect(section).toHaveAttribute('aria-busy','false');
 for(const origin of await section.locator('.deal-origin').allTextContents())expect(origin).toContain('WAW');
 for(const link of await section.locator('[data-collection] > div > a').all())expect(new URL((await link.getAttribute('href'))!,'http://local').searchParams.get('origin')).toBe('WAW');
 await chooseOrigin(page,'GDN');await expect(section).toHaveAttribute('aria-busy','false');
 await expect(section.locator('[data-state="empty"]')).toHaveCount(3);await expect(section.locator('.deal-card')).toHaveCount(0);
 await page.goBack();await expect(page).toHaveURL(/origin=WAW/);await expect(section).toHaveAttribute('aria-busy','false');
 for(const origin of await section.locator('.deal-origin').allTextContents())expect(origin).toContain('WAW');
 await page.reload();await expect(section).toHaveAttribute('aria-busy','false');await expect(section.locator('.deal-card').first()).toBeVisible();
 for(const origin of await section.locator('.deal-origin').allTextContents())expect(origin).toContain('WAW');
 await chooseOrigin(page,'');await expect(section).toHaveAttribute('aria-busy','false');await expect(section.locator('.deal-card').first()).toBeVisible();
 for(const link of await section.locator('[data-collection] > div > a').all())expect(new URL((await link.getAttribute('href'))!,'http://local').searchParams.has('origin')).toBe(false);
});

test('one real offer per preview needs no filler and missing licensed image keeps the flight action',async({page,request})=>{
 await page.route('**/_next/image?*',route=>route.abort('failed'));
 await request.post(`${fixture}/__test__/home-collections?scenario=one`);
 await page.goto('/?origin=WRO');
 for(const id of homeCollectionIds){
  const collection=page.locator(`[data-collection="${id}"]`);
  await expect(collection).toHaveAttribute('data-state','ready');await expect(collection.locator('.deal-card')).toHaveCount(1);
 }
 const weekend=page.locator('[data-collection="calendar-weekend"]');
 await expect(weekend.getByText(imageryCopy.pl.unavailable,{exact:true})).toBeVisible();await expect(weekend.locator('img:not(.country-flag)')).toHaveCount(0);
 await weekend.locator('.deal-card-link').click();await expect(page).toHaveURL(/\/deals\/weekend-fixture-/);
});

for(const scenario of ['weekend-error','weekend-broad'] as const)test(`${scenario}: independent errors preserve other previews and retry recovers`,async({page,request})=>{
 await request.post(`${fixture}/__test__/home-collections?scenario=${scenario}`);await page.goto('/?origin=WRO');
 const weekend=page.locator('[data-collection="calendar-weekend"]');await expect(weekend).toHaveAttribute('data-state','error');
 await expect(weekend.getByRole('alert')).toHaveText(scenario==='weekend-broad'?collectionCopy.pl.tooBroad:collectionCopy.pl.error);
 await expect(weekend.locator('.deal-card')).toHaveCount(0);await expect(page.locator('.home-collections [data-state="ready"]')).toHaveCount(2);
 await request.post(`${fixture}/__test__/home-collections?scenario=normal`);await weekend.getByRole('button',{name:collectionCopy.pl.refresh}).click();
 await expect(weekend).toHaveAttribute('data-state','ready');await expect(page.locator('.home-collections [data-state="ready"]')).toHaveCount(3);
});

test('failed photo preserves frame, credit, conditions and the real offer action',async({page},info)=>{
 await page.route('**/_next/image?*',route=>route.abort('failed'));await page.goto('/?origin=KTW');
 const collection=page.locator('[data-collection="under-300"]');await collection.scrollIntoViewIfNeeded();
 await expect(collection.getByText(imageryCopy.pl.unavailable,{exact:true})).toHaveCount(2);await expect(collection.locator('img:not(.country-flag)')).toHaveCount(0);
 await expect(collection.locator('summary').filter({hasText:'essetefano'})).toHaveCount(2);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await collection.screenshot({path:info.outputPath('failed-photo-320.png'),animations:'disabled'});
 await collection.locator('.deal-card-link').first().click();await expect(page).toHaveURL(/\/deals\/short-KTW-/);
});

test('collection photos stay below the first screen and reserve their space while loading',async({page},info)=>{
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
 await page.route('**/_next/image?*',async route=>{await gate;await route.continue();});
 try{
  await page.goto('/?origin=KTW',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.hero button[type="submit"]')).toBeEnabled();
  const photo=page.locator('[data-collection="under-300"]').getByAltText(destinationImages.barcelona.alt.pl).first();
  const initial=await photo.boundingBox();expect(initial!.y).toBeGreaterThan(page.viewportSize()!.height);
  expect(await page.locator('link[rel="preload"][as="image"]').count()).toBe(0);
  await photo.scrollIntoViewIfNeeded();const before=await photo.boundingBox();
  expect(before!.width/before!.height).toBeCloseTo(1.6,1);expect(await photo.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(0);
  release();await expect.poll(()=>photo.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const after=await photo.boundingBox();expect(after!.width).toBeCloseTo(before!.width,1);expect(after!.height).toBeCloseTo(before!.height,1);
  writeFileSync(info.outputPath('photo-layout.json'),JSON.stringify({viewport:page.viewportSize(),initial,before,after},null,2));
 }finally{release();}
});

test('expiry invalidates a preview without presenting stale prices as current availability',async({page,request})=>{
 await page.clock.install();await request.post(`${fixture}/__test__/home-collections?scenario=expiring`);
 await page.goto('/?origin=KTW');const section=page.locator('.home-collections');
 await expect(section.locator('[data-collection="under-300"]')).toHaveAttribute('data-state','ready');
 const ready=await section.locator('[data-state="ready"]').count();expect(ready).toBeGreaterThanOrEqual(2);
 await page.clock.fastForward(20000);await expect(section.locator('[data-state="unavailable"]')).toHaveCount(ready);
 await expect(section.locator('.deal-card')).toHaveCount(0);await expect(section.getByText(collectionCopy.pl.expired,{exact:true})).toHaveCount(ready);
 await expect(section.locator('[data-state="empty"]')).toHaveCount(3-ready);
});

test('collection and flight links are present without JavaScript in all four locales',async({browser},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:info.project.use.baseURL});
 try{const page=await context.newPage();for(const locale of ['pl','en','ru','uk'] as const){
  const response=await page.goto(localizedHref('/?origin=KTW',locale));expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',String(info.project.use.baseURL)+(locale==='pl'?'':localizedHref('/',locale)));
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index,/);
  for(const definition of homeCollectionDefinitions('KTW'))await expect(page.locator(`[data-collection="${definition.id}"] > div > a`)).toHaveAttribute('href',localizedHref(definition.href,locale));
  await expect(page.locator('[data-collection="under-300"] .deal-card-link')).toHaveCount(2);
  await expect(page.locator('[data-collection="upcoming-short"] .deal-card-link')).toHaveCount(2);
  expect((await response!.text()).includes('data-collection="under-300"')).toBe(true);
 }}finally{await context.close();}
});
