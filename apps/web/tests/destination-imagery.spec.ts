import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {destinationImage,destinationImages,imageryCopy} from '../src/lib/destination-imagery';
import {articlePhotoCopy} from '../src/lib/article-photo-captions';
import {destinationLabel} from '../src/lib/destinations';
import {localizedHref,pageLocales} from '../src/lib/i18n/routing';
import type {Destination} from '../src/lib/api';
const fixture='http://127.0.0.1:8100';

test.setTimeout(90000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});
test.afterEach(async({request})=>{expect((await request.post(`${fixture}/__test__/destination-images`)).ok()).toBe(true);});

for(const locale of ['pl','en','ru','uk'] as const)test(`destination photographs preserve links, reserved layout and credits in ${locale}`,async({page,request},info)=>{
 const errors:string[]=[],external:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.resourceType()==='image'&&!r.url().startsWith('http://127.0.0.1:3125')&&!r.url().startsWith('http://127.0.0.1:3100')&&!r.url().startsWith('data:'))external.push(r.url());});
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
 await page.route('**/_next/image?*',async route=>{await gate;await route.continue();});
 try{
  await page.goto(localizedHref('/',locale),{waitUntil:'domcontentloaded'});
  await expect(page.locator('.hero h1')).toBeVisible();await expect(page.locator('.hero button[type="submit"]')).toBeEnabled();
  const destinations:Destination[]=await(await request.get('http://127.0.0.1:8100/api/v1/destinations')).json();
  const section=page.locator('section:has(> #home-destinations)');
  for(const d of destinations.filter(d=>d.is_active&&destinationImage(d.slug)).slice(0,3)){
   const route=pageLocales(`/destinations/${d.slug}`).includes(locale)?`/destinations/${d.slug}`:`/deals?destination=${encodeURIComponent(d.slug)}`;
   await expect(section.locator(`a[href="${localizedHref(route,locale)}"]`)).toHaveCount(1);
  }
  const img=section.getByAltText(destinationImages.rome.alt[locale]);
  await expect(img).toHaveAttribute('loading','lazy');await expect(img).toHaveAttribute('width','960');await expect(img).toHaveAttribute('height','600');
  await expect(img).toHaveAttribute('sizes',/max-width/);await expect(img).toHaveAttribute('srcset',/640w/);
  expect(await page.locator('link[rel="preload"][as="image"]').count()).toBe(0);
  await img.scrollIntoViewIfNeeded();const before=await img.boundingBox();expect(before!.height).toBeGreaterThan(100);
  expect(before!.width/before!.height).toBeCloseTo(1.6,1);
  release();await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const after=await img.boundingBox();expect(after!.width).toBeCloseTo(before!.width,1);expect(after!.height).toBeCloseTo(before!.height,1);
  const card=section.locator('li').filter({has:page.getByAltText(destinationImages.rome.alt[locale])});
  await card.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(card.getByRole('link',{name:destinationImages.rome.title,exact:true})).toHaveAttribute('href',destinationImages.rome.source);
  await expect(card.getByRole('link',{name:'CC BY 3.0',exact:true})).toHaveAttribute('href',destinationImages.rome.licenseUrl);
  await expect(card).toContainText(imageryCopy[locale].edited);
  expect((await new AxeBuilder({page}).include('.destination-links').analyze()).violations).toEqual([]);
  await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(locale==='pl')await section.screenshot({path:info.outputPath('destinations-320.png'),scale:'css',animations:'disabled'});
  writeFileSync(info.outputPath(`image-${locale}.json`),JSON.stringify({before,after,currentSrc:await img.evaluate(el=>(el as HTMLImageElement).currentSrc),external,errors},null,2));
  const rome=destinations.find(d=>d.slug==='rome')!;
  const link=card.getByRole('link',{name:destinationLabel(rome,locale),exact:true});await link.focus();await expect(link).toHaveCSS('outline-width','3px');await page.keyboard.press('Enter');
  await expect(page).toHaveURL(locale==='pl'?/\/destinations\/rome$/:new RegExp(`/${locale}/deals\\?destination=rome$`));
  await expect(page.locator('.deal-card img:not(.country-flag)')).toHaveCount(0);expect(errors).toEqual([]);expect(external).toEqual([]);
 }finally{release();}
});

test('failed local image retains destination action and layout without retry or remote fallback',async({page},info)=>{
 await page.route('**/_next/image?*',route=>route.abort('failed'));
 await page.goto('/');const section=page.locator('section:has(> #home-destinations)');
 const card=section.locator('li').filter({hasText:'Sebastian Straub'});
 await card.scrollIntoViewIfNeeded();await expect(card.getByText(imageryCopy.pl.unavailable,{exact:true})).toBeVisible();
 await expect(card.locator('img')).toHaveCount(0);await expect(card.locator('a[href="/destinations/rome"]')).toBeVisible();
 const frame=await card.locator('a[href="/destinations/rome"] > span').first().boundingBox();expect(frame!.width/frame!.height).toBeCloseTo(1.6,1);
 await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await card.screenshot({path:info.outputPath('fallback-320.png'),scale:'css',animations:'disabled'});
});

