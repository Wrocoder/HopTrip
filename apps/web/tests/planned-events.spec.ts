import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {encodeTrip} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';

const ticket=(id:string)=>`https://ticketmaster.evyy.net/c/7853869/123/456?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2F${id}`;
async function catalogue(page:Page){
 await page.route('**/api/v1/deals/*/events?**',route=>{
  const date=new URL(route.request().url()).searchParams.get('start_date');
  const base={category:'MUSIC',venue:'OVO Arena Wembley',city:'London',start_date:date,end_date:null,
   local_time:'18:00:00',timezone:'Europe/London',status:'onsale',price_from:'50',currency:'GBP'};
  return route.fulfill({json:{status:'READY',partial:false,checked_at:null,events:[
   {...base,id:'duke',name:'Duke Dumont',url:ticket('duke'),ticket_options:[
    {id:'duke',name:'Duke Dumont',ticket_kind:'STANDARD',url:ticket('duke'),price_from:'50',currency:'GBP'},
    {id:'premium',name:'Duke Dumont - Venue Premium Tickets',ticket_kind:'PREMIUM',url:ticket('premium'),price_from:'120',currency:'EUR'}]},
   {...base,id:'early',name:'Robert Glasper',local_time:'19:00:00',url:ticket('early')},
   {...base,id:'late',name:'Robert Glasper',local_time:'21:30:00',url:ticket('late')},
  ]}});
 });
}
const selected=(page:Page,name:string)=>page.locator('#planned-events > ul > li').filter({has:page.getByRole('heading',{name,exact:true,level:4})});
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));
});

