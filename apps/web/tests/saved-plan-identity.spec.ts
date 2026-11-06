import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {encodeTrip,savedTripsKey} from '../src/lib/shared-trip';
import {savedPlansKey,savedPlansLock} from '../src/lib/saved-plans';
import {emptyBudget} from '../src/lib/trip-budget';
import {planStorageCopy} from '../src/lib/i18n/plan-storage-copy';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';
import {savedTripCopy} from '../src/lib/i18n/saved-trip-copy';
import {tripText} from '../src/lib/i18n/trip-copy';
const snapshot=(slug:string)=>encodeTrip({version:1,offer:{slug,origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''},draft:{version:1,input:{...emptyBudget,flight:'100',food:'0'},start:'2030-05-01',end:'2030-05-03',context:'',review:true,adultsOnly:false}})!;
const cards=(page:import('@playwright/test').Page)=>page.locator('main > ul > li');
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));});
async function seed(page:import('@playwright/test').Page,raw:string){await page.goto('/saved');await page.evaluate(({key,raw})=>{localStorage.setItem(key,raw);window.dispatchEvent(new Event('focus'));},{key:savedTripsKey,raw});}
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: explicit legacy migration preserves tokens, backup and permanent IDs through reload and opening`,async({page},info)=>{
 const copy=planStorageCopy[locale],prefix=locale==='pl'?'':'/'+locale,raw=JSON.stringify([snapshot('missing-a'),snapshot('missing-b')]);
 await seed(page,raw);await page.goto(prefix+'/saved');await expect(cards(page)).toHaveCount(2);await expect(cards(page).first().getByRole('button')).toBeDisabled();
 await cards(page).first().getByRole('link').click();await expect(page.locator('#budget-food')).toHaveValue('0');await expect(page.locator('#trip-save')).toContainText(copy.migration);await expect(page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true})).toBeDisabled();
 await page.goto(prefix+'/saved');await page.getByRole('button',{name:copy.migrate,exact:true}).click();await expect(page.getByRole('status')).toHaveText(copy.migrated);
 const store=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),savedPlansKey);expect(store.version).toBe(2);expect(store.plans.map((plan:{token:string})=>plan.token)).toEqual(JSON.parse(raw));expect(store.legacyBackup).toBe(raw);expect(store.legacySource).toBe(raw);
 expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(raw);const ids=await cards(page).evaluateAll(elements=>elements.map(element=>element.getAttribute('data-plan-id')));expect(new Set(ids).size).toBe(2);expect(ids.every(value=>!!value)).toBe(true);
 await page.reload();expect(await cards(page).evaluateAll(elements=>elements.map(element=>element.getAttribute('data-plan-id')))).toEqual(ids);await expect(page.getByRole('button',{name:copy.migrate,exact:true})).toHaveCount(0);
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 if(locale==='pl')await page.locator('main').screenshot({path:info.outputPath('identity-320.png'),scale:'css',animations:'disabled'});
 await cards(page).first().getByRole('link').click();await expect(page.locator('#budget-food')).toHaveValue('0');await expect(page.getByRole('button',{name:planEditorCopy[locale].update,exact:true})).toBeDisabled();
});
test('fresh saves use v2 only; remove and undo retain identity while advancing revision',async({page})=>{
 await page.goto('/deals/browser-deal');await page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click();await expect(page).toHaveURL(/\/trip#local=[0-9a-f-]{36}$/);await expect(page.getByRole('button',{name:planEditorCopy.pl.update,exact:true})).toBeDisabled();await expect(page.getByTestId('saved-plan-state')).toHaveText(savedTripCopy.pl.saved);
 expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(null);await page.goto('/saved');await expect(cards(page)).toHaveCount(1);const id=await cards(page).getAttribute('data-plan-id');
 await cards(page).getByRole('button').click();await expect(cards(page)).toHaveCount(0);await page.getByRole('button',{name:savedTripCopy.pl.undo,exact:true}).click();await expect(cards(page)).toHaveCount(1);await expect(cards(page)).toHaveAttribute('data-plan-id',id!);await expect(cards(page)).toHaveAttribute('data-plan-revision','2');
 await page.reload();await expect(cards(page)).toHaveAttribute('data-plan-id',id!);
});
test('old tabs cannot overwrite v2; importing additions never resurrects an unchanged deleted plan',async({page})=>{
 const a=snapshot('a'),b=snapshot('b'),c=snapshot('c'),d=snapshot('d'),raw=JSON.stringify([a,b]);await seed(page,raw);await page.getByRole('button',{name:planStorageCopy.pl.migrate,exact:true}).click();await expect(cards(page).first()).toHaveAttribute('data-plan-revision','1');
 await cards(page).first().getByRole('button').click();await expect(cards(page)).toHaveCount(1);const remaining=await cards(page).getAttribute('data-plan-id');
 await page.evaluate(({key,raw})=>{localStorage.setItem(key,raw);window.dispatchEvent(new Event('focus'));},{key:savedTripsKey,raw:JSON.stringify([c,d,a,b])});
 await expect(page.locator('main')).toContainText(planStorageCopy.pl.legacyChanged);await page.getByRole('button',{name:planStorageCopy.pl.import,exact:true}).click();await expect(page.getByRole('status')).toHaveText(planStorageCopy.pl.imported);await expect(cards(page)).toHaveCount(3);
 const store=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),savedPlansKey);expect(store.plans.map((plan:{token:string})=>plan.token)).toEqual([c,d,b]);expect(store.legacyBackup).toBe(raw);expect(store.plans.some((plan:{id:string})=>plan.id===remaining)).toBe(true);
 await page.evaluate(key=>{localStorage.setItem(key,'{broken');window.dispatchEvent(new Event('focus'));},savedTripsKey);await expect(page.locator('main')).toContainText(planStorageCopy.pl.legacyCorrupt);await expect(cards(page).first().getByRole('button')).toBeEnabled();
});
test('a legacy change while migration waits for the cross-tab lock yields conflict without overwriting either key',async({page,context})=>{
 const raw=JSON.stringify([snapshot('a')]),later=JSON.stringify([snapshot('a'),snapshot('b')]);await seed(page,raw);const other=await context.newPage();await other.goto('/saved');
 const holding=other.evaluate(async lock=>{await navigator.locks.request(lock,async()=>{const flags=window as typeof window&{held:boolean;release:()=>void};flags.held=true;await new Promise<void>(resolve=>{flags.release=resolve;});});},savedPlansLock);
 try{
  await expect.poll(()=>other.evaluate(()=>(window as typeof window&{held:boolean}).held)).toBe(true);await page.getByRole('button',{name:planStorageCopy.pl.migrate,exact:true}).click();await expect(page.getByRole('button',{name:planStorageCopy.pl.migrate,exact:true})).toHaveAttribute('aria-busy','true');
  await other.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:savedTripsKey,raw:later});await other.evaluate(()=>(window as typeof window&{release:()=>void}).release());await holding;
  await expect(page.getByRole('status')).toHaveText(planStorageCopy.pl.conflict);expect(await page.evaluate(key=>localStorage.getItem(key),savedPlansKey)).toBe(null);expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(later);
 }finally{await other.evaluate(()=>(window as typeof window&{release?:()=>void}).release?.()).catch(()=>{});await holding.catch(()=>{});await other.close();}
});
test('parallel saves from two tabs retain both plans with distinct IDs',async({page,context})=>{
 const other=await context.newPage();try{
  await Promise.all([page.goto('/deals/browser-deal'),other.goto('/deals/browser-2')]);await Promise.all([page.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click(),other.getByRole('button',{name:'Zapisz wyjazd',exact:true}).click()]);
  await expect(page.getByTestId('saved-plan-state')).toHaveText(savedTripCopy.pl.saved);await expect(other.getByTestId('saved-plan-state')).toHaveText(savedTripCopy.pl.saved);await page.goto('/saved');await expect(cards(page)).toHaveCount(2);
  const store=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),savedPlansKey);expect(new Set(store.plans.map((plan:{id:string})=>plan.id)).size).toBe(2);expect(store.revision).toBe(2);
 }finally{await other.close();}
});
test('failed migration preserves the source; unavailable locking keeps reading and sharing available',async({page,context})=>{
 const raw=JSON.stringify([snapshot('missing-a')]);await seed(page,raw);await page.evaluate(key=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===key)throw new DOMException('Synthetic quota','QuotaExceededError');return set.call(this,name,value);};},savedPlansKey);
 await page.getByRole('button',{name:planStorageCopy.pl.migrate,exact:true}).click();await expect(page.getByRole('status')).toContainText('Nie udało się zapisać');expect(await page.evaluate(key=>localStorage.getItem(key),savedTripsKey)).toBe(raw);expect(await page.evaluate(key=>localStorage.getItem(key),savedPlansKey)).toBe(null);
 const other=await context.newPage();try{
  await other.addInitScript(()=>Object.defineProperty(navigator,'locks',{value:undefined}));await other.goto('/saved');await expect(other.locator('main')).toContainText(planStorageCopy.pl.unsupported);await expect(other.getByRole('button',{name:planStorageCopy.pl.migrate,exact:true})).toBeDisabled();await cards(other).getByRole('link').click();await expect(other.locator('#budget-food')).toHaveValue('0');
  await other.getByRole('button',{name:'Udostępnij',exact:true}).click();await expect(other.locator('#trip-share-link')).toHaveValue(/\/trip#plan=/);
 }finally{await other.close();}
});
