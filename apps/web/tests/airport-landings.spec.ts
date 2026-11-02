import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import configuration from '../playwright.config';
import {localizedHref} from '../src/lib/i18n/routing';
import {airportCopy} from '../src/lib/i18n/airport-copy';
import {catalogText} from '../src/lib/i18n/catalog-copy';

const servers=configuration.webServer;
if(!Array.isArray(servers)||!servers[0]?.url)throw new Error('Fixture server URL required');
const api=new URL(servers[0].url).origin;
test.afterEach(async({request})=>{
 expect((await request.delete(`${api}/__test__/growth`)).ok()).toBe(true);
 expect((await request.post(`${api}/__test__/catalog-state?unavailable=false`)).ok()).toBe(true);
});

for(const locale of ['pl','en','ru','uk'] as const)test(`airport discovery and search preserve origin in ${locale}`,async({page,request},info)=>{
 test.setTimeout(120000);
 if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 expect((await request.post(`${api}/__test__/growth`)).ok()).toBe(true);
 const pageErrors:string[]=[];page.on('pageerror',error=>pageErrors.push(error.message));
 const evidence=[];
 for(const [path,origin,guide] of [['/from/WRO','WRO','wro-airport'],['/from/KRK','KRK','krk-airport'],['/from/warszawa','WAW,WMI','waw-airport']] as const){
  const response=await page.goto(localizedHref(path,locale));expect(response?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveCount(1);
  const context=page.locator('[data-airport-context]');await expect(context).toBeVisible();
  for(const code of origin.split(','))await expect(context.locator('li').filter({hasText:code})).toHaveCount(1);
  await expect(context).toContainText(airportCopy[locale].scope);
  const offers=await request.get(`${api}/api/v1/deals?origin=${encodeURIComponent(origin)}&limit=12`);expect(offers.ok()).toBe(true);
  const rows=await offers.json() as {destination_slug:string}[];
  const expected=[...new Set(rows.map(row=>row.destination_slug))].sort();
  const links=context.locator('[data-airport-destinations] a');await expect(links).toHaveCount(expected.length);
  const hrefs=await links.evaluateAll(elements=>elements.map(a=>(a as HTMLAnchorElement).href));
  expect(hrefs.map(href=>new URL(href).searchParams.get('destination')).sort()).toEqual(expected);
  for(const href of hrefs){const url=new URL(href);expect(url.searchParams.get('origin')).toBe(origin);expect(url.searchParams.has('offset')).toBe(false);}
  await expect(page.locator('main a[href*="/info/'+guide+'"]')).not.toHaveCount(0);
  await expect(page.locator('main a[href*="/tanie-loty-na-weekend?"]')).not.toHaveCount(0);
  await expect(page.locator('main a[href*="/city-break?"]')).not.toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',new URL(localizedHref(path,locale),info.project.use.baseURL).href);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
  expect((await new AxeBuilder({page}).include('[data-airport-context]').analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(locale==='pl')await context.screenshot({path:info.outputPath(`airport-${origin.split(',')[0]}.png`),scale:'css'});
  evidence.push({path,origin,destinations:expected,links:hrefs});
  const searchURL=new URL(localizedHref(`/deals?origin=${encodeURIComponent(origin)}`,locale),info.project.use.baseURL).href;
  await context.locator('[data-airport-search]').focus();
  await Promise.all([page.waitForURL(searchURL),page.keyboard.press('Enter')]);
  await expect(page).toHaveURL(searchURL);
  await expect(page.locator('.result-count')).toBeVisible();
  await page.goto(hrefs[0]);await expect(page.locator('.deal-card').first()).toBeVisible();
  for(const text of await page.locator('.deal-origin').allTextContents())expect(origin.split(',').some(code=>text.includes(code))).toBe(true);
 }
 expect(pageErrors).toEqual([]);
 await info.attach('airport-discovery',{body:JSON.stringify(evidence,null,2),contentType:'application/json'});
});

test.describe('without JavaScript',()=>{
 test.use({javaScriptEnabled:false});
 for(const locale of ['pl','en','ru','uk'] as const)test(`airport empty state and failure stay distinct in ${locale}`,async({page,request})=>{
  test.setTimeout(90000);
  expect((await request.delete(`${api}/__test__/growth`)).ok()).toBe(true);
  await page.goto(localizedHref('/from/KRK',locale));
  await expect(page.locator('[data-state="empty"]')).toContainText(airportCopy[locale].empty);
  await expect(page.locator('.deal-card,[data-airport-destinations]')).toHaveCount(0);
  await expect(page.locator('[data-airport-context]')).toContainText('KRK');
  await expect(page.locator('[data-airport-search]')).toHaveAttribute('href',localizedHref('/deals?origin=KRK',locale));
  await page.goto(localizedHref('/from/warszawa?origin=WMI&budget=1&offset=12',locale));
  await expect(page.locator('[data-state="empty"]')).toContainText(catalogText(locale,'Brak aktualnych ofert'));
  await expect(page.locator('[data-airport-context] li')).toHaveCount(1);
  await expect(page.locator('[data-airport-context] li')).toContainText('WMI');
  await expect(page.locator('[data-airport-search]')).toHaveAttribute('href',localizedHref('/deals?origin=WMI&budget=1',locale));
  expect((await request.post(`${api}/__test__/catalog-state?unavailable=true`)).ok()).toBe(true);
  await page.goto(localizedHref('/from/KRK',locale));
  await expect(page.locator('[data-state="error"]')).toBeVisible();
  await expect(page.locator('[data-state="empty"],[data-airport-context],.deal-card')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^noindex/);
  expect((await request.post(`${api}/__test__/catalog-state?unavailable=false`)).ok()).toBe(true);
  await page.goto(localizedHref('/from/WRO',locale));
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('.deal-card').first()).toBeVisible();
  await expect(page.locator('[data-airport-destinations] a').first()).toBeVisible();
 });
});
