// Read-only article/photo smoke. No subscriptions, analytics consent or partner clicks.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{createRequire}=require('node:module');
const requireWeb=createRequire(path.resolve('apps/web/package.json'));
const {chromium,expect}=requireWeb('@playwright/test');
const photos=require('../../apps/web/src/lib/article-photo-data.json'),assets=require('./assets.json');
const {articlePhoto}=require('../../apps/web/src/lib/article-imagery.ts');
const {translatedGuideSlugs}=require('../../apps/web/src/lib/i18n/guide-slugs.ts');
const root='https://hoptrip.pl',out=path.resolve('.cache/article-imagery');
const locales=['pl','en','ru','uk'],slugs=[...translatedGuideSlugs,'price-comparison','price-freshness','price-history'];
const articlePath=(slug,locale)=>(locale==='pl'?'':'/'+locale)+'/info/'+slug;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({viewport:{width:1280,height:1000},serviceWorkers:'block'});
 const errors=[],csp=[],external=[],pages=[],files=[],rendered=[];
 await context.addInitScript(()=>{
  localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  window.__photoCsp=[];addEventListener('securitypolicyviolation',event=>window.__photoCsp.push(event.effectiveDirective));
 });
 await context.route(/.*/,route=>{
  const url=new URL(route.request().url());if(url.origin===root)return route.continue();
  external.push(url.origin);return route.abort('blockedbyclient');
 });
 try{
  for(const locale of locales)for(const slug of slugs){
   const pathname=articlePath(slug,locale),response=await context.request.get(root+pathname),html=await response.text();
   expect(response.status(),pathname).toBe(200);
   expect((html.match(/data-article-photo="cover"/g)||[]).length,pathname).toBe(1);
   expect(html,pathname).toContain(photos[articlePhoto(slug,locale).key].licenseUrl);
   expect(html,pathname).toContain('rel="canonical" href="'+root+pathname+'"');
   pages.push({path:pathname,status:response.status(),cover:true});
  }
  for(const asset of assets){
   const response=await context.request.get(root+asset.src),body=await response.body();
   expect(response.status()).toBe(200);expect(response.headers()['content-type']).toContain('image/webp');
   const hash=crypto.createHash('sha256').update(body).digest('hex');expect(hash,asset.key).toBe(asset.outputSha256);
   files.push({key:asset.key,status:response.status(),sha256:hash,bytes:body.length});
  }
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  for(const width of [1280,320]){
   await page.setViewportSize({width,height:width===320?844:1000});
   for(const locale of locales)for(const slug of ['paris-weekend','norwegia-wieloryby-lodowce-fiordy','islandia-wieloryby-lodowce-atrakcje']){
    const pathname=articlePath(slug,locale),response=await page.goto(root+pathname,{waitUntil:'networkidle',timeout:45000});
    expect(response.status()).toBe(200);await expect(page.locator('main h1')).toHaveCount(1);
    const cover=page.locator('[data-article-photo="cover"]'),image=cover.locator('img');
    await expect(image).toHaveJSProperty('complete',true);expect(await image.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
    await expect(cover.getByRole('link',{name:articlePhoto(slug,locale).image.license,exact:true})).toHaveAttribute('href',articlePhoto(slug,locale).image.licenseUrl);
    await cover.locator('summary').focus();await page.keyboard.press('Enter');await expect(cover.locator('details')).toHaveAttribute('open','');
    await expect(cover.getByRole('link',{name:articlePhoto(slug,locale).image.title,exact:true})).toHaveAttribute('href',articlePhoto(slug,locale).image.source);
    await page.keyboard.press('Enter');
    if(slug!=='paris-weekend'){
     const inline=page.locator('[data-article-photo="inline"] img');await inline.scrollIntoViewIfNeeded();
     await expect(inline).toHaveAttribute('loading','lazy');await expect(inline).toHaveJSProperty('complete',true);
     expect(await inline.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    csp.push(...await page.evaluate(()=>window.__photoCsp));
    if(locale==='pl'&&slug==='paris-weekend'){
     await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'production-top-'+width+'.png')});
     await cover.screenshot({path:path.join(out,'production-photo-'+width+'.png')});
    }
    rendered.push({path:pathname,width,status:200,loaded:true,credits:true,overflow:false});
   }
  }
  const nojs=await browser.newContext({javaScriptEnabled:false});
  try{
   const page=await nojs.newPage();await page.goto(root+'/en/info/islandia-wieloryby-lodowce-atrakcje');
   const cover=page.locator('[data-article-photo="cover"]');await cover.locator('summary').click();
   await expect(cover.getByRole('link',{name:photos.iceland.title,exact:true})).toHaveAttribute('href',photos.iceland.source);
  }finally{await nojs.close();}
  const delivery=[];
  for(const endpoint of ['/api/v1/alerts/status','/api/v1/telegram/status']){
   const response=await context.request.get(root+endpoint),data=await response.json();expect(response.status()).toBe(200);
   expect(data.enabled).toBe(false);expect(data.delivery_enabled).toBe(false);delivery.push({path:endpoint,status:200,enabled:data.enabled,delivery_enabled:data.delivery_enabled});
  }
  expect(errors).toEqual([]);expect(csp).toEqual([]);expect(external).toEqual([]);
  const report={checkedAt:new Date().toISOString(),pages,files,rendered,noJavaScriptCredits:true,delivery,pageErrors:errors,cspViolations:csp,externalAttempts:external};
  fs.writeFileSync(path.join(out,'production.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,files:files.length,rendered:rendered.length,errors,csp,external,delivery}));
 }finally{await context.close();await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
