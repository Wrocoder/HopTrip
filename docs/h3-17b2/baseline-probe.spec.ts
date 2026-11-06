import {test,expect} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import config from '../playwright.config';

test('H3-17b2 production CLS attribution',async({browser,request},info)=>{
 test.setTimeout(150000);
 const servers=config.webServer;if(!Array.isArray(servers))throw Error('servers');
 expect(servers[1].command).toContain('npm run start --');expect(servers[1].env?.NODE_ENV).toBe('production');
 const build=readFileSync('.next/BUILD_ID','utf8').trim();expect(await (await request.get('/deals')).text()).toContain(build);
 const rows:any[]=[];
 for(const width of [390,1440])for(const consent of ['unset','denied'])for(const route of ['/','/deals'])for(const repeat of [0,1]){
  const context=await browser.newContext({viewport:{width,height:900},baseURL:String(info.project.use.baseURL)});
  await context.route('**/*',async r=>{if(!['127.0.0.1','localhost'].includes(new URL(r.request().url()).hostname))await r.abort();else if(r.request().resourceType()==='script'){await new Promise(resolve=>setTimeout(resolve,250));await r.continue();}else await r.continue();});
  await context.addInitScript(({consent})=>{
   if(consent==='denied')localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
   const w=window as any;w.shifts=[];w.lcp=0;
   new PerformanceObserver(list=>{for(const entry of list.getEntries() as any)w.shifts.push({value:entry.value,time:entry.startTime,recent:entry.hadRecentInput,sources:entry.sources.map((s:any)=>({node:s.node?.id||s.node?.className||s.node?.tagName,before:s.previousRect.toJSON(),after:s.currentRect.toJSON()}))});}).observe({type:'layout-shift',buffered:true});
   new PerformanceObserver(list=>{for(const e of list.getEntries())w.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  },{consent});
  const page=await context.newPage();await page.goto(route);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
  const metrics=await page.evaluate(()=>{const w=window as any;let max=0,sum=0,start=0,last=0;for(const e of w.shifts.filter((e:any)=>!e.recent)){if(e.time-last>1000||e.time-start>5000){sum=0;start=e.time;}sum+=e.value;max=Math.max(max,sum);last=e.time;}return {cls:max,lcp:w.lcp,shifts:w.shifts,contentTop:document.getElementById('content')!.getBoundingClientRect().top,panelHeight:document.querySelector('.consent-panel')?.getBoundingClientRect().height??0};});
  rows.push({width,consent,route,repeat,...metrics});
  if(repeat===0&&route==='/deals'&&consent==='unset')await page.screenshot({path:info.outputPath(`baseline-${width}.png`)});
  await context.close();
 }
 writeFileSync(info.outputPath('cls-baseline.json'),JSON.stringify({build,command:servers[1].command,nodeEnv:servers[1].env?.NODE_ENV,scriptDelayMs:250,settleMs:1200,rows},null,2));
 console.log(rows.map(({width,consent,route,cls})=>({width,consent,route,cls})));
});
