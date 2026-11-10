import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync,writeFileSync} from 'node:fs';

import {availableHref} from '../src/lib/i18n/routing';

// Baseline observation, not an approval of existing defects. Artifacts survive failures.
const paths=['/','/deals','/tanie-loty-na-weekend','/city-break',
 '/destinations/barcelona','/destinations/milan','/deals/browser-deal','/saved',
 '/info/trip-budget','/alerts'].filter(path=>process.env.HOPTRIP_SKIP_ALERTS!=='1'||path!=='/alerts');
const widths=[320,375,390,768,1440];
test.beforeEach(async({request},info)=>{
 if(process.env.HOPTRIP_H3_PRODUCTION!=='1')return;
 const config=readFileSync(info.config.configFile!,'utf8');expect(config).toContain('npm run start --');expect(config).toContain("NODE_ENV:'production'");

 const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await (await request.get('/deals')).text()).toContain(build);
 await info.attach('execution-mode',{body:JSON.stringify({configFile:info.config.configFile,configSource:config,build}),contentType:'application/json'});
});
for(const locale of ['pl','en','ru','uk'] as const)test(`H3 baseline pages and widths: ${locale}`,async({page,context},info)=>{
 test.skip(info.project.name!=='desktop','The explicit width matrix runs once; touch journeys run separately.');
 test.setTimeout(300000);
 const records:unknown[]=[],errors:string[]=[],external:string[]=[];
 let assetFailures:{url:string;failure:string}[]=[],assetCancellations:{url:string;failure:string}[]=[],httpErrors:{url:string;status:number;type:string}[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('requestfailed',request=>{
  if(['script','stylesheet','font','image'].includes(request.resourceType())){
   const failure={url:new URL(request.url()).pathname,failure:request.failure()?.errorText??'unknown'};
   // Responsive source changes can cancel a superseded image request. Keep the
   // diagnostic and separately require the selected images to finish loading.
   if(request.resourceType()==='image'&&failure.failure==='net::ERR_ABORTED')assetCancellations.push(failure);else assetFailures.push(failure);
  }
 });
 page.on('response',response=>{
  if(response.status()>=400)httpErrors.push({url:new URL(response.url()).pathname,status:response.status(),type:response.request().resourceType()});
 });
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(['127.0.0.1','localhost'].includes(url.hostname))return route.continue();
  external.push(url.origin+url.pathname);return route.abort();
 });
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const save=()=>writeFileSync(info.outputPath(`baseline-${locale}.json`),JSON.stringify({locale,mode:'local synthetic fixture; layout/accessibility, not a performance score',records,errors,external},null,2));
 for(const [index,path] of paths.entries()){
  assetFailures=[];assetCancellations=[];httpErrors=[];
  const href=availableHref(path,locale); // Untranslated destination URLs retain their published PL route.
  try{
   await page.setViewportSize({width:390,height:844});
   const response=await page.goto(href);
   await expect(page.locator('main h1').first()).toBeVisible();
   await page.evaluate(()=>document.fonts.ready);
   const photos=page.locator('main img');
   async function loadImages(){
    for(const image of await photos.all()){
     await image.scrollIntoViewIfNeeded();
     await expect(image).toHaveJSProperty('complete',true);
     await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
   }
   await loadImages();
   const images=await photos.evaluateAll(elements=>elements.map(node=>{const image=node as HTMLImageElement;return {src:new URL(image.currentSrc||image.src).pathname,alt:image.alt,width:image.width,height:image.height,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,loading:image.loading,sizes:image.sizes,srcset:image.srcset};}));
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   const viewports=[];
   for(const width of widths){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
    const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
     overflowing:[...document.querySelectorAll('main *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).slice(0,12).map(el=>({tag:el.tagName,class:el.className})),
     cards:document.querySelectorAll('.deal-card').length}));
    viewports.push({width,...layout});
    expect.soft(layout.overflow,`${href} overflow at ${width}`).toBe(false);
    if((locale==='pl'||index===0)&&(width===320||width===1440))await page.screenshot({path:info.outputPath(`${locale}-${index}-${width}.png`),fullPage:true,animations:'disabled'});
   }
   await loadImages();
   await page.locator('.skip-link').focus();await page.keyboard.press('Enter');await expect(page.locator('#content')).toBeFocused();
   const publishedLocale=href.match(/^\/(en|ru|uk)(\/|$)/)?.[1]??'pl';
   await expect(page.locator('html')).toHaveAttribute('lang',publishedLocale);
   const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(item=>{const entry=item as PerformanceResourceTiming;return {path:new URL(entry.name).pathname,type:entry.initiatorType,startMs:entry.startTime,durationMs:entry.duration,transferBytes:entry.transferSize,encodedBytes:entry.encodedBodySize,decodedBytes:entry.decodedBodySize};}));
   records.push({path,href,status:response?.status(),h1:await page.locator('main h1').allTextContents(),
    canonical:await page.locator('link[rel="canonical"]').getAttribute('href'),publishedLocale,viewports,images,resources,assetFailures,assetCancellations,httpErrors,
    violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
    needsReview:axe.incomplete.map(v=>v.id)});
   expect.soft(response?.status(),href).toBe(200);
   expect.soft(axe.violations.map(v=>v.id),`${href} axe`).toEqual([]);
   expect.soft(assetFailures,`${href} failed assets`).toEqual([]);
   expect.soft(httpErrors,`${href} HTTP errors`).toEqual([]);
  }catch(error){records.push({path,href,error:String(error)});expect.soft(false,`${href}: ${String(error)}`).toBe(true);}
  finally{save();}
 }
 expect.soft(errors,'Browser runtime errors').toEqual([]);
 await info.attach(`baseline-${locale}`,{path:info.outputPath(`baseline-${locale}.json`),contentType:'application/json'});
});
