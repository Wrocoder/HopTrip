import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {tripText} from '../src/lib/i18n/trip-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {savedTripCopy} from '../src/lib/i18n/saved-trip-copy';
import {encodeTrip,savedTripsKey} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';

test.setTimeout(90000);
const snapshot=(slug:string,start='2030-05-01')=>encodeTrip({version:1,offer:{slug,origin:'Warsaw',destination:'Barcelona',start,end:start,price:'100',observedAt:''},
 draft:{version:1,input:{...emptyBudget,flight:'100',hotel_basis:'stay',hotel_total:'900,01',taxes:'12,34',buffer:'100'},start:'2030-05-01',end:'2030-05-03',context:'',review:true,adultsOnly:true}})!;
const cards=(page:import('@playwright/test').Page)=>page.locator('main > ul > li');

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()}));
  Object.defineProperty(navigator,'clipboard',{get(){throw new Error('Synthetic clipboard restriction');}});
 });
});

for(const locale of ['pl','en','ru','uk'] as const)test(`saved snapshot feedback, undo and local restoration in ${locale}`,async({page},testInfo)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const copy=savedTripCopy[locale],prefix=locale==='pl'?'':`/${locale}`;
 await page.goto(`${prefix}/deals/browser-deal`);
 const actions=page.locator('#trip-save');
 await expect(page.locator('#budget-start')).toBeEnabled();
 const start=await page.locator('#budget-start').inputValue();
 const end=new Date(`${start}T12:00:00Z`);end.setUTCDate(end.getUTCDate()+2);
 await page.locator('#budget-end').fill(end.toISOString().slice(0,10));
 await page.locator('#budget-people').fill('2');await page.locator('#budget-flight').fill('100');
 await page.locator('#budget-hotel-basis').selectOption('stay');await page.locator('#budget-hotel_total').fill('900,01');
 await page.getByRole('group',{name:budgetText(locale,'Tryb kalkulatora')}).getByRole('button',{name:budgetText(locale,'Szczegółowy budżet'),exact:true}).click();
 await page.locator('#budget-taxes').fill('12,34');await page.locator('#budget-buffer').fill('100');
 const save=actions.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true});
 const share=actions.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true});
 await save.click();await expect(page.getByTestId('saved-plan-state')).toHaveText(copy.saved);
 await save.click();await expect(actions).toContainText(copy.already);
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).length,savedTripsKey)).toBe(1);
 await share.click();const first=await page.locator('#trip-share-link').inputValue();
 await expect(page.getByTestId('share-version')).toHaveText(copy.linkCurrent);
 await page.locator('#budget-food').fill('10');
 await expect(page.getByTestId('saved-plan-state')).toHaveText(copy.unsaved);
 await expect(page.getByTestId('share-version')).toHaveText(copy.linkOld);
 await expect(page.locator('#trip-share-link')).toHaveValue(first);
 await share.click();const second=await page.locator('#trip-share-link').inputValue();expect(second).not.toBe(first);
 await save.click();await expect(page.getByTestId('saved-plan-state')).toHaveText(copy.saved);
 await actions.getByRole('link',{name:tripText(locale,'Zapisane wyjazdy'),exact:true}).click();
 await expect(cards(page)).toHaveCount(2);await expect(page.locator('main')).toContainText(copy.localOnly);
 await expect(cards(page).first()).toContainText(/1\D?272[,.]35/);
 await cards(page).first().getByRole('button').click();
 await expect(cards(page)).toHaveCount(1);await expect(page.getByRole('status')).toHaveText(copy.removed);
 const undo=page.getByRole('button',{name:copy.undo,exact:true});await expect(undo).toBeFocused();
 await undo.click();await expect(cards(page)).toHaveCount(2);
 await expect(page.getByRole('status')).toHaveText(copy.restored);
 await page.reload();await expect(cards(page)).toHaveCount(2);
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);
 await page.getByRole('heading',{name:`${copy.listTitle} (2/20)`,exact:true}).focus();
 await expect(page.getByRole('heading',{name:`${copy.listTitle} (2/20)`,exact:true})).toBeFocused();
 await page.locator('main').screenshot({path:testInfo.outputPath(`saved-${locale}-320.png`),scale:'css',animations:'disabled'});
 await cards(page).first().getByRole('link').click();
 await expect(page.locator('#budget-food')).toHaveValue('10');
 await page.getByRole('group',{name:budgetText(locale,'Tryb kalkulatora')}).getByRole('button',{name:budgetText(locale,'Szczegółowy budżet'),exact:true}).click();
 await expect(page.locator('#budget-taxes')).toHaveValue('12,34');await expect(page.locator('#budget-buffer')).toHaveValue('100');
 await page.locator('#budget-food').fill('20');
 await page.goto(`${prefix}/saved`);await expect(cards(page).first()).toContainText(/1\D?272[,.]35/);
 await cards(page).first().getByRole('link').click();
 await expect(page.locator('#budget-food')).toHaveValue('20');
 await expect(page.getByTestId('saved-plan-state')).toHaveText(copy.unsaved);
 expect(errors).toEqual([]);
});

