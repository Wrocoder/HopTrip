import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {localizedHref} from '../src/lib/i18n/routing';
import {stateText} from '../src/lib/i18n/state-copy';

const api='http://127.0.0.1:8100';
test.setTimeout(180000);
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('https://api.nbp.pl/**',route=>route.fulfill({json:{table:'A',code:'EUR',rates:[{mid:4,effectiveDate:new Date().toISOString().slice(0,10)}]}}));
});
test.afterEach(async({request})=>{
 expect((await request.post(`${api}/__test__/catalog-state?unavailable=false`)).ok()).toBe(true);
 expect((await request.post(`${api}/__test__/directory?state=normal`)).ok()).toBe(true);
 expect((await request.post(`${api}/__test__/destination-images`)).ok()).toBe(true);
});

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: price feed failure retains city content, arrival advice and reviewed metadata`,async({page,request},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const path=localizedHref('/destinations/milan',locale);
 await page.goto(path);
 const before={title:await page.title(),description:await page.locator('meta[name="description"]').getAttribute('content'),alternates:await page.locator('link[hreflang]').evaluateAll(nodes=>nodes.map(n=>[n.getAttribute('hreflang'),n.getAttribute('href')]))};
 expect((await request.post(`${api}/__test__/catalog-state?unavailable=true`)).ok()).toBe(true);
 expect((await page.goto(path))?.status()).toBe(200);
 await expect(page.locator('main h1')).toHaveCount(1);
 const primary=page.locator('[aria-labelledby="destination-flights-heading"]');
 await expect(primary.locator('[data-state="error"]')).toContainText(stateText(locale,'Oferty są chwilowo niedostępne. Spróbuj ponownie z tymi samymi warunkami.'));
 await expect(primary.locator('.deal-card,[data-state="empty"]')).toHaveCount(0);
 await expect(page.locator('[data-destination-guides]')).toBeVisible();
 const arrival=page.locator('[data-destination-arrival]');
 await expect(arrival).toHaveAttribute('href',localizedHref('/info/milan-airports',locale));
 for(const width of [320,375,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content','index, follow');
 await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','http://127.0.0.1:3100'+path);
 expect(await page.title()).toBe(before.title);await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',before.description!);
 expect(await page.locator('link[hreflang]').evaluateAll(nodes=>nodes.map(n=>[n.getAttribute('hreflang'),n.getAttribute('href')]))).toEqual(before.alternates);
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 if(locale==='ru'){await page.setViewportSize({width:320,height:900});await page.locator('[data-destination-planning]').screenshot({path:info.outputPath('arrival-ru-320.png'),scale:'css'});}
 await arrival.click();await expect(page).toHaveURL(new RegExp(localizedHref('/info/milan-airports',locale)+'$'));await expect(page.locator('main')).toContainText(/LIN/);
 await page.goto(localizedHref('/info/islandia-wieloryby-lodowce-atrakcje',locale));
 await expect(page.locator('#destination-activities')).toHaveCount(1);
 await expect(page.locator('#destination-activities-title')).toHaveCount(1);
 // Losing the city registry is a different failure: do not invent a record.
 expect((await request.post(`${api}/__test__/directory?state=unavailable`)).ok()).toBe(true);
 await page.goto(path);await expect(page.locator('[data-state="error"] h1')).toHaveCount(1);await expect(page.locator('[data-destination-planning]')).toHaveCount(0);
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^noindex/);expect(errors).toEqual([]);
});

test('all 69 seed city URLs retain SSR canonical and reviewed index policy; generic templates are recorded separately',async({browser,request},info)=>{
 test.setTimeout(300000);
 const seed=JSON.parse(readFileSync(path.resolve('../api/app/data/destinations.json'),'utf8')).destinations as {slug:string}[];
 const context=await browser.newContext({javaScriptEnabled:false,userAgent:'Twitterbot/1.0',viewport:{width:320,height:900}});
 const rows=[];
 try{
  const page=await context.newPage(),sitemap=await(await request.get('/sitemap.xml')).text();
  const sitemapURLs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
  for(let index=0;index<seed.length;index+=3){
   const group=seed.slice(index,index+3),query=new URLSearchParams();for(const row of group)query.append('slug',row.slug);
   expect((await request.post(`${api}/__test__/destination-images?${query}`)).ok()).toBe(true);
   for(const {slug} of group){
    const path='/destinations/'+slug,url='http://127.0.0.1:3100'+path;
    expect((await page.goto(url))?.status(),path).toBe(200);await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',url);
    const indexed=slug==='milan';await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',indexed?'index, follow':'noindex, follow');
    expect(sitemapURLs.includes(url)).toBe(indexed);await expect(page.locator('[data-destination-planning]')).toHaveCount(1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),slug).toBe(true);
    const guides=await page.locator('[data-destination-guides] li').count(),arrival=await page.locator('[data-destination-arrival]').count();
    rows.push({slug,path,indexed,guides,arrival,classification:guides?'existing_editorial_support':'generic_template_noindex',scope:'seed selection in synthetic API; not production availability'});
    if(slug==='reykjavik'){await expect(page.locator('[data-destination-guides] a').first()).toHaveAttribute('href','/info/islandia-wieloryby-lodowce-atrakcje');await page.screenshot({path:info.outputPath('reykjavik-320.png'),scale:'css'});}
   }
  }
  expect(rows).toHaveLength(69);expect(rows.filter(row=>row.guides>0)).toHaveLength(19);expect(rows.filter(row=>row.arrival>0)).toHaveLength(17);
  expect((await page.goto('http://127.0.0.1:3100/destinations/unknown-v4-review'))?.status()).toBe(404);
  const missingRobots=await page.locator('meta[name="robots"]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('content')));
  expect(missingRobots.length).toBeGreaterThan(0);for(const value of missingRobots)expect(value).toMatch(/noindex/);
  writeFileSync(info.outputPath('seed-ssr-inventory.json'),JSON.stringify({scope:'All 69 repository seed destinations injected in groups of three into guarded local fixture; no production/GSC inference',rows},null,2)+'\n');
 }finally{await context.close();}
});
