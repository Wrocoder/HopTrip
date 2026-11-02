import {localOutbound} from './local-outbound';
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {eventCopy} from '../src/lib/i18n/event-copy';
import {eventContextCopy} from '../src/lib/i18n/event-context-copy';
import {plannedEventsCopy} from '../src/lib/i18n/planned-events-copy';

test.setTimeout(60000);
const ticket=(id:string)=>`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.es%2Fevent%2F${id}`;
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

for(const locale of ['pl','en','ru','uk'] as const)test(`event context and OTHER filter preserve the plan in ${locale}`,async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 const calls:URLSearchParams[]=[];
 const t=eventCopy[locale],copy=eventContextCopy[locale],plan=plannedEventsCopy[locale];
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const params=new URL(route.request().url()).searchParams;calls.push(params);
  const other=params.get('category')==='OTHER';
  return route.fulfill({json:{status:'READY',partial:false,checked_at:null,total:1,has_more:false,
   events:[{id:other?'other':'concert',name:other?'TRIP-04 other event':'TRIP-04 synthetic concert',
    category:other?'OTHER':'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:params.get('start_date'),end_date:null,
    local_time:other?null:'20:00:00',timezone:'Europe/Madrid',status:'onsale',price_from:null,currency:null,
    url:ticket(other?'other':'concert')}],
  }});
 });
 await page.goto(`${locale==='pl'?'':`/${locale}`}/deals/browser-13`);
 const events=page.locator('#trip-events');
 const card=events.locator(':scope > ul > li');
 await expect(card.getByRole('heading',{name:'TRIP-04 synthetic concert',exact:true})).toBeVisible();
 await expect(card).toContainText(t.music);
 await expect(card).toContainText('Synthetic venue');await expect(card).toContainText('20:00');
 await expect(card).toContainText(`${copy.zone}: Europe/Madrid`);
 await expect(card).toContainText(copy.sale.onsale);
 await expect(events).toContainText(t.source);await expect(events).toContainText(copy.unknownCheck);
 await expect(events).toContainText(copy.availability);
 await expect(card.locator('img')).toHaveCount(0);
 await expect(card.locator('a[href^="https://ticketmaster.evyy.net/"]')).toHaveAttribute('href',ticket('concert'));
 const start=await page.locator('#budget-start').inputValue(),end=await page.locator('#budget-end').inputValue();
 await expect(card.locator('time')).toHaveAttribute('datetime',start);
 await page.locator('#budget-flight').fill('100');await page.locator('#budget-people').fill('2');
 await card.getByRole('button',{name:`${plan.add}: TRIP-04 synthetic concert`,exact:true}).click();
 const selected=page.locator('#planned-events');
 await selected.getByLabel(plan.quantity,{exact:true}).fill('2');
 await selected.getByLabel(plan.unitPrice,{exact:true}).fill('12,34');
 await expect(page.getByTestId('budget-total')).toHaveText(/224[,.]68/);
 await events.getByRole('combobox',{name:t.category,exact:true}).selectOption('OTHER');
 await expect(card.getByRole('heading',{name:'TRIP-04 other event',exact:true})).toBeVisible();
 await expect(card).toContainText(t.other);await expect(card).toContainText(t.unknownTime);
 await expect(card).not.toContainText('20:00');
 expect(calls.at(-1)?.get('category')).toBe('OTHER');
 expect(calls.at(-1)?.get('start_date')).toBe(start);expect(calls.at(-1)?.get('end_date')).toBe(end);
 expect(calls.at(-1)?.get('date_mode')).toBe('stay');expect(calls.at(-1)?.get('page')).toBe('1');
 await expect(page.locator('#budget-end')).toHaveValue(end);
 await expect(page.locator('#budget-flight')).toHaveValue('100');
 await expect(selected.getByRole('heading',{name:'TRIP-04 synthetic concert',exact:true})).toBeVisible();
 await expect(page.getByTestId('budget-total')).toHaveText(/224[,.]68/);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('#trip-events').include('#planned-events').analyze()).violations).toEqual([]);
 await events.screenshot({path:testInfo.outputPath(`event-context-${locale}-320.png`),scale:'css'});
 expect(errors).toEqual([]);
});