test('storage events keep two tabs in sync and undo preserves another tab’s new snapshot',async({page,context})=>{
 await page.goto('/deals/browser-deal');await page.locator('#trip-save').getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await expect(page.getByTestId('saved-plan-state')).toHaveText(savedTripCopy.pl.saved);
 await page.goto('/saved');await expect(cards(page)).toHaveCount(1);
 const other=await context.newPage();
 try{
  await other.goto('/saved');await expect(cards(other)).toHaveCount(1);
  await cards(other).first().getByRole('button').click();await expect(cards(page)).toHaveCount(0);
  await other.getByRole('button',{name:savedTripCopy.pl.undo,exact:true}).click();await expect(cards(page)).toHaveCount(1);
  await other.goto('/deals/browser-2');await other.locator('#trip-save').getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
  await expect(other.getByTestId('saved-plan-state')).toHaveText(savedTripCopy.pl.saved);await expect(cards(page)).toHaveCount(2);
  await cards(page).nth(1).getByRole('button').click();await expect(cards(page)).toHaveCount(1);
  await page.getByRole('button',{name:savedTripCopy.pl.undo,exact:true}).click();await expect(cards(page)).toHaveCount(2);
  await other.goto('/saved');await expect(cards(other)).toHaveCount(2);
 }finally{await other.close();}
});

test('corrupt storage is explained, preserved and never presented as an empty list',async({page})=>{
 await page.addInitScript(key=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,'{broken');},savedTripsKey);
 await page.goto('/saved');await expect(page.locator('main')).toContainText(savedTripCopy.pl.corrupt);
 await expect(page.locator('main')).not.toContainText('Nie masz jeszcze zapisanych');
 expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe('{broken');
 const token=snapshot('missing-offer');
 await page.evaluate(({key,token})=>{localStorage.setItem(key,JSON.stringify(['bad',token]));window.dispatchEvent(new Event('focus'));},{key:savedTripsKey,token});
 await expect(cards(page)).toHaveCount(1);await expect(cards(page).getByRole('button')).toBeDisabled();
 await page.goto('/deals/browser-deal');
 await expect(page.locator('#trip-save').getByRole('button',{name:'Zapisz wyjazd',exact:true})).toBeDisabled();
 await page.locator('#trip-save').getByRole('button',{name:'Udostępnij',exact:true}).click();
 await expect(page.locator('#trip-share-link')).toHaveValue(/\/trip\?plan=/);
 expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(JSON.stringify(['bad',token]));
});

test('capacity never evicts a plan and failed undo leaves the latest collection intact',async({page})=>{
 const tokens=Array.from({length:20},(_,i)=>snapshot(`missing-${i}`)),raw=JSON.stringify(tokens);
 await page.addInitScript(({key,raw})=>{if(localStorage.getItem(key)===null)localStorage.setItem(key,raw);},{key:savedTripsKey,raw});
 await page.goto('/deals/browser-deal');await page.locator('#trip-save').getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();
 await expect(page.locator('#trip-save')).toContainText('Masz już 20 zapisanych planów');
 expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(raw);
 await page.goto('/saved');await expect(cards(page)).toHaveCount(20);await cards(page).first().getByRole('button').click();
 await expect(cards(page)).toHaveCount(19);
 const updated=JSON.stringify([snapshot('replacement'),...tokens.slice(1)]);
 await page.evaluate(({key,raw})=>{localStorage.setItem(key,raw);window.dispatchEvent(new Event('focus'));},{key:savedTripsKey,raw:updated});
 await expect(cards(page)).toHaveCount(20);await page.getByRole('button',{name:savedTripCopy.pl.undo,exact:true}).click();
 await expect(page.getByRole('status')).toHaveText(savedTripCopy.pl.undoError);
 expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(updated);
});

test('failed removal keeps the list; a later successful removal clears its error and can be undone',async({page})=>{
 const raw=JSON.stringify([snapshot('missing-a'),snapshot('missing-b')]);
 await page.addInitScript(({key,raw})=>{
  const original=Storage.prototype.setItem;original.call(localStorage,key,raw);
  const flags=window as typeof window&{failSavedWrites:boolean};flags.failSavedWrites=true;
  Storage.prototype.setItem=function(name,value){if(name===key&&flags.failSavedWrites)throw new DOMException('Synthetic quota','QuotaExceededError');return original.call(this,name,value);};
 },{key:savedTripsKey,raw});
 await page.goto('/saved');await expect(cards(page)).toHaveCount(2);await cards(page).first().getByRole('button').click();
 await expect(page.getByRole('status')).toContainText('Nie udało się usunąć planu');await expect(cards(page)).toHaveCount(2);
 await page.evaluate(()=>{(window as typeof window&{failSavedWrites:boolean}).failSavedWrites=false;});
 await cards(page).first().getByRole('button').click();await expect(cards(page)).toHaveCount(1);
 await expect(page.getByRole('status')).toHaveText(savedTripCopy.pl.removed);
 await page.getByRole('button',{name:savedTripCopy.pl.undo,exact:true}).click();await expect(cards(page)).toHaveCount(2);
});

test('unavailable, missing and past flight snapshots keep all manual settings and honest saved previews',async({page})=>{
 const past=snapshot('missing-offer','2020-01-01');
 await page.addInitScript(({key,token})=>localStorage.setItem(key,JSON.stringify([token])),{key:savedTripsKey,token:past});
 await page.goto('/saved');await expect(cards(page)).toContainText(savedTripCopy.pl.past);await expect(cards(page)).toContainText(savedTripCopy.pl.verify);
 await cards(page).getByRole('link').click();await expect(page.getByRole('main').getByRole('status').first()).toContainText('już minął');
 for(const [slug,message] of [['missing-offer','nie jest już dostępna'],['unavailable-fixture','Nie udało się sprawdzić oferty']]){
  await page.goto(`/trip?plan=${snapshot(slug)}`);
  await expect(page.getByRole('main').getByRole('status').first()).toContainText(message);
  await expect(page.locator('#budget-hotel_total')).toHaveValue('900,01');
  await expect(page.locator('#budget-people')).toHaveValue('2');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page.locator('#accommodation')).toHaveCount(0);
 }
});
