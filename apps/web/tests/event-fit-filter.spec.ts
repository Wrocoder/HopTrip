import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {eventFitFilterCopy} from '../src/lib/i18n/event-fit-filter-copy';
import {eventFitCopy} from '../src/lib/i18n/event-fit-copy';
import {eventCopy,eventUx} from '../src/lib/i18n/event-copy';
import {eventResultsCopy} from '../src/lib/i18n/event-results-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import type {EventFlightFit} from '../src/lib/event-flight-fit';
const assessment=(status:EventFlightFit['status'],reasons:EventFlightFit['reasons']=[]):EventFlightFit=>({status,reasons,buffer_minutes:180,arrival_gap_minutes:600,return_gap_minutes:900,return_start_gap_minutes:1020,duration_minutes:120,arrival_airport:'BCN',return_airport:'BCN',arrival_estimated:false});
const ticket='https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2Fsynthetic';
const row=(id:string,day:string,status='onsale')=>({id,name:id,category:'MUSIC',venue:'Synthetic hall',city:'Barcelona',start_date:day,end_date:null,local_time:'18:00:00',timezone:'Europe/Madrid',status,price_from:null,currency:null,url:ticket});
const cards=(page:Page)=>page.locator('#trip-events > ul > li');
const fits={Known:assessment('NO_KNOWN_CONFLICT'),Conflict:assessment('CONFLICT',['AFTER_RETURN']),Tight:assessment('TIGHT',['ARRIVAL_BUFFER']),Unknown:{...assessment('CHECK',['UNKNOWN_DURATION']),duration_minutes:null,return_gap_minutes:null},Offsale:assessment('NO_KNOWN_CONFLICT')};
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));});
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: filter keeps uncertain events, explains may-fit, preserves the budget and recovers from filtered empty`,async({page},info)=>{
 const copy=eventFitFilterCopy[locale],calls:URLSearchParams[]=[],analytics:string[]=[];
 page.on('request',r=>{if(r.url().includes('/analytics/events'))analytics.push(r.url());});
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const p=new URL(route.request().url()).searchParams;calls.push(p);const mode=p.get('fit_mode'),day=p.get('start_date')!;
  const ids=(p.get('category')==='SPORTS'?['Conflict']:Object.keys(fits)).filter(id=>mode!=='possible'||id!=='Conflict');
  return route.fulfill({json:{status:ids.length?'READY':'EMPTY',fit_mode:mode,partial:false,checked_at:'2030-11-01T10:00:00Z',total:ids.length,page:1,page_size:12,has_more:false,events:ids.map(id=>row(id,day,id==='Offsale'?'offsale':'onsale')),flight_fit:Object.fromEntries(ids.map(id=>[id,fits[id as keyof typeof fits]]))}});
 });
 await page.goto(localizedHref('/deals/browser-13',locale));const section=page.locator('#trip-events'),filter=section.getByRole('combobox',{name:copy.label,exact:true});
 await expect(cards(page)).toHaveCount(5);await expect(filter).toHaveValue('all');await expect(section.getByRole('heading',{name:'Known',exact:true}).locator('..')).toContainText(eventFitCopy[locale].status.NO_KNOWN_CONFLICT);
 await page.locator('#budget-food').fill('52.25');await filter.focus();await page.keyboard.press('End');await expect(filter).toHaveValue('possible');await expect(cards(page)).toHaveCount(4);await expect(filter).toBeFocused();
 await expect(section.getByRole('heading',{name:'Conflict',exact:true})).toHaveCount(0);for(const name of ['Tight','Unknown'])await expect(section.getByRole('heading',{name,exact:true})).toBeVisible();
 const offsale=cards(page).filter({has:page.getByRole('heading',{name:'Offsale',exact:true})});await expect(offsale.getByRole('link')).toHaveCount(0);await expect(offsale.getByRole('button')).toHaveCount(0);
 await expect(section.locator('#event-fit-filter-hint')).toHaveText(copy.hint);await expect(page.locator('#budget-food')).toHaveValue('52.25');
 expect(calls.at(-1)?.get('date_mode')).toBe('stay');expect([...calls.at(-1)!.keys()].sort()).toEqual(['category','date_mode','end_date','fit_mode','page','start_date']);
 expect((await new AxeBuilder({page}).include('#trip-events').analyze()).violations).toEqual([]);await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await section.screenshot({path:info.outputPath('event-fit-filter-320.png'),scale:'css',animations:'disabled'});
 await section.getByRole('combobox',{name:eventCopy[locale].category,exact:true}).selectOption('SPORTS');await expect(cards(page)).toHaveCount(0);await expect(section.getByRole('heading',{name:copy.empty,exact:true})).toBeVisible();
 await section.getByRole('button',{name:copy.showAll,exact:true}).click();await expect(filter).toHaveValue('all');await expect(section.getByRole('heading',{name:'Conflict',exact:true})).toBeVisible();await expect(page.locator('#budget-food')).toHaveValue('52.25');expect(analytics).toEqual([]);
});
test('fit changes reset pages and days; independent dates still require explicit search',async({page})=>{
 const calls:URLSearchParams[]=[];
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const p=new URL(route.request().url()).searchParams;calls.push(p);const pageNumber=Number(p.get('page')),day=p.get('start_date')!;
  const ids=Array.from({length:pageNumber===1?12:1},(_,i)=>'Event '+((pageNumber-1)*12+i+1));
  return route.fulfill({json:{status:'READY',fit_mode:p.get('fit_mode'),total:13,page:pageNumber,page_size:12,has_more:pageNumber===1,events:ids.map(id=>row(id,day)),flight_fit:Object.fromEntries(ids.map(id=>[id,assessment('CHECK',['UNKNOWN_DURATION'])]))}});
 });
 await page.goto('/deals/browser-13');const section=page.locator('#trip-events'),filter=section.getByRole('combobox',{name:eventFitFilterCopy.pl.label,exact:true});await expect(cards(page)).toHaveCount(12);
 await section.getByRole('button',{name:eventResultsCopy.pl.nextPage,exact:true}).click();await expect(section.getByRole('heading',{name:'Event 13',exact:true})).toBeVisible();
 await filter.selectOption('possible');await expect(cards(page)).toHaveCount(12);expect(calls.at(-1)?.get('page')).toBe('1');
 const days=section.getByRole('combobox',{name:eventResultsCopy.pl.browseDays,exact:true});const day=await days.locator('option').nth(1).getAttribute('value');await days.selectOption(day!);await expect.poll(()=>calls.at(-1)?.get('event_date')).toBe(day);
 await filter.selectOption('all');await expect(days).toHaveValue('');await expect.poll(()=>calls.at(-1)?.get('fit_mode')).toBe('all');expect(calls.at(-1)?.has('event_date')).toBe(false);
 await section.getByRole('button',{name:eventUx.pl.otherDates,exact:true}).click();const count=calls.length;await filter.selectOption('possible');await page.waitForTimeout(250);expect(calls).toHaveLength(count); // Exceeds the 150ms request coalescing interval.
 await section.getByRole('button',{name:eventCopy.pl.search,exact:true}).click();await expect.poll(()=>calls.at(-1)?.get('date_mode')).toBe('other');expect(calls.at(-1)?.get('fit_mode')).toBe('possible');
});
test('an older API cannot silently ignore the filter; inconsistent assessments fail closed and can be retried',async({page})=>{
 let variant:'legacy'|'invalid'|'valid'='legacy';
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const p=new URL(route.request().url()).searchParams,possible=p.get('fit_mode')==='possible',id=variant==='invalid'?'Conflict':'Unknown';
  return route.fulfill({json:{status:'READY',...(variant!=='legacy'?{fit_mode:possible?'possible':'all'}:{}),events:[row(id,p.get('start_date')!)],flight_fit:{[id]:fits[id]}}});
 });
 await page.goto('/deals/browser-13');const section=page.locator('#trip-events'),copy=eventFitFilterCopy.pl,filter=section.getByRole('combobox',{name:copy.label,exact:true});await expect(cards(page)).toHaveCount(1);
 await filter.selectOption('possible');await expect(section.getByRole('status')).toContainText(copy.unsupported);await expect(cards(page)).toHaveCount(0);await section.getByRole('button',{name:copy.showAll,exact:true}).click();await expect(cards(page)).toHaveCount(1);
 variant='invalid';await filter.selectOption('possible');await expect(section.getByRole('status')).toContainText(eventCopy.pl.unavailable);await expect(cards(page)).toHaveCount(0);
 variant='valid';await section.getByRole('button',{name:eventUx.pl.retry,exact:false}).click();await expect(section.getByRole('heading',{name:'Unknown',exact:true})).toBeVisible();
});
test('a late filter response cannot replace the currently selected mode even when fetch ignores abort',async({page})=>{
 await page.addInitScript(({fit,ticket})=>{
  const fetch=window.fetch.bind(window),flags=window as typeof window&{held?:boolean;release?:()=>void;released?:boolean};
  window.fetch=(input,init)=>{
   const url=new URL(typeof input==='string'?input:input instanceof Request?input.url:input.href,location.href);if(!url.pathname.endsWith('/events'))return fetch(input,init);
   const mode=url.searchParams.get('fit_mode'),id=mode==='possible'?'Late possible':'Current all';
   const response=()=>new Response(JSON.stringify({status:'READY',fit_mode:mode,events:[{id,name:id,category:'MUSIC',venue:'Hall',city:'Barcelona',start_date:url.searchParams.get('start_date'),end_date:null,local_time:null,timezone:'Europe/Madrid',status:'onsale',url:ticket,price_from:null,currency:null}],flight_fit:{[id]:fit}}),{headers:{'Content-Type':'application/json'}});
   if(mode==='possible'){flags.held=true;return new Promise(resolve=>{flags.release=()=>{resolve(response());flags.released=true;};});}return Promise.resolve(response());
  };
 },{fit:assessment('CHECK',['UNKNOWN_DURATION']),ticket});
 await page.goto('/deals/browser-13');const section=page.locator('#trip-events'),filter=section.getByRole('combobox',{name:eventFitFilterCopy.pl.label,exact:true});await expect(section.getByRole('heading',{name:'Current all',exact:true})).toBeVisible();
 await filter.selectOption('possible');await expect.poll(()=>page.evaluate(()=>(window as typeof window&{held?:boolean}).held)).toBe(true);await expect(cards(page)).toHaveCount(0);
 await filter.selectOption('all');await expect(section.getByRole('heading',{name:'Current all',exact:true})).toBeVisible();await page.evaluate(()=>(window as typeof window&{release:()=>void}).release());await page.waitForTimeout(250);
 await expect(section.getByRole('heading',{name:'Current all',exact:true})).toBeVisible();await expect(section.getByRole('heading',{name:'Late possible',exact:true})).toHaveCount(0);
});
