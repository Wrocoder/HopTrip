import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('one session presents independent ticket options while Glasper sessions stay separate',async({page},testInfo)=>{
 const ticket=(id:string)=>`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2F${id}`;
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const day=new URL(route.request().url()).searchParams.get('start_date');
  const base={category:'MUSIC',venue:'OVO Arena Wembley',city:'London',start_date:day,end_date:null,
   local_time:'18:00:00',timezone:'Europe/London',status:'onsale',price_from:null,currency:null};
  return route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[
   {...base,id:'duke',name:'Duke Dumont',url:ticket('duke'),ticket_options:[
    {id:'duke',name:'Duke Dumont',ticket_kind:'STANDARD',price_from:null,currency:null,url:ticket('duke')},
    {id:'premium',name:'Duke Dumont - Venue Premium Tickets',ticket_kind:'PREMIUM',price_from:'120',currency:'EUR',url:ticket('premium')}]},
   {...base,id:'early',name:'Robert Glasper',venue:'Blue Note London',local_time:'19:00:00',url:ticket('early')},
   {...base,id:'late',name:'Robert Glasper',venue:'Blue Note London',local_time:'21:30:00',url:ticket('late')},
  ]}});
 });
 await page.goto('/deals/browser-13');
 const events=page.locator('#trip-events');
 await expect(events.getByRole('heading',{name:'Duke Dumont',exact:true})).toHaveCount(1);
 await expect(events.getByRole('heading',{name:'Robert Glasper',exact:true})).toHaveCount(2);
 const duke=events.getByRole('listitem').filter({has:page.getByRole('heading',{name:'Duke Dumont',exact:true})});
 await expect(duke).toContainText('Oferta podstawowa');await expect(duke).toContainText('Premium');
 await expect(duke).toContainText('Cena do sprawdzenia u sprzedawcy');
 await expect(duke).toContainText('120,00');
 const links=duke.getByRole('link');await expect(links).toHaveCount(2);
 await expect(links.nth(0)).toHaveAttribute('href',ticket('duke'));
 await expect(links.nth(1)).toHaveAttribute('href',ticket('premium'));
 for(const link of await links.all()){
  await expect(link).toHaveAttribute('rel',/sponsored/);
  await expect(link).toHaveAttribute('aria-describedby','event-fit-duke');
 }
 const sessions=events.getByRole('listitem').filter({has:page.getByRole('heading',{name:'Robert Glasper',exact:true})});
 await expect(sessions.nth(0)).toContainText('19:00');await expect(sessions.nth(1)).toContainText('21:30');
 expect((await new AxeBuilder({page}).include('#trip-events').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await duke.screenshot({path:testInfo.outputPath('ticket-options.png')});
});

test('empty results explain coverage and recover category or dates without changing the stay',async({page},testInfo)=>{
 const queries:URLSearchParams[]=[];
 await page.route('**/api/v1/deals/*/events?**',route=>{
  queries.push(new URL(route.request().url()).searchParams);
  return route.fulfill({json:{status:'EMPTY',events:[],partial:true,checked_at:null}});
 });
 await page.goto('/deals/browser-13');
 const events=page.locator('#trip-events');
 await expect(events.getByRole('button',{name:'Zmień okres wyszukiwania'})).toBeVisible();
 await expect(events).toContainText('Pusta lista nie oznacza');
 await expect(events).toContainText('Dane dla tego okresu mogą być niepełne');
 await expect(events.locator('a[href^="https://ticketmaster.evyy.net/"]')).toHaveCount(0);
 const stayEnd=await page.getByLabel('Wymeldowanie',{exact:true}).inputValue();
 await events.getByLabel('Kategoria').selectOption('SPORTS');
 const clear=events.getByRole('button',{name:'Pokaż wszystkie kategorie'});
 await clear.click();
 await expect(events.getByLabel('Kategoria')).toHaveValue('ALL');
 await expect(clear).toHaveCount(0);
 await expect(page.getByLabel('Wymeldowanie',{exact:true})).toHaveValue(stayEnd);
 await events.getByRole('button',{name:'Zmień okres wyszukiwania'}).click();
 await expect(events.getByLabel('Od',{exact:true})).toBeFocused();
 await expect(events.getByRole('button',{name:'Użyj dat podróży',exact:true})).toBeVisible();
 await events.getByLabel('Kategoria').selectOption('CULTURE');
 await events.getByRole('button',{name:'Pokaż wydarzenia'}).click();
 await clear.click();
 await expect.poll(()=>queries.at(-1)?.get('category')).toBe('ALL');
 expect(queries.at(-1)?.get('date_mode')).toBe('other');
 expect(queries.at(-1)?.get('end_date')).toBe(stayEnd);
 await expect(page.getByLabel('Wymeldowanie',{exact:true})).toHaveValue(stayEnd);
 await expect(events.getByRole('button',{name:'Zmień okres wyszukiwania'})).toBeVisible();
 expect((await new AxeBuilder({page}).include('#trip-events').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await events.screenshot({path:testInfo.outputPath('empty-events.png')});
 await events.getByRole('link',{name:'Zobacz atrakcje w mieście'}).click();
 await expect(page).toHaveURL(/\/deals\/browser-13#destination-activities$/);
 await expect(page.locator('#destination-activities')).toBeVisible();
});
