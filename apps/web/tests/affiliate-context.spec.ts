import {test,expect,type Page,type BrowserContext,type Locator} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {localizedHref} from '../src/lib/i18n/routing';
import {activityUi} from '../src/lib/i18n/activity-ui';
import {activitiesForDestination} from '../src/lib/destination-activities';

type Event={event_name:string;deal_slug?:string;activity?:{city:string;activity_id:string;page:string;link_kind:string};partner?:{category:string;provider:string};metadata:Record<string,string>};
test.use({serviceWorkers:'block'});
async function setup(page:Page,context:BrowserContext,allowed=true){
 await page.addInitScript(allowed=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:allowed,marketing:false,at:Date.now()}));},allowed);
 await context.route(/.*/,route=>{
  const url=new URL(route.request().url());
  if(url.pathname==='/__test__/grow03-external')return route.fulfill({body:'<h1>Synthetic external destination</h1>',contentType:'text/html'});
  if(['127.0.0.1','localhost','[::1]'].includes(url.hostname))return route.continue();
  return route.fulfill({body:'<h1>Synthetic external destination</h1>',contentType:'text/html',headers:{'x-hoptrip-fixture':'external-intercepted'}});
 });
 const rows:{event:Event;status:number}[]=[];
 page.on('response',response=>{if(response.url().endsWith('/analytics/events')&&response.request().method()==='POST'){
  const event=response.request().postDataJSON();if(['PARTNER_CLICK','ACTIVITY_CLICK','EVENT_CLICK'].includes(event.event_name))rows.push({event,status:response.status()});
 }});
 return rows;
}
async function open(context:BrowserContext,link:Locator,middle=false){
 const expected=await link.getAttribute('href');
 // Some native popup requests bypass browser routing. Verify the real href,
 // then exercise handlers/native navigation with a loopback-only destination.
 await link.evaluate((node,api)=>{(node as HTMLAnchorElement).href=new URL('/__test__/grow03-external',api).href;},process.env.HOPTRIP_API_URL??'http://127.0.0.1:8100');
 const local=await link.getAttribute('href');
 const opened=context.waitForEvent('page');await link.click({button:middle?'middle':'left'});const popup=await opened;
 await expect(popup.getByRole('heading')).toHaveText('Synthetic external destination');
 expect(popup.url()).toBe(local);await popup.close();
 await link.evaluate((node,href)=>{(node as HTMLAnchorElement).href=href!;},expected);
 await expect(link).toHaveAttribute('href',expected!);
}

for(const locale of ['pl','en','ru','uk'] as const)test(`affiliate context preserves destination and accepted tracking in ${locale}`,async({page,context},info)=>{
 test.setTimeout(90000);const rows=await setup(page,context);
 const selection=activitiesForDestination('barcelona')!,affiliate=selection.items.find(item=>item.affiliateHref)!;
 for(const [index,path]of ['/deals/browser-deal','/info/barcelona-3-days'].entries()){
  const start=rows.length;await page.goto(localizedHref(path,locale)+'?email=private@example.test#private-token');
  const section=page.locator('#destination-activities'),link=section.locator('a[rel*="sponsored"]').first();
  await expect(section).toContainText(activityUi(locale,'intro'));await expect(section).toContainText(activityUi(locale,'affiliate'));
  await expect(link).toHaveAttribute('href',affiliate.affiliateHref!);await expect(link).toHaveAttribute('target','_blank');
  await expect(link).toHaveAttribute('rel','sponsored noopener noreferrer');
  await open(context,link,index===1);
  await expect.poll(()=>rows.length).toBe(start+2);
  const current=rows.slice(start);
  expect(current.map(row=>row.status)).toEqual([202,202]);
  const click=current.find(row=>row.event.event_name==='PARTNER_CLICK')!.event;
  expect(click.partner).toEqual({category:'activity',provider:'tiqets'});
  expect(click.deal_slug).toBe(index===0?'browser-deal':undefined);
  expect(current.find(row=>row.event.event_name==='ACTIVITY_CLICK')!.event.activity).toEqual({city:'barcelona',activity_id:affiliate.id,page:path,link_kind:'affiliate'});
  expect((await new AxeBuilder({page}).include('#destination-activities').analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 const before=rows.length,official=selection.items.find(item=>!item.affiliateHref)!;
 const officialLink=page.locator('#destination-activities a').filter({hasText:activityUi(locale,'visit')}).last();
 await expect(officialLink).toHaveAttribute('href',official.href);await expect(officialLink).toHaveAttribute('rel','noopener noreferrer');
 await open(context,officialLink,true);await expect.poll(()=>rows.length).toBe(before+1);
 expect(rows.at(-1)?.status).toBe(202);expect(rows.at(-1)?.event.activity?.link_kind).toBe('official');
 expect(rows.filter(row=>row.event.event_name==='PARTNER_CLICK')).toHaveLength(2);
 expect(JSON.stringify(rows)).not.toMatch(/private|email|token|https:/);
 await info.attach('affiliate-context',{body:JSON.stringify({locale,events:rows.map(row=>({name:row.event.event_name,status:row.status,deal:row.event.deal_slug,page:row.event.activity?.page,kind:row.event.activity?.link_kind}))},null,2),contentType:'application/json'});
});

for(const variant of [false,true])test(`middle click on ${variant?'variant':'single'} event ticket is consent-gated and opens unchanged URL`,async({page,context})=>{
 const rows=await setup(page,context),url='https://ticketmaster.evyy.net/synthetic?fixture=private-ticket';
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const item={id:'synthetic-event',name:'Synthetic ticket',category:'MUSIC',venue:'Fixture venue',city:'Barcelona',start_date:new URL(route.request().url()).searchParams.get('start_date'),end_date:null,local_time:null,timezone:'Europe/Madrid',status:'onsale',url,price_from:null,currency:null};
  return route.fulfill({json:{status:'READY',events:[{...item,...(variant?{ticket_options:[{id:'synthetic-option',name:'Synthetic standard',ticket_kind:'STANDARD',url,price_from:null,currency:null}]}:{})}],partial:false,checked_at:null}});
 });
 await page.goto('/deals/browser-13');const link=page.locator('#trip-events a[target="_blank"]');
 await expect(link).toHaveAttribute('href',url);await expect(link).toHaveAttribute('rel','sponsored noopener noreferrer');
 await link.dispatchEvent('auxclick',{button:2});expect(rows).toEqual([]);
 await open(context,link,true);await expect.poll(()=>rows.length).toBe(1);
 expect(rows[0].status).toBe(202);expect(rows[0].event.event_name).toBe('EVENT_CLICK');expect(rows[0].event.deal_slug).toBe('browser-13');
 expect(JSON.stringify(rows)).not.toMatch(/private|ticketmaster|synthetic-option|synthetic-event/);
 await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 await open(context,link,true);expect(rows).toHaveLength(1);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
});

test('declining analytics keeps localized affiliate and official navigation without events',async({page,context})=>{
 const rows=await setup(page,context,false);await page.goto('/ru/deals/browser-deal');
 await open(context,page.locator('#destination-activities a[rel*="sponsored"]').first());
 await open(context,page.locator('#destination-activities a[rel="noopener noreferrer"]').last(),true);
 expect(rows).toEqual([]);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
});

test('analytics network failure preserves localized affiliate navigation',async({page,context})=>{
 await setup(page,context);await page.route('**/analytics/events',route=>route.abort('failed'));
 await page.goto('/uk/deals/browser-deal');await open(context,page.locator('#destination-activities a[rel*="sponsored"]').first());
 await expect(page.locator('#destination-activities')).toBeVisible();
});
