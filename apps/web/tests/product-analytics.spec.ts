import {localOutbound} from './local-outbound';
import {test,expect,type Page,type BrowserContext} from '@playwright/test';
import {localizedHref} from '../src/lib/i18n/routing';
import {tripText} from '../src/lib/i18n/trip-copy';
import {alertText} from '../src/lib/i18n/alert-copy';
import type {Locale} from '../src/lib/i18n/config';
import type {AnalyticsEventName} from '../src/lib/analytics-context';

type Event={event_name:AnalyticsEventName;deal_slug?:string;filter?:{action:string};metadata:Record<string,string>};
const ticket='https://ticketmaster.evyy.net/synthetic?private=private-ticket-secret';
async function setup(page:Page,context:BrowserContext,allowed=true){
 await page.addInitScript(allowed=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:allowed,marketing:false,at:Date.now()}));},allowed);
 // All external traffic is fulfilled locally, including popup ticket destinations.
 await context.route('https://**',route=>route.fulfill({body:'Synthetic local destination',contentType:'text/html'}));
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const item={id:'private-event-id',name:'Synthetic concert',category:'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',url:ticket,price_from:null,currency:null};
  return route.fulfill({json:{status:'READY',events:[item,{...item,id:'variant-fixture',name:'Synthetic variants',ticket_options:[{id:'private-option',name:'Synthetic standard',ticket_kind:'STANDARD',url:ticket,price_from:null,currency:null}]},{...item,id:'cancelled-fixture',name:'Synthetic cancelled',status:'cancelled'}],partial:false,checked_at:null}});
 });
 const events:Event[]=[],statuses:number[]=[],externalTrackers:string[]=[];
 page.on('request',request=>{
  if(request.url().endsWith('/analytics/events')&&request.method()==='POST')events.push(request.postDataJSON());
  if(/emrld\.ltd|api\.telegram\.org/.test(request.url()))externalTrackers.push(request.url());
 });
 page.on('response',response=>{if(response.url().endsWith('/analytics/events')&&response.request().method()==='POST')statuses.push(response.status());});
 return {events,statuses,externalTrackers};
}
const count=(events:Event[],name:AnalyticsEventName)=>events.filter(e=>e.event_name===name).length;
async function clickTicket(page:Page,variant=false){
 const card=page.locator('#trip-events li').filter({has:page.getByRole('heading',{level:3,name:variant?'Synthetic variants':'Synthetic concert',exact:true})});
 const link=card.locator('a[target="_blank"]');
 await expect(link).toHaveAttribute('rel','sponsored noopener noreferrer');
 const restore=await localOutbound(link);const opened=page.waitForEvent('popup');await link.click();const popup=await opened;await popup.waitForLoadState();await popup.close();await restore();
}
async function signup(page:Page,locale:Locale,email:string){
 await page.getByLabel('Email',{exact:true}).fill(email);
 await page.locator('input[name="consent"]').check();
 await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
}

