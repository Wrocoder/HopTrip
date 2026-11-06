import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {directoryCopy} from '../src/lib/i18n/directory-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import {localeNames} from '../src/lib/i18n/config';
import {destinationLabel} from '../src/lib/destinations';
import {navigation} from '../src/lib/i18n/navigation';
import type {Destination} from '../src/lib/api';

const fixture='http://127.0.0.1:8100';
test.setTimeout(120000);
test.beforeEach(async({page,request})=>{
 expect((await request.post(`${fixture}/__test__/directory?state=large`)).ok()).toBe(true);
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{await request.post(`${fixture}/__test__/directory?state=normal`);});

for(const [locale,query] of [['pl','BGY'],['en','Милан'],['ru','Мілан'],['uk','mediolan']] as const)test(`${locale}: complete grouped directory, keyboard aliases, history and locale switching`,async({page,request},info)=>{
 const errors:string[]=[],analytics:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.url().includes('/api/v1/analytics/events'))analytics.push(request.url());});
 const copy=directoryCopy[locale],base=localizedHref('/destinations',locale);
 await page.goto(base);await expect(page.locator('html')).toHaveAttribute('lang',locale);
 await expect(page.getByRole('heading',{level:1})).toHaveText(copy.heading);
 const registry:Destination[]=await(await request.get(`${fixture}/api/v1/destinations`)).json();
 expect(registry.length).toBeGreaterThan(12);await expect(page.locator('main a[data-destination-slug]')).toHaveCount(registry.length);
 for(const destination of registry)await expect(page.locator(`main [data-destination-slug="${destination.slug}"]`)).toHaveText(destinationLabel(destination,locale));
 await expect(page.locator('[data-destination-slug="directory-fixture-20"]')).toHaveCount(0);
 const nav=page.getByRole('navigation',{name:copy.countries});
 const italy=new Intl.DisplayNames(locale,{type:'region'}).of('IT')!;
 await nav.getByRole('link',{name:italy,exact:true}).focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/#country-IT$/);await expect(page.locator('#country-IT')).toBeInViewport();
 const input=page.getByRole('searchbox',{name:copy.search});await input.fill(query);await input.press('Enter');
 await expect(page).toHaveURL(new RegExp(base+'\\?q='));
 await expect(page.locator('main a[data-destination-slug]')).toHaveCount(1);
 await expect(page.locator('[data-destination-slug="milan"]')).toBeVisible();
 expect(new URL(page.url()).searchParams.get('q')).toBe(query);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',String(info.project.use.baseURL)+base);
 await page.locator('[data-destination-slug="milan"]').click();await expect(page).toHaveURL(new RegExp(localizedHref('/destinations/milan',locale)+'$'));
 await page.goBack();await expect(page.locator('main a[data-destination-slug]')).toHaveCount(1);await expect(input).toHaveValue(query);
 const nextLocale=locale==='en'?'ru':'en';
 await page.locator('.language-switcher').getByRole('link',{name:localeNames[nextLocale],exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang',nextLocale);expect(new URL(page.url()).searchParams.get('q')).toBe(query);
 await expect(page.locator('main a[data-destination-slug]')).toHaveCount(1);
 await page.goBack();await expect(page.locator('html')).toHaveAttribute('lang',locale);
 await input.fill('no-matching-city-zzzz');await input.press('Enter');await expect(page.getByRole('heading',{name:copy.noMatch,exact:true})).toBeVisible();
 await expect(page.locator('main a[data-destination-slug]')).toHaveCount(0);
 await input.fill('');await input.press('Enter');await expect(page.locator('main a[data-destination-slug]')).toHaveCount(registry.length);
 await page.getByRole('link',{name:copy.clear,exact:true}).click();await expect(page).toHaveURL(new URL(base,info.project.use.baseURL).href);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index,/);
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await page.getByRole('button',{name:copy.submit,exact:true}).boundingBox())!.height).toBeGreaterThanOrEqual(44);
 for(const link of await page.locator('main a[data-destination-slug]').all())expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 if(locale==='pl')await page.locator('main').screenshot({path:info.outputPath('directory-320.png'),scale:'css',animations:'disabled'});
 const mainNav=page.getByRole('navigation',{name:navigation[locale].main});
 await expect(mainNav.getByRole('link',{name:navigation[locale].destinations,exact:true})).toHaveAttribute('aria-current','page');
 expect(errors).toEqual([]);expect(analytics).toEqual([]);
});