test('all local WebP assets and credits ship with bounded responsive responses',async({request},info)=>{
 const sizes=[];
 for(const image of Object.values(destinationImages)){
  const original=await request.get(image.src);expect(original.status()).toBe(200);expect(original.headers()['content-type']).toContain('image/webp');
  expect((await original.body()).length).toBeLessThanOrEqual(image.src.startsWith('/media/articles/')?360000:110000);
  for(const width of [384,640]){
   const response=await request.get(`/_next/image?url=${encodeURIComponent(image.src)}&w=${width}&q=75`,{headers:{accept:'image/webp'}});
   expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/webp');
   const bytes=(await response.body()).length;expect(bytes).toBeLessThanOrEqual(110000);sizes.push({src:image.src,width,bytes});
  }
 }
 const credits=await request.get('/media/destinations/CREDITS.md');expect(credits.status()).toBe(200);expect(await credits.text()).toContain('Sebastian Straub');
 writeFileSync(info.outputPath('response-sizes.json'),JSON.stringify(sizes,null,2));
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: mapped city photographs and unpictured destinations preserve navigation`,async({page,request},info)=>{
 const section=page.locator('section:has(> #home-destinations)');
 for(const slugs of [['wroclaw','warsaw','krakow'],['gdansk','katowice','poznan'],['bergen','reykjavik']]){
  const query=new URLSearchParams(slugs.map(slug=>['slug',slug]));
  expect((await request.post(`${fixture}/__test__/destination-images?${query}`)).ok()).toBe(true);
  await page.goto(localizedHref('/',locale));
  await expect(section.locator('li')).toHaveCount(slugs.length);
  for(const slug of slugs){
   const image=destinationImage(slug)!;
   const card=section.locator('li').filter({has:page.getByAltText(image.alt[locale])});
   const img=card.locator('img');await img.scrollIntoViewIfNeeded();
   await expect.poll(()=>img.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
   await expect(img).toHaveAttribute('width',String(image.width));await expect(img).toHaveAttribute('height',String(image.height));
   await expect(img).toHaveAttribute('loading','lazy');await expect(img).toHaveAttribute('sizes',/max-width/);
   expect(new URL((await img.getAttribute('src'))!,page.url()).searchParams.get('url')).toBe(image.src);
   const target=new URL((await card.locator('a').first().getAttribute('href'))!,page.url());
   expect(target.origin).toBe(new URL(page.url()).origin);
   expect(target.pathname===localizedHref(`/destinations/${slug}`,locale)||
    target.pathname===localizedHref('/deals',locale)&&target.searchParams.get('destination')===slug).toBe(true);
   await card.locator('summary').click();
   await expect(card.getByRole('link',{name:image.license,exact:true})).toHaveAttribute('href',image.licenseUrl);
   if(image.shareAlike)await expect(card.locator('details')).toContainText(articlePhotoCopy[locale].adapted);
  }
  if(slugs[0]==='bergen'&&locale==='ru')await section.screenshot({path:info.outputPath('mapped-cities-ru.png'),animations:'disabled'});
 }
 expect((await request.post(`${fixture}/__test__/destination-images?slug=berlin`)).ok()).toBe(true);
 await page.goto(localizedHref('/',locale));await expect(section.locator('img')).toHaveCount(0);
 await expect(section.getByText(imageryCopy[locale].unavailable,{exact:true})).toHaveCount(0);
 await section.locator('a').click();await expect(page).toHaveURL(new RegExp(localizedHref('/destinations',locale)+'$'));
 const berlin=page.locator('[data-destination-slug="berlin"]');await expect(berlin).toBeVisible();
 const href=await berlin.getAttribute('href');await berlin.click();
 await expect(page).toHaveURL(new URL(href!,page.url()).toString());await expect(page.locator('main h1')).toBeVisible();
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: HTTP, network and decode errors retain the destination action and reserved frame`,async({page},info)=>{
 const section=page.locator('section:has(> #home-destinations)');
 for(const failure of ['404','network','decode']){
  let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
  const attempts:string[]=[];
  await page.route('**/_next/image?*',async route=>{
   attempts.push(route.request().url());await gate;
   if(failure==='network')return route.abort('failed');
   return route.fulfill({status:failure==='404'?404:200,contentType:'image/webp',body:'Not a decodable image'});
  });
  try{
   await page.goto(localizedHref('/',locale),{waitUntil:'domcontentloaded'});
   const card=section.locator('li').filter({hasText:'Sebastian Straub'}),action=card.locator('a').first();
   const frame=action.locator(':scope > span').first();await card.scrollIntoViewIfNeeded();
   const before=await frame.boundingBox();expect(before!.width/before!.height).toBeCloseTo(1.6,1);
   release();await expect(card.getByText(imageryCopy[locale].unavailable,{exact:true})).toBeVisible();
   await expect(card.locator('img')).toHaveCount(0);await expect(action).toBeVisible();
   const after=await frame.boundingBox();expect(after!.width).toBeCloseTo(before!.width,1);expect(after!.height).toBeCloseTo(before!.height,1);
   const romeAttempts=()=>attempts.filter(url=>new URL(url).searchParams.get('url')===destinationImages.rome.src).length;
   // Next may reassign src during hydration to deliver an earlier native error.
   // Once the fallback replaces img, layout changes must not start another request.
   const settledAttempts=romeAttempts();expect(settledAttempts).toBeGreaterThan(0);
   await action.focus();await expect(action).toHaveCSS('outline-width','3px');
   for(const width of [320,375,390,768,1440]){
    await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   }
   expect(romeAttempts()).toBe(settledAttempts);
   if(failure==='decode'&&locale==='ru')await card.screenshot({path:info.outputPath('decode-fallback-ru.png'),animations:'disabled'});
   await action.click();await expect(page).toHaveURL(locale==='pl'?/\/destinations\/rome$/:new RegExp(`/${locale}/deals\\?destination=rome$`));
  }finally{release();await page.unroute('**/_next/image?*');}
 }
});
