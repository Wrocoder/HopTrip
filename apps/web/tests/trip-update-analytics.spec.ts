import {test,expect,type Page} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {encodeTrip,decodeTrip} from '../src/lib/shared-trip';
import {savedPlansKey,savedPlansLock} from '../src/lib/saved-plans';
import {emptyBudget} from '../src/lib/trip-budget';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';
import {tripText} from '../src/lib/i18n/trip-copy';
import {localizedHref} from '../src/lib/i18n/routing';

type WireEvent={event_name:string;metadata:Record<string,unknown>;[key:string]:unknown};
const id='00000000-0000-4000-8000-000000000018';
const token=encodeTrip({version:1,offer:{slug:'browser-deal',origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''},draft:{version:1,input:{...emptyBudget,flight:'100',food:'0'},start:'2030-05-01',end:'2030-05-03',context:'',review:true}})!;
const records=(page:Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).plans as {id:string;revision:number;token:string}[],savedPlansKey);

test.beforeAll(async({request})=>{
 if(process.env.HOPTRIP_H3_PRODUCTION!=='1')return;
 const runner=readFileSync('playwright.config.ts','utf8');
 expect(runner).toContain('command:"npm run start --');expect(runner).toContain('NODE_ENV:"production"');
 expect(runner).not.toContain('reuseExistingServer:true');
 expect(await (await request.get('/saved')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
});

async function setup(page:Page,analytics=true,locale:'pl'|'en'|'ru'|'uk'='pl'){
 const events:WireEvent[]=[];
 await page.route('**/api/v1/analytics/events',async route=>{
  events.push(route.request().postDataJSON());await route.continue();
 });
 await page.goto('/saved');
 await page.evaluate(({key,id,token,analytics})=>{
  localStorage.clear();sessionStorage.clear();
  localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics,marketing:false,at:Date.now()}));
  localStorage.setItem(key,JSON.stringify({version:2,revision:1,plans:[{id,revision:1,token}],legacyBackup:null,legacySource:null}));
 },{key:savedPlansKey,id,token,analytics});
 await page.goto(localizedHref('/trip',locale)+'#local='+id);
 await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);
 return {events,updates:()=>events.filter(event=>event.event_name==='TRIP_UPDATE'),button:page.getByRole('button',{name:planEditorCopy[locale].update,exact:true})};
}

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: successful Update alone sends one private event; opening/reload/share/duplicate do not`,async({page})=>{
 const {events,updates,button}=await setup(page,true,locale);
 await expect(button).toBeDisabled();expect(updates()).toEqual([]);
 await page.locator('#budget-food').fill('18');await expect(button).toBeEnabled();expect(updates()).toEqual([]);
 await page.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true}).click();
 await expect(page.locator('#trip-share-link')).toHaveValue(/#plan=/);expect(updates()).toEqual([]);
 const accepted=page.waitForResponse(response=>response.url().endsWith('/api/v1/analytics/events')&&response.request().postDataJSON().event_name==='TRIP_UPDATE');
 await button.click();expect((await accepted).status()).toBe(202);
 await expect(button).toBeDisabled();expect(updates()).toHaveLength(1);
 expect((await records(page)).map(plan=>({id:plan.id,revision:plan.revision}))).toEqual([{id,revision:2}]);
 expect(updates()[0].metadata).toEqual({page_type:'saved_trip',locale});
 expect(Object.keys(updates()[0]).sort()).toEqual(['anonymous_session_id','event_id','event_name','metadata']);
 expect(JSON.stringify(updates())).not.toContain(id);expect(JSON.stringify(updates())).not.toContain(token);
 await page.reload();await expect(button).toBeDisabled();expect(updates()).toHaveLength(1);
 await page.getByRole('button',{name:planEditorCopy[locale].duplicate,exact:true}).click();
 await expect(page).not.toHaveURL(new RegExp('#local='+id+'$'));await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);
 expect(await records(page)).toHaveLength(2);expect(events.filter(event=>event.event_name==='TRIP_SAVE')).toHaveLength(1);expect(updates()).toHaveLength(1);
});

test('denial and revocation suppress successful updates; accepting has no replay',async({page})=>{
 const {updates,button}=await setup(page,false);
 await page.locator('#budget-food').fill('18');await button.click();await expect(button).toBeDisabled();await expect(button).toHaveAttribute('aria-busy','false');expect(updates()).toEqual([]);
 await page.evaluate(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:true,marketing:false,at:Date.now()})));
 await page.reload();await expect(button).toBeDisabled();expect(updates()).toEqual([]);
 await page.locator('#budget-food').fill('19');await button.click();await expect(button).toBeDisabled();await expect(button).toHaveAttribute('aria-busy','false');await expect.poll(()=>updates().length).toBe(1);
 // Exercise the actual settings UI's revocation, rather than only writing its key.
 await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
 await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 await page.locator('#budget-food').fill('20');await button.click();await expect(button).toBeDisabled();await expect(button).toHaveAttribute('aria-busy','false');
 expect((await records(page))[0].revision).toBe(4);expect(updates()).toHaveLength(1);
});

test('consent revoked while Update waits for the lock prevents a send after commit',async({page,context})=>{
 const {updates,button}=await setup(page),other=await context.newPage();await other.goto('/saved');
 const pending=other.evaluate(async key=>{await navigator.locks.request(key,async()=>{const flags=window as typeof window&{held:boolean;release:()=>void};flags.held=true;await new Promise<void>(resolve=>{flags.release=resolve;});});},savedPlansLock);
 try{
  await expect.poll(()=>other.evaluate(()=>(window as typeof window&{held:boolean}).held)).toBe(true);
  await page.locator('#budget-food').fill('18');await button.click();await expect(button).toHaveAttribute('aria-busy','true');expect(updates()).toEqual([]);
  await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();
 }finally{await other.evaluate(()=>(window as typeof window&{release:()=>void}).release());await pending;await other.close();}
 await expect(button).toHaveAttribute('aria-busy','false');await expect(button).toBeDisabled();
 expect((await records(page))[0].revision).toBe(2);expect(updates()).toEqual([]);
 expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();
});

test('failed storage commit and blocked analytics leave editor recovery intact',async({page})=>{
 const {updates,button}=await setup(page);
 await page.evaluate(key=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(name,value){if(name===key)throw Error('Synthetic quota');return original.call(this,name,value);};},savedPlansKey);
 await page.locator('#budget-food').fill('18');await button.click();
 await expect(page.locator('#trip-save')).toContainText('Nie udało się zapisać');await expect(button).toBeEnabled();
 expect((await records(page))[0].revision).toBe(1);expect(updates()).toEqual([]);
 await page.reload();await expect(button).toBeEnabled();
 await page.unroute('**/api/v1/analytics/events');
 let attempts=0;await page.route('**/api/v1/analytics/events',async route=>{if(route.request().postDataJSON().event_name==='TRIP_UPDATE')attempts++;await route.abort('blockedbyclient');});
 await button.click();await expect(button).toBeDisabled();await expect.poll(()=>attempts).toBe(1);
 expect((await records(page))[0].revision).toBe(2);await page.reload();await expect(button).toBeDisabled();expect(attempts).toBe(1);
});

test('lock wait emits only after commit; concurrent no-op and conflict emit nothing',async({page,context})=>{
 const {updates,button}=await setup(page),other=await context.newPage();
 await other.goto('/saved');
 async function hold(){
  const pending=other.evaluate(async key=>{await navigator.locks.request(key,async()=>{const flags=window as typeof window&{held:boolean;release:()=>void};flags.held=true;await new Promise<void>(resolve=>{flags.release=resolve;});flags.held=false;});},savedPlansLock);
  await expect.poll(()=>other.evaluate(()=>(window as typeof window&{held:boolean}).held)).toBe(true);
  return {pending,release:()=>other.evaluate(()=>(window as typeof window&{release:()=>void}).release())};
 }
 try{
  const lock=await hold();try{
   await page.locator('#budget-food').fill('18');await button.click();await expect(button).toHaveAttribute('aria-busy','true');expect(updates()).toEqual([]);
  }finally{await lock.release();await lock.pending;}
  await expect(button).toBeDisabled();await expect.poll(()=>updates().length).toBe(1);
  // A second writer commits identical content without advancing the record revision:
  // the waiting update returns "already", which must not be counted as a new write.
  const same=await hold();try{
   await page.locator('#budget-food').fill('19');await button.click();await expect(button).toHaveAttribute('aria-busy','true');
   const current=(await records(page))[0];
   const trip=decodeTrip(current.token)!;trip.draft.input.food='19';const matching=encodeTrip(trip)!;
   await other.evaluate(({key,matching})=>{const value=JSON.parse(localStorage.getItem(key)!);value.plans[0].token=matching;localStorage.setItem(key,JSON.stringify(value));},{key:savedPlansKey,matching});
  }finally{await same.release();await same.pending;}
  await expect(button).toBeDisabled();expect(updates()).toHaveLength(1);
  const conflict=await hold();try{
   await page.locator('#budget-food').fill('20');await button.click();await expect(button).toHaveAttribute('aria-busy','true');
   await other.evaluate(key=>{const value=JSON.parse(localStorage.getItem(key)!);value.plans[0].revision++;value.revision++;localStorage.setItem(key,JSON.stringify(value));},savedPlansKey);
  }finally{await conflict.release();await conflict.pending;}
  await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.conflict);expect(updates()).toHaveLength(1);
 }finally{await other.close();}
});