test('homepage has bounded editorial destinations and a visible full-directory route',async({page,request})=>{
 await page.goto('/');const section=page.locator('.destination-links');
 await expect(section.getByRole('link',{name:directoryCopy.pl.all,exact:true})).toBeVisible();
 expect(await section.locator('li').count()).toBeLessThanOrEqual(3);
 await expect(section.locator('[href*="directory-fixture-"]')).toHaveCount(0);
 await section.getByRole('link',{name:directoryCopy.pl.all,exact:true}).click();await expect(page).toHaveURL(/\/destinations$/);
 const registry=await(await request.get(`${fixture}/api/v1/destinations`)).json();await expect(page.locator('main a[data-destination-slug]')).toHaveCount(registry.length);
});

test('empty registry and API failure are distinct and retry restores the directory',async({page,request})=>{
 await request.post(`${fixture}/__test__/directory?state=empty`);await page.goto('/destinations');
 await expect(page.getByRole('heading',{name:directoryCopy.pl.empty,exact:true})).toBeVisible();await expect(page.locator('main a[data-destination-slug]')).toHaveCount(0);
 await request.post(`${fixture}/__test__/directory?state=unavailable`);await page.reload();
 await expect(page.locator('main [data-state="error"]')).toBeVisible();await expect(page.locator('main [data-state="empty"]')).toHaveCount(0);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 await request.post(`${fixture}/__test__/directory?state=normal`);await page.locator('main a[href="/destinations"]').click();
 await expect(page.locator('main a[data-destination-slug]')).toHaveCount(3);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index,/);
});

test('no-JS directory links, native search and existing city URLs remain reachable',async({browser,request},info)=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:info.project.use.baseURL,userAgent:'Twitterbot/1.0'});
 try{const page=await context.newPage();const crawl=[];
  const registry:Destination[]=await(await request.get(`${fixture}/api/v1/destinations`)).json();
  for(const locale of ['pl','en','ru','uk'] as const){
   const path=localizedHref('/destinations',locale);expect((await page.goto(path))?.status()).toBe(200);
   await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(5);
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',String(info.project.use.baseURL)+path);
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index,/);
   await expect(page.locator('main a[data-destination-slug]')).toHaveCount(registry.length);
   const hrefs=await page.locator('main a[data-destination-slug]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')!));
   for(let offset=0;offset<hrefs.length;offset+=5){
    const batch=hrefs.slice(offset,offset+5),responses=await Promise.all(batch.map(href=>request.get(href)));
    for(const [index,response] of responses.entries()){
     const href=batch[index];expect(response.status(),href).toBe(200);crawl.push({href,status:response.status()});
     if(locale==='pl')expect(href).toMatch(/^\/destinations\//);
    }
   }
   const search=page.getByRole('searchbox',{name:directoryCopy[locale].search});await search.fill('Mediolan');await search.press('Enter');
   await expect(page.locator('main a[data-destination-slug]')).toHaveCount(1);await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  }
  for(const path of ['/pl/destinations','/ua/destinations','/de/destinations'])expect((await request.get(path)).status()).toBe(404);
  await page.goto('/destinations/directory-does-not-exist');
  const missingDirectives=await page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('content')).join(','));
  expect(missingDirectives).toContain('noindex');await expect(page.locator('.deal-price')).toHaveCount(0);
  const xml=await(await request.get('/sitemap.xml')).text();
  for(const locale of ['pl','en','ru','uk'] as const)expect(xml).toContain(String(info.project.use.baseURL)+localizedHref('/destinations',locale)+'</loc>');
  writeFileSync(info.outputPath('directory-crawl.json'),JSON.stringify({registryCount:registry.length,crawl,sitemap:xml},null,2));
 }finally{await context.close();}
});
