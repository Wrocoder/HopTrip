import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {articlePhotoCopy} from '../src/lib/article-photo-captions';
import {localizedHref} from '../src/lib/i18n/routing';
import photos from '../src/lib/article-photo-data.json';

test.beforeEach(async({page,context})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await context.route(/.*/,route=>{
  const url=new URL(route.request().url());
  if(['127.0.0.1','localhost','[::1]'].includes(url.hostname))return route.continue();
  throw new Error('Article imagery must not request external content: '+url.origin);
 });
});

for(const locale of ['pl','en','ru','uk'] as const)test(`licensed article photographs render in ${locale} with keyboard credits and no layout overflow`,async({page},info)=>{
 test.setTimeout(120000);if(info.project.name==='mobile')await page.setViewportSize({width:320,height:844});
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const copy=articlePhotoCopy[locale];
 for(const [slug,key]of [['paris-weekend','paris'],['wro-airport','wroclaw'],['baggage','luggage'],['price-comparison','flight'],['norwegia-wieloryby-lodowce-fiordy','norway']] as const){
  const response=await page.goto(localizedHref('/info/'+slug,locale));expect(response?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveCount(1);await expect(page.locator('html')).toHaveAttribute('lang',locale);
  const figure=page.locator('figure[data-article-photo="cover"]'),image=figure.locator('img');
  await expect(figure).toHaveCount(1);await expect(image).toHaveJSProperty('complete',true);
  expect(await image.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  expect(new URL((await image.getAttribute('src'))!,page.url()).searchParams.get('url')).toBe('/media/articles/'+key+'.webp');
  await expect(image).toHaveAttribute('alt',/\S/);await expect(image).toHaveAttribute('srcset',/640w/);
  const frame=figure.locator('div').first(),before=await frame.boundingBox();expect(before!.width/before!.height).toBeCloseTo(1.6,1);
  const license=figure.getByRole('link',{name:photos[key].license,exact:true});await expect(license).toHaveAttribute('href',photos[key].licenseUrl);
  const summary=figure.locator('summary');await summary.focus();await page.keyboard.press('Enter');
  await expect(figure.locator('details')).toHaveAttribute('open','');
  await expect(figure.getByRole('link',{name:photos[key].title,exact:true})).toHaveAttribute('href',photos[key].source);
  await expect(figure.locator('details')).toContainText(copy.edited);
  if(slug==='wro-airport')await expect(figure.locator('details')).toContainText(copy.city);
  await page.keyboard.press('Enter');await expect(figure.locator('details')).not.toHaveAttribute('open','');
  if(slug==='norwegia-wieloryby-lodowce-fiordy'){
   const inline=page.locator('figure[data-article-photo="inline"]');await expect(inline).toHaveCount(1);
   await expect(inline.locator('img')).toHaveAttribute('loading','lazy');
   await expect(inline.locator('..').locator('h2')).toHaveText(/\S/);
  }
  expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(slug==='paris-weekend'&&(locale==='pl'||locale==='ru'))await page.screenshot({path:info.outputPath('article-'+locale+'.png'),fullPage:false});
 }
 expect(errors).toEqual([]);
});

test('missing image preserves its reserved frame, caption and original licence links',async({page})=>{
 await page.route('**/_next/image?**',route=>route.fulfill({status:404,body:'Synthetic missing photograph'}));
 await page.goto('/en/info/paris-weekend');const figure=page.locator('[data-article-photo="cover"]');
 await expect(figure.getByRole('status')).toHaveText(articlePhotoCopy.en.unavailable);
 const rect=await figure.locator('div').first().boundingBox();expect(rect!.width/rect!.height).toBeCloseTo(1.6,1);
 await expect(figure.getByRole('link',{name:photos.paris.license,exact:true})).toHaveAttribute('href',photos.paris.licenseUrl);
 await expect(page.locator('main h1')).toContainText('Paris');
});

test('all local photo files are served and non-editorial pages do not acquire generic photography',async({request,page})=>{
 test.setTimeout(120000);
 for(const image of Object.values(photos)){
  const response=await request.get(image.src);expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/webp');
  expect((await response.body()).length).toBeLessThanOrEqual(360000);
 }
 for(const path of ['/info/privacy','/info/about','/info/partners']){
  await page.goto(path);await expect(page.locator('[data-article-photo]')).toHaveCount(0);
 }
 expect((await page.goto('/info/not-an-article'))?.status()).toBe(404);
 await expect(page.locator('[data-article-photo]')).toHaveCount(0);
});

test('article photographs and credits remain available without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL});
 try{const page=await context.newPage();await page.goto('/en/info/islandia-wieloryby-lodowce-atrakcje');
  await expect(page.locator('[data-article-photo="cover"] img')).toHaveAttribute('alt',/Reykjavík/);
  const inline=page.locator('[data-article-photo="inline"]');await expect(inline.locator('img')).toHaveAttribute('loading','lazy');
  const cover=page.locator('[data-article-photo="cover"]');await cover.locator('summary').click();
  await expect(cover.getByRole('link',{name:photos.iceland.title,exact:true})).toHaveAttribute('href',photos.iceland.source);
 }finally{await context.close();}
});
