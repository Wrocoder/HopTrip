// Read-only public checks and isolated browser storage; never open affiliate links.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const {chromium,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const base='https://hoptrip.pl';
const deals=await(await fetch(base+'/api/v1/deals?destination=london&limit=3')).json();
const deal=deals.find(item=>item.events_supported&&item.trip_type==='ROUND_TRIP');
if(!deal)throw Error('No active London trip');
async function search(day,category='MUSIC'){
 const response=await fetch(base+`/api/v1/deals/${deal.slug}/events?`+new URLSearchParams({date_mode:'other',start_date:day,end_date:day,category}));
 if(!response.ok)throw Error('Event API failed: '+response.status);
 return response.json();
}
const grouped=await search('2026-11-21');
const duke=grouped.events.filter(item=>item.name==='Duke Dumont');
if(duke.length!==1||duke[0].ticket_options.length!==2)throw Error('Real Duke options not grouped');
if(new Set(duke[0].ticket_options.map(item=>item.url)).size!==2)throw Error('Variant links lost');
const sessions=(await search('2026-11-13')).events.filter(item=>item.name==='Robert Glasper');
if(sessions.length!==2||new Set(sessions.map(item=>item.local_time)).size!==2)throw Error('Glasper sessions lost');
if((await search('2026-10-26','SPORTS')).status!=='EMPTY')throw Error('Empty live fixture changed');
const report={checked_at:new Date().toISOString(),slug:deal.slug,duke:duke.map(item=>({id:item.id,options:item.ticket_options.map(option=>({id:option.id,kind:option.ticket_kind,currency:option.currency,price:option.price_from}))})),glasper:sessions.map(item=>({id:item.id,time:item.local_time})),checks:[]};
const browser=await chromium.launch({channel:'msedge',headless:true});
await mkdir(new URL('../docs/releases/',import.meta.url),{recursive:true});
try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1366,height:900},isMobile:mobile,hasTouch:mobile});
  await context.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/deals/'+deal.slug,{waitUntil:'domcontentloaded'});
  const events=page.locator('#trip-events');
  const originalStay=await page.getByLabel('Wymeldowanie',{exact:true}).inputValue();
  await events.getByRole('button',{name:'Inne daty',exact:true}).click();
  async function dates(day,category){
   await events.getByLabel('Od',{exact:true}).fill(day);await events.getByLabel('Do',{exact:true}).fill(day);
   await events.getByLabel('Kategoria').selectOption(category);
   const ready=page.waitForResponse(response=>response.url().includes('/events?')&&new URL(response.url()).searchParams.get('start_date')===day&&new URL(response.url()).searchParams.get('category')===category);
   await events.getByRole('button',{name:'Pokaż wydarzenia',exact:true}).click();await ready;
  }
  await dates('2026-11-21','MUSIC');
  const dukeCard=events.getByRole('listitem').filter({has:page.getByRole('heading',{name:'Duke Dumont',exact:true})});
  await expect(dukeCard).toHaveCount(1);await expect(dukeCard.getByRole('link')).toHaveCount(2);
  await expect(dukeCard).toContainText('Oferta podstawowa');await expect(dukeCard).toContainText('Premium');
  if(mobile)await page.setViewportSize({width:320,height:844});
  await dukeCard.screenshot({path:new URL('../docs/releases/event-options-'+(mobile?'mobile':'desktop')+'-20261025.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
  await dates('2026-11-13','MUSIC');
  await expect(events.getByRole('heading',{name:'Robert Glasper',exact:true})).toHaveCount(2);
  await dates('2026-10-26','SPORTS');
  await expect(events).toContainText('Pusta lista nie oznacza');
  await expect(events.getByRole('button',{name:'Zmień okres wyszukiwania'})).toBeVisible();
  const attractions=events.getByRole('link',{name:'Zobacz atrakcje w mieście'});await expect(attractions).toHaveAttribute('href','#destination-activities');
  await expect(page.getByLabel('Wymeldowanie',{exact:true})).toHaveValue(originalStay);
  const violations=(await new AxeBuilder({page}).include('#trip-events').analyze()).violations;
  if(violations.length)throw Error('Accessibility: '+violations.map(item=>item.id).join(','));
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('Horizontal overflow');
  // Axe probes keyboard focus; remove its focus ring before the evidence screenshot.
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
  await events.screenshot({path:new URL('../docs/releases/empty-events-'+(mobile?'mobile':'desktop')+'-20261025.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
  const cleared=page.waitForResponse(response=>response.url().includes('/events?')&&new URL(response.url()).searchParams.get('category')==='ALL');
  await events.getByRole('button',{name:'Pokaż wszystkie kategorie'}).click();await cleared;
  await expect(events.getByLabel('Kategoria')).toHaveValue('ALL');
  await expect(page.getByLabel('Wymeldowanie',{exact:true})).toHaveValue(originalStay);
  // The category reset may find events, so check the anchor through its known target.
  await page.goto(base+'/deals/'+deal.slug+'#destination-activities',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#destination-activities')).toBeVisible();
  if(errors.length)throw Error('Page errors: '+errors.join(';'));
  report.checks.push({viewport:mobile?'mobile-320':'desktop',real_ticket_options:true,separate_sessions:true,empty_actions:true,category_reset:true,stay_unchanged:true,attractions_target:true,axe_violations:0,horizontal_overflow:false,page_errors:0});
  await context.close();
 }
}finally{await browser.close();}
await writeFile(new URL('../docs/releases/event-results-20261025.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