for(const locale of ['pl','en','ru','uk'] as const)test(`product taxonomy follows real actions without private payloads in ${locale}`,async({page,context,request})=>{
 test.setTimeout(120000);
 const {events,statuses,externalTrackers}=await setup(page,context);
 const flush=async()=>{await expect.poll(()=>statuses.length).toBe(events.length);expect(statuses.every(s=>s===202)).toBe(true);};
 await page.goto(localizedHref('/deals?origin=WRO&budget=300&sort=price',locale));
 await page.locator('.filter-chip').last().click();
 await expect.poll(()=>events.some(e=>e.filter?.action==='remove')).toBe(true);
 await page.locator('.filter-reset').click();
 await expect.poll(()=>events.some(e=>e.filter?.action==='reset')).toBe(true);
 await expect(page).toHaveURL(/sort=price/);
 await page.locator('input[name="budget"]').fill('1');
 await page.locator('.filters button[type="submit"]').click();
 await expect.poll(()=>events.some(e=>e.filter?.action==='apply')).toBe(true);
 await expect.poll(()=>count(events,'SEARCH')).toBe(1);
 expect(events.filter(e=>e.event_name==='FILTER_USE').map(e=>e.filter?.action)).toEqual(['remove','reset','apply']);
 await flush();
 await page.goto(localizedHref('/deals/browser-13',locale));
 await page.locator('#budget-hotel').fill('200');
 await expect.poll(()=>count(events,'BUDGET_USE')).toBe(1);
 const save=page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true});
 await save.click();await expect.poll(()=>count(events,'TRIP_SAVE')).toBe(1);await save.click();
 await clickTicket(page);
 await expect.poll(()=>count(events,'EVENT_CLICK')).toBe(1);
 expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
 await expect(page.locator('#trip-events li').filter({has:page.getByRole('heading',{name:'Synthetic cancelled',exact:true})}).locator('a')).toHaveCount(0);
 await flush();
 await page.goto(localizedHref('/saved',locale));
 await page.locator('main ul li button').click();
 await expect.poll(()=>count(events,'TRIP_REMOVE')).toBe(1);
 expect(events.find(e=>e.event_name==='TRIP_REMOVE')?.metadata.page_type).toBe('saved');
 expect(count(events,'TRIP_SAVE')).toBe(1);
 await flush();
 await page.goto(localizedHref('/alerts?origin=WRO',locale));
 await page.getByRole('button',{name:alertText(locale,'Wyślij link potwierdzający'),exact:true}).click();
 expect(count(events,'ALERT_STARTED')).toBe(0);
 const email=`taxonomy-${crypto.randomUUID()}@example.test`;
 await signup(page,locale,email);
 await expect(page.getByRole('status')).toContainText(alertText(locale,'Sprawdź skrzynkę i spam. Jeśli adres może otrzymywać alerty, dostaniesz link do potwierdzenia lub zarządzania. Prośba o zapis nie oznacza potwierdzonej subskrypcji. Link wysyłamy najwyżej raz na dobę.'));
 expect(count(events,'ALERT_STARTED')).toBe(1);expect(count(events,'ALERT_CONFIRMED')).toBe(0);
 await flush();
 const api=process.env.HOPTRIP_API_URL??'http://127.0.0.1:8100';
 const response=await request.get(`${api}/__test__/mail?email=${encodeURIComponent(email)}`);expect(response.ok()).toBe(true);
 const mail=await response.json(),confirm=mail[0].body.match(/http[^\s]+\/alerts\/confirm#token=[^\s]+/)[0];
 expect(new URL(confirm).origin).toBe(new URL(page.url()).origin);
 await page.goto(confirm);
 await page.getByRole('button',{name:alertText('pl','Potwierdzam zapis'),exact:true}).click();
 await expect.poll(()=>count(events,'ALERT_CONFIRMED')).toBe(1);
 await flush();
 expect(JSON.stringify(events)).not.toMatch(/private|taxonomy-|example\.test|email|token|plan=|Synthetic/);
 expect(externalTrackers).toEqual([]);
 // Withdrawal persists over a full navigation, including an explicit signup attempt.
 await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
 await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 const before=events.length;
 await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
 await page.goto('/alerts?origin=WRO');await signup(page,'pl','withdrawn@example.test');
 await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
 expect(events).toHaveLength(before);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
});

test('ticket variants emit the same minimal click and failures never block navigation',async({page,context})=>{
 const {events}=await setup(page,context);
 await page.route('**/analytics/events',route=>route.abort('failed'));
 await page.goto('/deals/browser-13');await clickTicket(page,true);
 expect(count(events,'EVENT_CLICK')).toBe(1);
 expect(events.find(e=>e.event_name==='EVENT_CLICK')?.deal_slug).toBe('browser-13');
 expect(JSON.stringify(events)).not.toMatch(/private|Synthetic|ticketmaster/);
});

test('denied consent suppresses filter, ticket, save, remove and signup analytics',async({page,context})=>{
 const {events}=await setup(page,context,false);
 await page.goto('/deals?budget=300');await page.locator('.filter-reset').click();
 await page.goto('/deals/browser-13');await clickTicket(page);
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await page.goto('/saved');await page.locator('main ul li button').click();
 await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
 await page.goto('/alerts?origin=WRO');await signup(page,'pl','denied@example.test');
 await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
 expect(events).toEqual([]);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
});

test('failed saved-trip write emits no remove and leaves the plan available',async({page,context})=>{
 const {events}=await setup(page,context);
 await page.goto('/deals/browser-13');await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await page.goto('/saved');await expect(page.locator('main ul li button')).toHaveCount(1);
 await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key.includes('saved'))throw Error('Synthetic storage failure');return original.call(this,key,value);};});
 await page.locator('main ul li button').click();
 await expect(page.getByRole('status')).toContainText('Nie udało się usunąć planu');
 expect(count(events,'TRIP_REMOVE')).toBe(0);await expect(page.locator('main ul li button')).toHaveCount(1);
});

test('a failed signup counts one start per visit and never reports completion',async({page,context})=>{
 const {events}=await setup(page,context);
 await page.route('**/api/v1/alerts',route=>route.fulfill({status:503,json:{detail:'Synthetic unavailable'}}));
 await page.goto('/alerts?origin=WRO');await signup(page,'pl','failed@example.test');
 await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
 await signup(page,'pl','failed@example.test');await expect(page.getByRole('status')).toContainText('Nie udało się wykonać operacji');
 expect(events.map(e=>e.event_name)).toEqual(['ALERT_STARTED']);
});
