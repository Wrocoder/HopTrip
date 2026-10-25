// Public reads and isolated browser storage only. No partner clicks or server writes.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(new URL('../apps/web/package.json',import.meta.url));
const {chromium,expect}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const base='https://hoptrip.pl';
const deals=await(await fetch(base+'/api/v1/deals?destination=london&limit=3')).json();
const deal=deals.find(item=>item.events_supported&&item.trip_type==='ROUND_TRIP');
if(!deal)throw Error('No active London trip');
const response=await fetch(base+`/api/v1/deals/${deal.slug}/events?`+new URLSearchParams({date_mode:'stay',start_date:deal.trip_start,end_date:deal.trip_end,category:'ALL'}));
if(!response.ok)throw Error('Event catalogue unavailable');
const result=await response.json(),event=result.events?.[0];
if(!event)throw Error('No event available for live check');
const ticket=event.ticket_options?.[0]??event;
const report={checked_at:new Date().toISOString(),slug:deal.slug,event_id:ticket.id,event_name:ticket.name,
 test_costs:{flight_per_person_pln:'100',people:3,tickets:2,ticket_unit_pln:'120.29',expected_total_pln:'540.58'},checks:[]};
await mkdir(new URL('../docs/releases/',import.meta.url),{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 for(const mobile of [false,true]){
  const options={viewport:mobile?{width:390,height:844}:{width:1366,height:900},isMobile:mobile,hasTouch:mobile};
  const context=await browser.newContext(options);
  await context.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/deals/'+deal.slug,{waitUntil:'domcontentloaded'});
  await page.locator('#trip-events').getByRole('button',{name:`Dodaj do planu: ${ticket.name}`,exact:true}).click();
  const plan=page.locator('#planned-events');
  await expect(plan.getByLabel('Cena jednego biletu (PLN)')).toHaveValue('');
  await expect(plan).toContainText('Cena nieznana');
  await page.locator('#budget-flight').fill('100');await page.locator('#budget-people').fill('3');
  await plan.getByLabel('Liczba biletów').fill('2');await plan.getByLabel('Cena jednego biletu (PLN)').fill('120,29');
  await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
  await page.reload();await expect(plan.getByLabel('Liczba biletów')).toHaveValue('2');
  await expect(plan.getByLabel('Cena jednego biletu (PLN)')).toHaveValue('120,29');
  await expect(page.locator('#planned-events > ul > li')).toHaveCount(1);
  await expect(page.locator('#trip-events').getByRole('button',{name:`W planie: ${ticket.name}`,exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  await page.getByRole('button',{name:'Udostępnij',exact:true}).click();
  const url=await page.locator('#trip-share-link').inputValue();
  if(new URL(url).searchParams.get('plan').length>6000)throw Error('Share bound exceeded');
  const recipient=await browser.newContext(options);
  try{
   await recipient.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
   const copy=await recipient.newPage();copy.on('pageerror',error=>errors.push(error.message));
   await copy.goto(url,{waitUntil:'domcontentloaded'});
   const copied=copy.locator('#planned-events');
   await expect(copied).toContainText(ticket.name);await expect(copied).toContainText(event.venue);
   await expect(copied.getByRole('link')).toHaveAttribute('href',ticket.url);
   await expect(copy.getByTestId('budget-total')).toHaveText(/540,58/);
   await copied.getByLabel('Liczba biletów').fill('3');await copy.reload();
   await expect(copy.getByTestId('budget-total')).toHaveText(/660,87/);
   await expect(copied.getByLabel('Liczba biletów')).toHaveValue('3');
   if(mobile)await copy.setViewportSize({width:320,height:844});
   const violations=(await new AxeBuilder({page:copy}).include('#calculator').analyze()).violations;
   if(violations.length)throw Error('Accessibility: '+violations.map(item=>item.id).join(','));
   if(await copy.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
   await copy.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
   await copied.screenshot({path:new URL('../docs/releases/planned-events-'+(mobile?'mobile':'desktop')+'-20261025.png',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1')});
  }finally{await recipient.close();}
  await page.goto(base+'/saved',{waitUntil:'domcontentloaded'});
  await page.locator('main a[href^="/trip?plan="]').first().click();
  await expect(page.locator('#planned-events > ul > li')).toHaveCount(1);
  await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
  await page.goto(base+'/deals/'+deal.slug,{waitUntil:'domcontentloaded'});
  await expect(page.locator('#planned-events').getByLabel('Liczba biletów')).toHaveValue('2');
  await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
  if(errors.length)throw Error('Page errors: '+errors.join(';'));
  report.checks.push({viewport:mobile?'mobile-320':'desktop',real_event_added:true,unknown_price_preserved:true,
   draft_restored:true,saved_plan_reopened:true,shared_copy:true,recipient_edit_independent:true,tickets_counted_once:true,
   axe_violations:0,horizontal_overflow:false,page_errors:0});
  await context.close();
 }
}finally{await browser.close();}
await writeFile(new URL('../docs/releases/planned-events-20261025.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
