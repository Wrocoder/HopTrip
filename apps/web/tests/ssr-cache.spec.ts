import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import config from '../playwright.config';
import {availableHref} from '../src/lib/i18n/routing';

test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Requires isolated production build.');
const build=()=>readFileSync('.next/BUILD_ID','utf8').trim();
const digest=(body:Buffer|string)=>createHash('sha256').update(body).digest('hex');
test.beforeEach(async({request},info)=>{
 const servers=config.webServer;if(!Array.isArray(servers))throw Error('Expected fixture servers');
 expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
 expect(await(await request.get('/deals')).text()).toContain(build());
 await info.attach('execution-mode',{body:JSON.stringify({build:build(),command:servers[1].command,nodeEnv:servers[1].env?.NODE_ENV}),contentType:'application/json'});
});
if(process.env.HOPTRIP_SSR_CAPTURE==='1'){
 test('capture old release snapshot',async({request},info)=>{
  const response=await request.get('/deals');expect(response.status()).toBe(200);const html=await response.text();
  const assets=[...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)].map(match=>match[1].replaceAll('&amp;','&'));
  writeFileSync(info.outputPath('old-release.json'),JSON.stringify({build:build(),etag:response.headers().etag??null,cacheControl:response.headers()['cache-control'],htmlSha256:digest(html),assets:[...new Set(assets)]},null,2));
 });
}else{
 const paths=['/','/deals','/tanie-loty-na-weekend','/city-break','/destinations/barcelona','/destinations/milan','/deals/browser-deal','/saved','/info/trip-budget','/alerts'];
 for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: server HTML and assets work without JavaScript`,async({browser,request},info)=>{
  test.setTimeout(180000);
  const context=await browser.newContext({baseURL:String(info.project.use.baseURL),javaScriptEnabled:false});
  const external:string[]=[];await context.route('**/*',route=>{if(!['127.0.0.1','localhost'].includes(new URL(route.request().url()).hostname)){external.push(route.request().url());return route.abort();}return route.continue();});
  const page=await context.newPage(),rows:unknown[]=[],assets=new Map<string,unknown>();
  try{for(const path of paths){
   const href=availableHref(path,locale),response=await page.goto(href);expect(response?.status()).toBe(200);
   const html=await response!.text(),headers=response!.headers();expect(html).toContain(build());expect(headers['cache-control']).toContain('no-store');
   await expect(page.locator('main h1').first()).toBeVisible();const lang=href.match(/^\/(en|ru|uk)(\/|$)/)?.[1]??'pl';await expect(page.locator('html')).toHaveAttribute('lang',lang);
   const canonical=await page.locator('link[rel="canonical"]').getAttribute('href');expect(new URL(canonical!).pathname).toBe(href);
   if(path==='/deals')expect(await page.locator('.deal-card-link').count()).toBeGreaterThan(0);
   const urls=await page.locator('script[src],link[rel="stylesheet"][href],link[as="font"][href]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')??node.getAttribute('href')!).filter(path=>path.startsWith('/_next/static/')));
   for(const url of new Set(urls))if(!assets.has(url)){
    const asset=await request.get(url);expect(asset.status(),url).toBe(200);const body=await asset.body(),h=asset.headers();expect(body.length).toBeGreaterThan(0);expect(h['cache-control']).toContain('immutable');
    if(url.includes('.js'))expect(h['content-type']).toMatch(/javascript/);if(url.includes('.css'))expect(h['content-type']).toContain('text/css');
    assets.set(url,{url,bytes:body.length,sha256:digest(body),cacheControl:h['cache-control'],contentType:h['content-type']});
   }
   rows.push({href,lang,status:response!.status(),h1:await page.locator('main h1').allTextContents(),canonical,cacheControl:headers['cache-control'],vary:headers.vary,htmlSha256:digest(html),assets:urls});
  }expect(external).toEqual([]);}finally{writeFileSync(info.outputPath('ssr-cache.json'),JSON.stringify({locale,build:build(),javaScriptEnabled:false,rows,assets:[...assets.values()],external},null,2));await context.close();}
 });
 test('origin cookies, query override and forged locale header remain isolated',async({browser,request},info)=>{
  const rows:unknown[]=[];
  for(const origin of ['WRO','KRK','']){
   const context=await browser.newContext({baseURL:String(info.project.use.baseURL),javaScriptEnabled:false});
   if(origin)await context.addCookies([{name:'hoptrip.origin.v1',value:origin,domain:'127.0.0.1',path:'/',httpOnly:true}]);
   const page=await context.newPage();try{
    const response=await page.goto('/');expect(response?.headers()['cache-control']).toContain('no-store');const value=await page.locator('#home-origin').inputValue();
    if(origin)expect(value).toContain(origin);else expect(value).toBe('');
    rows.push({origin,value,cacheControl:response?.headers()['cache-control']});
    await page.goto('/?origin=GDN');await expect(page.locator('#home-origin')).toHaveValue(/GDN/);
   }finally{await context.close();}
  }
  const forged=await request.get('/en',{headers:{'x-hoptrip-locale':'ru'}});expect(await forged.text()).toMatch(/<html[^>]*lang="en"/);
  writeFileSync(info.outputPath('cache-isolation.json'),JSON.stringify({rows,forgedLocaleIgnored:true},null,2));
 });
 test('previous release validators cannot return old HTML for the new build',async({request},info)=>{
  test.skip(!process.env.HOPTRIP_OLD_RELEASE,'Requires an explicitly captured previous release.');
  const old=JSON.parse(readFileSync(process.env.HOPTRIP_OLD_RELEASE!,'utf8'));expect(old.build).not.toBe(build());
  const validator=old.etag??`"stale-${old.build}"`;
  const response=await request.get('/deals',{headers:{'If-None-Match':validator}});expect(response.status()).toBe(200);
  const html=await response.text();expect(html).toContain(build());expect(html).not.toContain(old.build);expect(response.headers()['cache-control']).toContain('no-store');
  const previousAssets=[];for(const url of old.assets){expect(url).toMatch(/^\/_next\/static\//);const asset=await request.get(url);previousAssets.push({url,status:asset.status()});}
  writeFileSync(info.outputPath('release-switch.json'),JSON.stringify({before:old.build,after:build(),validator,realOldEtag:old.etag!==null,status:response.status(),cacheControl:response.headers()['cache-control'],previousAssets},null,2));
 });
}
