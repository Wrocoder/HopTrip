// Public QA without account/purchase changes. --follow permits bounded real clicks.
// Uses an isolated Chrome profile; never books, logs in or solves challenges.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const args=process.argv.slice(2);
const base=(args.find(x=>x.startsWith('--base='))?.slice(7)??'https://hoptrip.pl').replace(/\/$/,'');
const output=path.resolve(args.find(x=>x.startsWith('--output='))?.slice(9)??'../../docs/v5-07/live');
const follow=args.includes('--follow');
if(new URL(base).protocol!=='https:')throw new Error('Public HTTPS base required');
await mkdir(output,{recursive:true});
const report={date:new Date().toISOString(),base,follow,environment:'isolated installed Chrome, no login, optional analytics declined',catalog:[],cases:[]};
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
const save=()=>writeFile(path.join(output,'results.json'),JSON.stringify(report,null,2));
async function snapshot(page,id){
 await page.waitForLoadState('domcontentloaded',{timeout:20000}).catch(()=>{});
 // Bounded settling for client-side partner redirects; not a performance test.
 await page.waitForTimeout(8000);
 const result={url:page.url(),title:await page.title().catch(()=>''),
  text:(await page.locator('body').innerText({timeout:10000}).catch(()=>'')).slice(0,14000),
  fields:await page.locator('input:visible,select:visible').evaluateAll(elements=>elements.map(e=>({name:e.getAttribute('name'),placeholder:e.getAttribute('placeholder'),value:e.value}))).catch(()=>[])};
 await page.screenshot({path:path.join(output,`${id}.png`),fullPage:false}).catch(()=>{});
 return result;
}
try{
 const items=[];
 for(let offset=0;offset<300;offset+=100){
  const url=`${base}/api/v1/deals?include_total=true&round_trip=true&sort=departure&limit=100&offset=${offset}`;
  const response=await context.request.get(url,{timeout:30000});
  report.catalog.push({url,status:response.status()});
  if(!response.ok())break;
  const payload=await response.json();items.push(...payload.items);
  if(offset+100>=payload.total)break;
 }
 const available=items.filter(d=>d.components.some(c=>c.component_type==='FLIGHT'&&c.available&&c.redirect_path));
 const same=d=>d.flight_facts?.destination_airport===d.flight_facts?.return_origin_airport&&d.flight_facts?.origin_airport===d.flight_facts?.return_destination_airport;
 const selected=[['simple',available.find(d=>same(d)&&d.flight_facts?.outbound_stops===0&&d.flight_facts?.return_stops===0)],
  ['connection',available.find(d=>d.connection_assessment?.connections?.length>0)],
  ['different-airports',available.find(d=>!same(d)&&d.flight_facts?.return_origin_airport)]];
 for(const [id,deal] of selected){
  if(!deal){report.cases.push({id,status:'NO_PUBLIC_SAMPLE'});continue;}
  const item={id,slug:deal.slug,source_url:`${base}/deals/${deal.slug}`,expected:{trip_start:deal.trip_start,trip_end:deal.trip_end,
   travelers:deal.travelers??null,facts:deal.flight_facts,connections:deal.connection_assessment},checks:[]};
  report.cases.push(item);await save();
  const page=await context.newPage();await page.goto(item.source_url,{waitUntil:'domcontentloaded',timeout:45000});
  item.source=await snapshot(page,`${id}-source`);
  const flight=page.locator('.booking-card a.cta');
  item.flight_cta={count:await flight.count(),href:await flight.first().getAttribute('href').catch(()=>null)};
  if(follow&&item.flight_cta.count===1){
   const chain=[];page.on('response',response=>{if(response.request().isNavigationRequest()&&response.frame()===page.mainFrame())chain.push({url:response.url(),status:response.status()});});
   await flight.click({timeout:20000}).catch(error=>item.flight_error=error.message);
   item.flight_actual=await snapshot(page,`${id}-flight-final`);item.flight_chain=chain;
   // The script records evidence; URL matching alone is never a final-route PASS.
  }
  await page.close();await save();
 }
 const page=await context.newPage();await page.goto(`${base}/info/barcelona-3-days`,{waitUntil:'domcontentloaded',timeout:45000});
 const activity=page.locator('#destination-activities a[rel*="sponsored"]').first();
 const activityCase={id:'tiqets-barcelona',source_url:page.url(),count:await activity.count()};
 report.cases.push(activityCase);
 if(activityCase.count){
  activityCase.href=await activity.getAttribute('href');activityCase.label=await activity.innerText();
  if(follow){const opened=context.waitForEvent('page',{timeout:20000});await activity.click();const target=await opened;
   activityCase.actual=await snapshot(target,'tiqets-final');await target.close();}
 }
 await page.close();
 const stayDeal=selected.find(([id,d])=>id==='different-airports'&&d)?.[1]??selected[0][1];
 if(stayDeal){
  const page=await context.newPage();await page.goto(`${base}/deals/${stayDeal.slug}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('#stay-adults').fill('2');
  const stay={id:'stay22',source_url:page.url(),expected:{checkin:await page.locator('#stay-checkin').inputValue(),
   checkout:await page.locator('#stay-checkout').inputValue(),adults:2,destination:stayDeal.destination_city},
   limitation:await page.locator('#accommodation').innerText()};
  report.cases.push(stay);
  const link=page.locator('#accommodation a[rel*="sponsored"]');stay.count=await link.count();
  if(stay.count===1){stay.href=await link.getAttribute('href');if(follow){const opened=context.waitForEvent('page',{timeout:20000});await link.click();const target=await opened;
   stay.actual=await snapshot(target,'stay22-final');await target.close();}}
  await page.close();
 }
}catch(error){report.error=error.message;process.exitCode=1;}
finally{await save();await context.close();await browser.close();}
console.log(JSON.stringify({output,catalog:report.catalog,cases:report.cases.map(c=>({id:c.id,slug:c.slug,status:c.status,flight_url:c.flight_actual?.url,actual:c.actual?.url})),error:report.error},null,2));