test('inactive and unknown sales have no booking or add action; mixed options keep their own status',async({page,context})=>{
 await context.route('https://ticketmaster.evyy.net/**',route=>route.fulfill({contentType:'text/html',body:'<title>Local ticket fixture</title><p>Synthetic ticket page</p>'}));
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const day=new URL(route.request().url()).searchParams.get('start_date');
  const base={category:'MUSIC',venue:'Synthetic venue',city:'Barcelona',start_date:day,end_date:null,
   local_time:'20:00:00',timezone:'Europe/Madrid',status:'onsale',price_from:null,currency:null};
  return route.fulfill({json:{status:'READY',partial:false,checked_at:'invalid',events:[
   {...base,id:'off',name:'Inactive sale fixture',status:'offsale',url:ticket('off')},
   {...base,id:'unknown',name:'Unknown sale fixture',status:'unexpected',url:ticket('unknown')},
   {...base,id:'changed',name:'Rescheduled fixture',status:'rescheduled',url:ticket('changed')},
   {...base,id:'missing',name:'Missing metadata fixture',venue:'',city:'',timezone:'Invalid/Zone',local_time:null,url:ticket('missing')},
   {...base,id:'variants',name:'Variant status fixture',url:ticket('variants'),ticket_options:[
    {id:'standard',name:'Synthetic standard',ticket_kind:'STANDARD',status:'onsale',url:ticket('standard'),price_from:null,currency:null},
    {id:'premium',name:'Synthetic premium',ticket_kind:'PREMIUM',status:'offsale',url:ticket('premium'),price_from:'120',currency:'EUR'},
   ]},
  ]}});
 });
 await page.goto('/deals/browser-13');
 const events=page.locator('#trip-events');
 const card=(name:string)=>events.locator(':scope > ul > li').filter({has:page.getByRole('heading',{name,exact:true})});
 for(const [name,label] of [['Inactive sale fixture',eventContextCopy.pl.sale.offsale],['Unknown sale fixture',eventContextCopy.pl.sale.unknown]]){
  await expect(card(name)).toContainText(label);
  await expect(card(name).getByRole('link')).toHaveCount(0);
  await expect(card(name).getByRole('button')).toHaveCount(0);
 }
 await expect(card('Rescheduled fixture')).toContainText(eventCopy.pl.rescheduled);
 await expect(card('Rescheduled fixture').getByRole('link')).toHaveAttribute('href',ticket('changed'));
 const missing=card('Missing metadata fixture');
 for(const text of [eventContextCopy.pl.unknownVenue,eventContextCopy.pl.unknownCity,eventContextCopy.pl.unknownZone,eventCopy.pl.unknownTime])await expect(missing).toContainText(text);
 await expect(missing.getByRole('button',{name:/Dodaj do planu/})).toBeDisabled();
 await expect(events).toContainText(eventContextCopy.pl.unknownCheck);
 const variants=card('Variant status fixture');
 await expect(variants.getByRole('link')).toHaveCount(1);
 await expect(variants.getByRole('link')).toHaveAttribute('href',ticket('standard'));
 await expect(variants.getByRole('button',{name:/Dodaj do planu/})).toHaveCount(1);
 await expect(variants).toContainText(eventContextCopy.pl.sale.offsale);
 await expect(variants.getByRole('link')).toHaveAttribute('rel','sponsored noopener noreferrer');
 const restore=await localOutbound(variants.getByRole('link'),'ticket');const popupPromise=context.waitForEvent('page');await variants.getByRole('link').click();
 const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
 await expect(popup).toHaveTitle('Local ticket fixture');await popup.close();await restore();
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('#trip-events').analyze()).violations).toEqual([]);
});
