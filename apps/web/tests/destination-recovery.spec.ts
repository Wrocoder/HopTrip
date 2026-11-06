import {test,expect,type APIRequestContext} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import config from '../playwright.config';
import {destinationRecoveryCopy} from '../src/lib/i18n/destination-recovery-copy';
import {destinationCopy} from '../src/lib/i18n/destination-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import type {Destination} from '../src/lib/api';
const servers=config.webServer;if(!Array.isArray(servers)||!servers[0]?.url)throw new Error('Local fixture API required');
const api=new URL(servers[0].url).origin;
async function scenario(request:APIRequestContext,value:string,alerts=false){expect((await request.post(`${api}/__test__/destination-recovery?value=${value}&alerts=${alerts}`)).ok()).toBe(true);}
test.setTimeout(90000);
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));});
test.afterEach(async({request})=>{await scenario(request,'normal');});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: zero, one and many observations preserve the city and offer real alternative destinations`,async({page,request},info)=>{
 const copy=destinationRecoveryCopy[locale],errors:string[]=[],analytics:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(r.url().includes('/analytics/events'))analytics.push(r.url());});
 const path=localizedHref('/destinations/milan',locale),primary=page.locator('[aria-labelledby="destination-flights-heading"]'),recovery=page.locator('[data-destination-recovery]');
 for(const [value,count]of [['zero',0],['one',1],['many',3]] as const){
  await scenario(request,value);expect((await page.goto(path))?.status()).toBe(200);await expect(primary.locator('.deal-card')).toHaveCount(count);
  await expect(page.locator('main h1')).toHaveCount(1);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(path,info.project.use.baseURL).href);await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
  await expect(page.locator('[data-destination-guides]')).toBeVisible();await expect(page.locator('[data-destination-planning]')).toContainText('IT');
  if(count>1){await expect(recovery).toHaveCount(0);continue;}
  await expect(recovery).toHaveAttribute('data-recovery-state','ready');await expect(recovery.locator('.deal-card')).toHaveCount(2);await expect(recovery.getByRole('heading',{name:copy.title,exact:true})).toBeVisible();
  const hrefs=await recovery.locator('.deal-card-link').evaluateAll(links=>links.map(link=>link.getAttribute('href')));expect(hrefs).toEqual([localizedHref('/deals/h315-rome-0',locale),localizedHref('/deals/h315-barcelona-0',locale)]);
  for(const href of hrefs){const slug=href!.split('/').at(-1)!;expect((await request.get(`${api}/api/v1/deals/${slug}`)).status()).toBe(200);}
  await expect(recovery.getByRole('link',{name:copy.search,exact:true})).toHaveAttribute('href',localizedHref('/deals?destination=milan',locale));await expect(recovery.getByRole('link',{name:copy.directory,exact:true})).toHaveAttribute('href',localizedHref('/destinations',locale));await expect(recovery.getByRole('link',{name:copy.alerts,exact:true})).toHaveCount(0);
  if(count===0)await expect(primary).toContainText(destinationCopy[locale].empty);
  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(locale==='pl'&&count===0){await recovery.getByRole('link',{name:copy.search,exact:true}).focus();await recovery.screenshot({path:info.outputPath('destination-recovery-320.png'),scale:'css',animations:'disabled'});}
 }
 expect(errors).toEqual([]);expect(analytics).toEqual([]);
});
test('empty, unavailable and stale alternatives are distinct; active alerts are opt-in and optional failure can recover',async({page,request})=>{
 const copy=destinationRecoveryCopy.pl,recovery=page.locator('[data-destination-recovery]');
 for(const value of ['none','expired','error']){
  await scenario(request,value);await page.goto('/destinations/milan');await expect(recovery).toHaveAttribute('data-recovery-state',value==='error'?'error':'empty');await expect(recovery.locator('.deal-card')).toHaveCount(0);
  await expect(page.locator('[data-destination-guides]')).toBeVisible();await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');await expect(page.locator('[data-state="error"]')).toHaveCount(0);
  await expect(recovery).toContainText(value==='error'?copy.error:copy.empty);
 }
 await scenario(request,'zero',true);await recovery.getByRole('button',{name:copy.refresh,exact:true}).click();await expect(recovery).toHaveAttribute('data-recovery-state','ready');await expect(recovery.getByRole('link',{name:copy.alerts,exact:true})).toHaveAttribute('href','/alerts');
});
test('an expired open selection removes all alternative prices and can be refreshed without losing city context',async({page,request})=>{
 await page.clock.install();await scenario(request,'expiring');await page.goto('/destinations/milan');const recovery=page.locator('[data-destination-recovery]');await expect(recovery.locator('.deal-card')).toHaveCount(2);
 await page.clock.fastForward(15000);await expect(recovery).toHaveAttribute('data-recovery-state','expired');await expect(recovery.locator('.deal-card,.deal-price')).toHaveCount(0);await expect(recovery).toContainText(destinationRecoveryCopy.pl.expired);
 await scenario(request,'zero');await recovery.getByRole('button',{name:destinationRecoveryCopy.pl.refresh,exact:true}).click();await expect(recovery.locator('.deal-card')).toHaveCount(2);await expect(page).toHaveURL(/\/destinations\/milan$/);
});
test.describe('server-rendered links without JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 test('real offer detail, city search and destination directory are reachable without scripts',async({page,request})=>{
  await scenario(request,'zero');await page.goto('/destinations/milan');const recovery=page.locator('[data-destination-recovery]');await expect(recovery.locator('.deal-card')).toHaveCount(2);
  await recovery.locator('.deal-card-link').first().focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/deals\/h315-rome-0$/);await expect(page.locator('main h1')).toContainText('Rzym');
  await page.goBack();await recovery.getByRole('link',{name:destinationRecoveryCopy.pl.search,exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/deals\?destination=milan$/);await expect(page.locator('.result-count')).toBeVisible();
  await page.goBack();await recovery.getByRole('link',{name:destinationRecoveryCopy.pl.directory,exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/destinations$/);await expect(page.locator('main a[data-destination-slug="milan"]')).toBeVisible();
 });
});
test('destination content and coverage inventory records individual index decisions without inventing GSC metrics',async({page,request},info)=>{
 await scenario(request,'normal');const destinations=await (await request.get(`${api}/api/v1/destinations`)).json() as Destination[];const inventory=[];
 for(const destination of destinations){
  const coverage=await (await request.get(`${api}/api/v1/deals?destination=${encodeURIComponent(destination.slug)}&include_total=true&sort=price&limit=1`)).json();
  const path='/destinations/'+encodeURIComponent(destination.slug),response=await page.goto(path);expect(response?.status()).toBe(200);
  const content=await page.locator('main').evaluate(main=>({characters:main.textContent?.replace(/\s+/g,' ').trim().length??0,guides:main.querySelectorAll('[data-destination-guides] li').length,planning:!!main.querySelector('[data-destination-planning]'),alternatives:main.querySelectorAll('[data-destination-recovery] .deal-card').length}));
  inventory.push({slug:destination.slug,path,observations:coverage.total,impressions:null,clicks:null,searchConsoleAvailable:false,robots:await page.locator('meta[name="robots"]').getAttribute('content'),canonical:await page.locator('link[rel="canonical"]').getAttribute('href'),...content});
 }
 expect(inventory.find(row=>row.slug==='milan')).toMatchObject({observations:0,robots:'index, follow',planning:true});expect(inventory.find(row=>row.slug==='barcelona')?.observations).toBeGreaterThan(1);expect(inventory.find(row=>row.slug==='rome')).toMatchObject({observations:0,robots:'noindex, follow',planning:true});
 writeFileSync(info.outputPath('destination-inventory.json'),JSON.stringify({scope:'Synthetic local fixture catalogue, not production coverage',gsc:'Unavailable; no metrics inferred',indexPolicy:'Existing reviewed registry unchanged; absence of a current price is not an indexability rule',pages:inventory},null,2)+'\n');
});
