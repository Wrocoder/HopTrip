import {test,expect} from '@playwright/test';
import {writeFileSync} from 'node:fs';
import {localOutbound} from './local-outbound';
type WireEvent={event_id:string;event_name:string;anonymous_session_id:string;metadata?:{page_type?:string};search?:{filters?:Record<string,string>;result_count?:number};partner?:{category:string}};

test('synthetic consented journey reconciles received events, ordered usage and operational redirects',async({page,context,request},info)=>{
 test.setTimeout(120000);
 expect(new URL(String(info.project.use.baseURL)).hostname).toBe('127.0.0.1');
 const start=new Date().toISOString();
 const events:WireEvent[]=[];
 const accepted:string[]=[];
 await context.route(/^https:\/\//,route=>route.abort());
 page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.method()==='POST')events.push(r.postDataJSON());});
 page.on('response',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.status()===202)accepted.push(r.request().postDataJSON().event_id);});
 await page.goto('/deals');
 await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 await page.locator('input[name="budget"]').fill('300');await page.locator('.filters button[type="submit"]').click();
 expect(events).toHaveLength(0);
 await page.goto('/deals?utm_source=test&utm_campaign=test&private=synthetic-private-value');
 await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
 await page.getByRole('checkbox',{name:/Analityka HopTrip/}).check();
 await page.getByRole('button',{name:'Zapisz wybór',exact:true}).click();
 await expect.poll(()=>events.some(e=>e.event_name==='PAGE_VIEW')).toBe(true);
 await page.locator('input[name="budget"]').fill('300');await page.locator('.filters button[type="submit"]').click();
 await expect.poll(()=>events.some(e=>e.event_name==='SEARCH')).toBe(true);
 await expect(page).toHaveURL(/budget=300/);
 await expect.poll(()=>events.some(e=>e.event_name==='SEARCH_RESULT'&&e.search?.filters?.budget==='300'&&(e.search.result_count??0)>0)).toBe(true);
 await page.goto('/deals/browser-deal');
 await expect.poll(()=>events.some(e=>e.event_name==='DEAL_VIEW')).toBe(true);
 await page.locator('.decision-information .trip-details > summary').click();
 await expect.poll(()=>events.some(e=>e.event_name==='DEAL_DETAILS_OPEN')).toBe(true);
 await page.locator('#stay-checkin').fill('2030-05-03');await page.locator('#stay-checkout').fill('2030-05-05');
 for(const link of [page.getByRole('link',{name:'Znajdź nocleg przez Stay22 (nowa karta)',exact:true}),page.getByRole('link',{name:/Sprawdź daty i cenę w Tiqets: Casa/})]){
  const restore=await localOutbound(link),opened=page.waitForEvent('popup');await link.click();const popup=await opened;await popup.waitForLoadState();await popup.close();await restore();
 }
 await page.locator('.booking-card a.cta').click();
 await expect(page.locator('h1')).toHaveText('Synthetic external destination');
 await page.goto('/deals/browser-deal');
 await page.getByRole('button',{name:'Szczegółowy budżet',exact:true}).click();
 for(const field of ['flight','baggage','hotel','transfers','local_transport','food','activities','other','taxes','buffer'])await page.locator('#budget-'+field).fill('0');
 await page.getByText('Rozbicie kosztów całej grupy',{exact:true}).click();
 expect(events.filter(e=>e.event_name==='BUDGET_CALCULATED')).toHaveLength(0);
 await page.getByRole('button',{name:'Kwoty sprawdzone dla tego planu',exact:true}).click();
 await page.getByText('Rozbicie kosztów całej grupy',{exact:true}).click();
 await page.getByText('Rozbicie kosztów całej grupy',{exact:true}).click();
 await expect.poll(()=>events.some(e=>e.event_name==='BUDGET_CALCULATED')).toBe(true);
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await expect(page).toHaveURL(/\/trip#local=/);
 await expect.poll(()=>events.some(e=>e.event_name==='TRIP_SAVE')).toBe(true);
 await expect.poll(()=>events.some(e=>e.event_name==='PAGE_VIEW'&&e.metadata?.page_type==='saved_trip')).toBe(true);
 // End the browser journey before taking a database snapshot. Next can keep
 // background connections active; networkidle is not an event-receipt boundary.
 await page.goto('http://127.0.0.1:8100/__test__/grow03-external');
 await expect.poll(()=>events.every(e=>accepted.includes(e.event_id))).toBe(true);
 expect(JSON.stringify(events)).not.toMatch(/synthetic-private-value|hotel_total|@|#plan=|#local=/);
 expect(events.filter(e=>e.event_name==='PARTNER_CLICK').map(e=>e.partner?.category).sort()).toEqual(['activity','flight','stay']);
 const endpoint='http://127.0.0.1:8100/api/v1/admin/analytics/';
 const headers={'X-Admin-Token':'change-me-in-development'}; // Guarded loopback fixture only.
 const params={start,end:new Date(Date.now()+1000).toISOString()};
 const usage=await(await request.get(endpoint+'usage',{headers,params})).json();
 const summary=await(await request.get(endpoint+'summary',{headers,params})).json();
 expect(usage.observed_sessions).toBe(1);
 expect(usage.observed_events).toBe(new Set(accepted).size);
 expect(usage.ordered_funnel.steps.map((s:{sessions:number})=>s.sessions)).toEqual([1,1,1,1,1]);
 expect(usage.metrics.find((m:{key:string})=>m.key==='affiliate_ctr')).toMatchObject({numerator:1,denominator:1,percent:'100.00'});
 expect(summary.by_event.PARTNER_CLICK).toBe(3);
 expect(summary.by_event.AFFILIATE_CLICK).toBe(1);
 expect(usage.excluded_events).toBe(1);
 expect(summary.total_events).toBe(usage.observed_events+1);
 const duplicate=await request.post('http://127.0.0.1:8100/api/v1/analytics/events',{data:events[0]});expect(duplicate.status()).toBe(202);
 const after=await(await request.get(endpoint+'usage',{headers,params})).json();expect(after.observed_events).toBe(usage.observed_events);
 const html=await(await request.get(endpoint+'dashboard',{headers,params})).text();
 expect(html).toContain('ordered-session-funnel-v1');
 writeFileSync(info.outputPath('reconciliation.json'),JSON.stringify({synthetic:true,real_user_metrics:false,source_test_counted_by_current_policy:true,received_event_names:events.map(e=>e.event_name),usage,summary,duplicate_preserved_count:true},null,2));
});
