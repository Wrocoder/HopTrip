import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync,writeFileSync} from 'node:fs';
import config from '../playwright.config';
import {localizedHref} from '../src/lib/i18n/routing';
import {shell} from '../src/lib/i18n/shell';

type Shift={value:number;time:number;recent:boolean;sources:{node:string;before:DOMRectJSON;after:DOMRectJSON}[]};
type DOMRectJSON={x:number;y:number;width:number;height:number};
type MetricsWindow=Window & {layoutShifts:Shift[];lastLcp:number};

test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','CLS requires the isolated production runner; preserve the default dev suite.');

test.beforeEach(async({request},info)=>{
 const servers=config.webServer;if(!Array.isArray(servers))throw Error('Expected isolated fixture servers');
 expect(process.env.HOPTRIP_H3_PRODUCTION).toBe('1');
 expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
 const build=readFileSync('.next/BUILD_ID','utf8').trim();
 expect(await (await request.get('/deals')).text()).toContain(build);
 await info.attach('execution-mode',{body:JSON.stringify({command:servers[1].command,nodeEnv:servers[1].env?.NODE_ENV,build}),contentType:'application/json'});
});

for(const locale of ['pl','en','ru','uk'] as const){
 test(`${locale}: consent hydration has stable home and catalogue layout`,async({browser},info)=>{
  test.setTimeout(120000);
  const rows:unknown[]=[];
  try{
   for(const consent of ['unset','denied'])for(const path of ['/','/deals'])for(const repeat of [0,1]){
    const width=info.project.name==='mobile'?390:1440;
    const context=await browser.newContext({...info.project.use,viewport:{width,height:900}});
    const errors:string[]=[],external:string[]=[],analytics:string[]=[];
    await context.route('**/*',async route=>{
     const request=route.request(),url=new URL(request.url());
     if(!['127.0.0.1','localhost'].includes(url.hostname)){external.push(url.origin+url.pathname);await route.abort();return;}
     if(url.pathname.includes('/analytics/events'))analytics.push(url.pathname);
     // Let SSR paint before hydration. The second sample also delays local fonts.
     if(request.resourceType()==='script'||(repeat===1&&request.resourceType()==='font'))await new Promise(resolve=>setTimeout(resolve,250));
     await route.continue();
    });
    await context.addInitScript(({consent})=>{
     if(consent==='denied')localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
     const state=window as unknown as MetricsWindow;state.layoutShifts=[];state.lastLcp=0;
     new PerformanceObserver(list=>{
      for(const item of list.getEntries()){
       const entry=item as PerformanceEntry & {value:number;hadRecentInput:boolean;sources:{node?:Element;previousRect:DOMRectReadOnly;currentRect:DOMRectReadOnly}[]};
       state.layoutShifts.push({value:entry.value,time:entry.startTime,recent:entry.hadRecentInput,sources:entry.sources.map(source=>({node:source.node?.id||source.node?.tagName||'',before:source.previousRect.toJSON(),after:source.currentRect.toJSON()}))});
      }
     }).observe({type:'layout-shift',buffered:true});
     new PerformanceObserver(list=>{for(const entry of list.getEntries())state.lastLcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    },{consent});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    try{
     const response=await page.goto(localizedHref(path,locale));expect(response?.status()).toBe(200);
     await expect(page.locator('main h1').first()).toBeVisible();
     if(consent==='unset')await expect(page.locator('.consent-panel')).toBeVisible();
     else await expect(page.getByRole('button',{name:shell[locale].settings,exact:true})).toBeAttached();
     await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
     const metrics=await page.evaluate(()=>{
      const state=window as unknown as MetricsWindow;
      let cls=0,sum=0,start=0,last=0;
      for(const entry of state.layoutShifts.filter(entry=>!entry.recent)){
       if(entry.time-last>1000||entry.time-start>5000){sum=0;start=entry.time;}
       sum+=entry.value;cls=Math.max(cls,sum);last=entry.time;
      }
      return {cls,lcpMs:state.lastLcp,shifts:state.layoutShifts,overflow:document.documentElement.scrollWidth>innerWidth,session:localStorage.getItem('hoptrip.session.v2'),scrollY};
     });
     rows.push({locale,project:info.project.name,width,height:900,consent,path,repeat,fontDelayMs:repeat===1?250:0,...metrics,errors,external,analytics});
     expect(metrics.cls).toBeLessThanOrEqual(.1);expect(metrics.overflow).toBe(false);expect(metrics.scrollY).toBe(0);
     expect(metrics.session).toBeNull();expect(errors).toEqual([]);expect(external).toEqual([]);expect(analytics).toEqual([]);
     await expect(page.locator('.consent-panel')).toHaveCount(consent==='unset'?1:0);
     if(consent==='unset')for(const checkbox of await page.locator('.consent-panel input').all())await expect(checkbox).not.toBeChecked();
    }finally{await context.close();}
   }
  }finally{writeFileSync(info.outputPath('layout-metrics.json'),JSON.stringify(rows,null,2)+'\n');}
 });

 test(`${locale}: privacy panel fits short viewports and preserves keyboard choices`,async({page},info)=>{
  const text=shell[locale];
  await page.goto(localizedHref('/deals',locale));
  const panel=page.locator('.consent-panel');await expect(panel).toBeVisible();
  const layouts:unknown[]=[];
  for(const width of [320,375,390,768,1440]){
   await page.setViewportSize({width,height:480});
   await panel.locator('details').evaluate(el=>{el.setAttribute('open','');});
   const geometry=await panel.evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,viewport:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth};});
   layouts.push({width,...geometry});expect(geometry.top).toBeGreaterThanOrEqual(0);expect(geometry.bottom).toBeLessThanOrEqual(480);expect(geometry.height).toBeLessThanOrEqual(336);expect(geometry.overflow).toBe(false);
   await panel.locator('input').first().focus();
   for(let tab=0;tab<7;tab++)await page.keyboard.press('Tab');
   await expect(panel.getByRole('button',{name:text.save,exact:true})).toBeFocused();
   await expect(panel.getByRole('button',{name:text.save,exact:true})).toBeInViewport({ratio:1});
   for(const button of await panel.locator('button').all())expect(await button.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
   expect((await new AxeBuilder({page}).include('.consent-panel').analyze()).violations).toEqual([]);
   if(width===320||width===1440)await page.screenshot({path:info.outputPath(`privacy-${width}.png`),animations:'disabled'});
  }
  await page.setViewportSize({width:390,height:900});await page.evaluate(()=>document.fonts.ready);
  const contentTop=()=>page.locator('#content').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  const before=await contentTop();
  await panel.getByRole('button',{name:text.reject,exact:true}).click();await expect(panel).toHaveCount(0);expect(await contentTop()).toBe(before);
  const settings=page.getByRole('button',{name:text.settings,exact:true});
  await settings.focus();await page.keyboard.press('Enter');await expect(panel).toBeFocused();expect(await contentTop()).toBe(before);
  await panel.getByRole('checkbox',{name:text.analytics,exact:true}).check();
  await panel.getByRole('button',{name:text.save,exact:true}).click();await expect(panel).toHaveCount(0);await expect(settings).toBeFocused();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hoptrip.consent.v1')!))).toMatchObject({version:1,analytics:true,marketing:false});
  await settings.click();await panel.getByRole('button',{name:text.reject,exact:true}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hoptrip.consent.v1')!))).toMatchObject({version:1,analytics:false,marketing:false});
  await page.reload();await expect(panel).toHaveCount(0);
  writeFileSync(info.outputPath('privacy-layouts.json'),JSON.stringify(layouts,null,2)+'\n');
 });
}