test('selected ticket variants persist and share with independent costs, without double counting',async({page,browser},testInfo)=>{
 await catalogue(page);await page.goto('/deals/browser-13');
 await page.locator('#budget-flight').fill('100');await page.locator('#budget-people').fill('3');
 const events=page.locator('#trip-events');
 await events.getByRole('button',{name:'Dodaj do planu: Duke Dumont',exact:true}).click();
 const duke=selected(page,'Duke Dumont');
 await expect(duke.getByLabel('Cena jednego biletu (PLN)')).toHaveValue('');
 await expect(duke).toContainText('Cena nieznana');
 await duke.getByLabel('Liczba biletów').fill('2');await duke.getByLabel('Cena jednego biletu (PLN)').fill('120,29');
 await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
 await events.getByRole('button',{name:'Dodaj do planu: Duke Dumont - Venue Premium Tickets',exact:true}).click();
 const premium=selected(page,'Duke Dumont - Venue Premium Tickets');
 await expect(premium.getByLabel('Cena jednego biletu (PLN)')).toHaveValue('');
 await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
 await expect(events.getByRole('button',{name:'W planie: Duke Dumont',exact:true})).toBeDisabled();
 await page.reload();await expect(duke.getByLabel('Cena jednego biletu (PLN)')).toHaveValue('120,29');
 await expect(duke.getByLabel('Liczba biletów')).toHaveValue('2');
 await expect(page.locator('#planned-events > ul > li')).toHaveCount(2);
 await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
 await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await page.getByRole('button',{name:'Udostępnij',exact:true}).click();
 const url=await page.locator('#trip-share-link').inputValue();
 const context=await browser.newContext({viewport:{width:390,height:844}});
 try{
  const copy=await context.newPage();await copy.goto(url);
  const copyDuke=selected(copy,'Duke Dumont');
  await expect(copy.locator('#planned-events > ul > li')).toHaveCount(2);
  await expect(copyDuke).toContainText('OVO Arena Wembley');await expect(copyDuke).toContainText('18:00');
  await expect(copyDuke.getByRole('link')).toHaveAttribute('href',ticket('duke'));
  await expect(copyDuke.getByLabel('Liczba biletów')).toHaveValue('2');
  await expect(copy.getByTestId('budget-total')).toHaveText(/540,58/);
  await copyDuke.getByLabel('Liczba biletów').fill('3');await copy.reload();
  await expect(copy.getByTestId('budget-total')).toHaveText(/660,87/);
  await expect(copyDuke.getByLabel('Liczba biletów')).toHaveValue('3');
  await page.reload();await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
  await selected(copy,'Duke Dumont - Venue Premium Tickets').getByRole('button',{name:/Usuń z planu/}).click();
  await expect(copy.locator('#planned-events > ul > li')).toHaveCount(1);
  await expect(copy.getByTestId('budget-total')).toHaveText(/660,87/);
  expect((await new AxeBuilder({page:copy}).include('#calculator').analyze()).violations).toEqual([]);
  await copy.setViewportSize({width:320,height:844});
  expect(await copy.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await copy.locator('#planned-events').screenshot({path:testInfo.outputPath('planned-events.png')});
 }finally{await context.close();}
 await page.goto('/saved');await page.locator('main a[href^="/trip?plan="]').first().click();
 await expect(page.locator('#planned-events > ul > li')).toHaveCount(2);
 await expect(page.getByTestId('budget-total')).toHaveText(/540,58/);
});

test('different sessions, unknown and zero prices, invalid input and removal keep an honest budget',async({page})=>{
 await catalogue(page);await page.goto('/deals/browser-13');
 const events=page.locator('#trip-events');
 await page.locator('#budget-flight').fill('0');
 const add=events.getByRole('button',{name:'Dodaj do planu: Robert Glasper',exact:true});
 await add.nth(0).click();await events.getByRole('button',{name:'Dodaj do planu: Robert Glasper',exact:true}).click();
 const sessions=selected(page,'Robert Glasper');await expect(sessions).toHaveCount(2);
 await expect(sessions.nth(0)).toContainText('19:00');await expect(sessions.nth(1)).toContainText('21:30');
 await sessions.nth(0).getByLabel('Cena jednego biletu (PLN)').fill('0');
 await sessions.nth(1).getByLabel('Cena jednego biletu (PLN)').fill('20,01');
 await sessions.nth(1).getByLabel('Liczba biletów').fill('2');
 await expect(page.getByTestId('budget-total')).toHaveText(/40,02/);
 await sessions.nth(1).getByLabel('Liczba biletów').fill('0');
 await expect(page.getByTestId('budget-total')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Udostępnij',exact:true})).toBeDisabled();
 await sessions.nth(1).getByLabel('Liczba biletów').fill('2');
 await sessions.nth(1).getByLabel('Cena jednego biletu (PLN)').fill('-5');
 await expect(page.getByTestId('budget-total')).toHaveCount(0);
 await sessions.nth(1).getByLabel('Cena jednego biletu (PLN)').fill('');
 await expect(sessions.nth(1)).toContainText('Cena nieznana');
 await expect(page.getByTestId('budget-total')).toHaveText(/0,00/);
 await sessions.nth(0).getByRole('button',{name:/Usuń z planu/}).click();
 await expect(sessions).toHaveCount(1);await expect(sessions).toContainText('21:30');
 await sessions.getByRole('button',{name:/Usuń z planu/}).click();
 await expect(page.locator('#planned-events')).toHaveCount(0);
});

test('a saved event remains editable when its flight and catalogue no longer exist',async({page})=>{
 const event={id:'old-event',name:'Zapisany koncert',venue:'Sala koncertowa',date:'2090-01-16',time:null,timezone:'Europe/London',url:ticket('old-event'),quantity:'2',unitPricePln:'30'};
 const token=encodeTrip({version:1,offer:{slug:'missing-offer',origin:'Wrocław',destination:'Londyn',start:'2090-01-15',end:'2090-01-17',price:'100',observedAt:''},
  draft:{version:1,input:{...emptyBudget,people:'1',flight:'100'},start:'2090-01-15',end:'2090-01-17',context:'',review:true,events:[event]}});
 await page.goto('/trip?plan='+token);
 await expect(page.locator('#trip-events')).toHaveCount(0);
 const concert=selected(page,'Zapisany koncert');await expect(concert).toContainText('Godzina nieznana');
 await expect(page.getByTestId('budget-total')).toHaveText(/160,00/);
 await page.locator('#budget-end').fill('2090-01-15');
 await expect(concert).toContainText('Poza datami pobytu');
 await expect(page.getByTestId('budget-total')).toHaveText(/160,00/);
 await page.reload();await expect(concert.getByLabel('Cena jednego biletu (PLN)')).toHaveValue('30');
});
