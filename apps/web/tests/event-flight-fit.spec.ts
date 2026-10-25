import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {EventFlightFit} from '../src/lib/event-flight-fit';

const baseFit:EventFlightFit={status:'TIGHT',reasons:['ARRIVAL_BUFFER','UNKNOWN_DURATION'],
 buffer_minutes:180,arrival_gap_minutes:70,return_gap_minutes:null,return_start_gap_minutes:3000,
 duration_minutes:null,arrival_airport:'STN',return_airport:'LTN',arrival_estimated:true};

test('flight conflicts, tight transfers and unknown durations are visible on event cards',async({page},testInfo)=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const day=new URL(route.request().url()).searchParams.get('start_date')!;
  const cases=[
   {id:'stn',name:'Koncert 21:30 po przylocie STN 20:20',local_time:'21:30:00',fit:baseFit},
   {id:'outside',name:'Koncert po locie powrotnym',local_time:'21:30:00',fit:{...baseFit,status:'CONFLICT',reasons:['AFTER_RETURN','UNKNOWN_DURATION'],arrival_gap_minutes:4000}},
   {id:'unknown',name:'Nieznana godzina rozpoczęcia',local_time:null,fit:{...baseFit,status:'CHECK',reasons:['UNKNOWN_EVENT_TIME','UNKNOWN_DURATION'],arrival_gap_minutes:null}},
   {id:'known',name:'Wydarzenie z podaną długością',local_time:'15:00:00',fit:{...baseFit,status:'NO_KNOWN_CONFLICT',reasons:[],duration_minutes:120,arrival_gap_minutes:500}},
   {id:'old-server',name:'Brak oceny zgodności',local_time:'20:00:00',fit:undefined},
  ];
  return route.fulfill({json:{status:'READY',partial:false,checked_at:null,
   events:cases.map(item=>({id:item.id,name:item.name,category:'MUSIC',venue:'Sala',city:'Londyn',start_date:day,end_date:null,local_time:item.local_time,timezone:'Europe/London',status:'onsale',price_from:null,currency:null,url:`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2F${item.id}`})),
   flight_fit:Object.fromEntries(cases.filter(item=>item.fit).map(item=>[item.id,item.fit])),
  }});
 });
 await page.goto('/deals/browser-13');
 const section=page.getByRole('region',{name:'Wydarzenia w terminie podróży'});
 const card=(name:string)=>section.getByRole('listitem').filter({has:page.getByRole('heading',{name,exact:true})});
 const tight=card('Koncert 21:30 po przylocie STN 20:20');
 await expect(tight.getByRole('note')).toHaveAttribute('data-status','TIGHT');
 await expect(tight).toContainText('Za mało zapasu — sprawdź dojazd');
 await expect(tight).toContainText('Od przylotu do początku (STN): 70 min');
 await expect(tight).toContainText('Czas trwania nieznany');
 await expect(tight.getByRole('link')).toHaveAttribute('aria-describedby','event-fit-stn');
 const conflict=card('Koncert po locie powrotnym');
 await expect(conflict).toContainText('Kolizja z rozkładem lotu');
 await expect(conflict.getByRole('note')).toHaveAttribute('data-status','CONFLICT');
 await expect(card('Nieznana godzina rozpoczęcia')).toContainText('Godzina do potwierdzenia');
 await expect(card('Nieznana godzina rozpoczęcia')).toContainText('Czas trwania nieznany');
 await expect(card('Wydarzenie z podaną długością')).toContainText('Czas trwania: 120 min');
 await expect(card('Brak oceny zgodności')).toContainText('Zgodność z lotem nie została sprawdzona');
 // Warnings are ordinary card content, not hidden inside the booking disclosure.
 await expect(section.locator('details')).not.toHaveAttribute('open','');
 await expect(tight.getByRole('note')).toBeVisible();
 expect((await new AxeBuilder({page}).include('[aria-labelledby="trip-events-title"]').analyze()).violations).toEqual([]);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await tight.screenshot({path:testInfo.outputPath('tight-flight-event.png')});
});
