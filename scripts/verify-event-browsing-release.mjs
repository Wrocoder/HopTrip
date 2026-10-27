// Public GET requests and isolated browser storage. No provider sync or partner clicks.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const {chromium,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const base=process.env.HOPTRIP_VERIFY_BASE??'https://hoptrip.pl';
const output=new URL('../docs/event-browsing-20261027/',import.meta.url);
await mkdir(output,{recursive:true});
async function get(path){const r=await fetch(base+path);if(!r.ok)throw Error(`HTTP ${r.status}: ${path}`);return r.json();}
const catalogue=await get('/api/v1/deals?destination=london&limit=10');
const deals=Array.isArray(catalogue)?catalogue:catalogue.items;
let deal,first;
for(const candidate of deals){
 if(!candidate.events_supported||candidate.trip_type!=='ROUND_TRIP')continue;
 const result=await get(`/api/v1/deals/${candidate.slug}/events?`+new URLSearchParams({date_mode:'stay',start_date:candidate.trip_start,end_date:candidate.trip_end,category:'ALL'}));
 if(result.status==='READY'&&result.total>12){deal=candidate;first=result;break;}
}
if(!deal)throw Error('No current London trip with more than twelve event cards');
const query={date_mode:'stay',start_date:deal.trip_start,end_date:deal.trip_end,category:'ALL'};
const events=extra=>get(`/api/v1/deals/${deal.slug}/events?`+new URLSearchParams({...query,...extra}));
if(first.page!==1||first.events.length!==12||!first.has_more)throw Error('First page metadata');
const second=await events({page:'2'});
if(second.page!==2||!second.events.length||second.events.some(e=>first.events.some(f=>f.id===e.id)))throw Error('Second page missing or overlapping');
const next=new Date(deal.trip_start+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);
const day=next.toISOString().slice(0,10),selected=await events({event_date:day,page:'1'});
if(selected.event_date!==day||selected.start_date!==deal.trip_start||selected.end_date!==deal.trip_end)throw Error('Day changed search dates');
if(!selected.events.length||selected.events.some(e=>e.start_date>day||(e.end_date??e.start_date)<day))throw Error('Wrong selected day');
for(const result of [first,second,selected]){
 if(result.events.length>12||Object.keys(result.flight_fit).length!==result.events.length)throw Error('Invalid page or assessments');
 if(result.has_more!==(result.page*result.page_size<result.total))throw Error('Pagination metadata');
}
const report={checked_at:new Date().toISOString(),read_only:true,physical_device:false,slug:deal.slug,
 start:deal.trip_start,end:deal.trip_end,api:{total:first.total,first:first.events.map(e=>e.id),second:second.events.map(e=>e.id),
  selected_day:day,selected_total:selected.total,partial:first.partial,checked_at:first.checked_at},checks:[]};
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL??'msedge'});
try{for(const width of [320,390,1440]){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,locale:'pl-PL'});
 try{
  await context.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/deals/'+deal.slug,{waitUntil:'load'});
  const section=page.locator('#trip-events'),days=section.getByLabel('Przeglądaj dni');
  await expect(section.getByRole('status')).toContainText(`1–12 z ${first.total}`);
  await expect(section.locator('details[open]')).toHaveCount(0);
  await expect(section.getByRole('note').first()).toBeVisible();
  const disclosure=section.getByRole('note').locator('summary').first();
  if(await disclosure.count()){await disclosure.click();await expect(section.getByRole('note').locator('details[open]')).toHaveCount(1);await disclosure.click();}
  await section.getByRole('button',{name:'Następna strona',exact:true}).click();
  await expect(section.getByRole('status')).toContainText(`13–${12+second.events.length} z ${second.total}`);
  await days.selectOption(day);
  await expect(section.getByRole('status')).toContainText(`1–${selected.events.length} z ${selected.total}`);
  await expect(page.locator('#stay-checkin')).toHaveValue(deal.trip_start);
  await expect(page.locator('#stay-checkout')).toHaveValue(deal.trip_end);
  const violations=(await new AxeBuilder({page}).include('#trip-events').analyze()).violations;
  if(violations.length)throw Error('Axe '+JSON.stringify(violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))));
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
  if(errors.length)throw Error('Page errors: '+errors.join('; '));
  await days.scrollIntoViewIfNeeded();
  await section.screenshot({path:new URL(`live-${width}.png`,output).pathname.replace(/^\/([A-Z]:)/,'$1')});
  report.checks.push({width,browser:browser.version(),axe_scope:'#trip-events',axe:0,page_errors:errors,
   overflow:false,second_page:true,selected_day:day,stay_unchanged:true});
  console.log(JSON.stringify(report.checks.at(-1)));
 }finally{await context.close();}
}}finally{await browser.close();}
await writeFile(new URL('live-check.json',output),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({slug:deal.slug,total:first.total,selected_day:day,selected_total:selected.total}));
