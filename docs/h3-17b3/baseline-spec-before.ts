import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFileSync} from 'node:fs';
import {availableHref} from '../src/lib/i18n/routing';

// Baseline observation, not an approval of existing defects. Artifacts survive failures.
const paths=['/','/deals','/tanie-loty-na-weekend','/city-break',
 '/destinations/barcelona','/destinations/milan','/deals/browser-deal','/saved',
 '/info/trip-budget','/alerts'];
const widths=[320,375,390,768,1440];
for(const locale of ['pl','en','ru','uk'] as const)test(`H3 baseline pages and widths: ${locale}`,async({page,context},info)=>{
 test.skip(info.project.name!=='desktop','The explicit width matrix runs once, in desktop Chromium. Touch journeys run separately.');
 test.setTimeout(300000);
 const records:unknown[]=[],errors:string[]=[],external:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 await context.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(['127.0.0.1','localhost'].includes(url.hostname))return route.continue();
  external.push(url.origin+url.pathname);return route.abort();
 });
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 const save=()=>writeFileSync(info.outputPath(`baseline-${locale}.json`),JSON.stringify({locale,mode:'local synthetic fixture; layout/accessibility, not a performance score',records,errors,external},null,2));
 for(const [index,path] of paths.entries()){
  const href=availableHref(path,locale); // Untranslated destination URLs retain their published PL route.
  try{
   await page.setViewportSize({width:390,height:844});
   const response=await page.goto(href);
   await expect(page.locator('main h1').first()).toBeVisible();
   await page.evaluate(()=>document.fonts.ready);
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
   records.push({path,href,status:response?.status(),h1:await page.locator('main h1').allTextContents(),
    canonical:await page.locator('link[rel="canonical"]').getAttribute('href'),viewports,
    violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),
    needsReview:axe.incomplete.map(v=>v.id)});
   expect.soft(response?.status(),href).toBe(200);
   expect.soft(axe.violations.map(v=>v.id),`${href} axe`).toEqual([]);
  }catch(error){records.push({path,href,error:String(error)});expect.soft(false,`${href}: ${String(error)}`).toBe(true);}
  finally{save();}
 }
 expect.soft(errors,'Browser runtime errors').toEqual([]);
 await info.attach(`baseline-${locale}`,{path:info.outputPath(`baseline-${locale}.json`),contentType:'application/json'});
});
