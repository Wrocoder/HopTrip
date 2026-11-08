import {test,expect,type Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {localizedHref} from '../src/lib/i18n/routing';
import {navigation} from '../src/lib/i18n/navigation';
import {tripText} from '../src/lib/i18n/trip-copy';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';

type Event={event_name:string;anonymous_session_id:string;source?:string;metadata:{page_type?:string;campaign?:string}};
type Initial='allow'|'deny'|'absent'|'expired'|'future'|'malformed';
const consentKey='hoptrip.consent.v1',sessionKey='hoptrip.session.v2';
const staleId='00000000-0000-4000-8000-000000000088';
test.setTimeout(60000);
test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Session hydration regression requires the isolated production build');
test.beforeAll(async({request},info)=>{
 const config=readFileSync(info.config.configFile!,'utf8');expect(config).toContain('npm run start --');expect(config).toContain("NODE_ENV:'production'");expect(config).not.toContain('reuseExistingServer:true');
 expect(readFileSync('playwright.config.ts','utf8')).not.toContain('reuseExistingServer:true');
 expect(await (await request.get('/saved')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
});
async function setup(page:Page,initial:Initial='allow',stale=false,storage?:'session-only'|'all'){
 await page.addInitScript(({initial,stale,consentKey,sessionKey,staleId,storage})=>{
  (window as typeof window&{h3Document:string}).h3Document=crypto.randomUUID();
  if(!sessionStorage.getItem('h3.session.fixture.initialized')){
   sessionStorage.setItem('h3.session.fixture.initialized','1');
   if(initial!=='absent')localStorage.setItem(consentKey,initial==='malformed'?'broken-json':JSON.stringify({version:1,analytics:initial!=='deny',marketing:false,at:Date.now()-(initial==='expired'?181*86400000:initial==='future'?-86400000:0)}));
   if(stale)localStorage.setItem(sessionKey,JSON.stringify({id:staleId,touched:Date.now()}));
  }
  if(storage==='all')Object.defineProperty(window,'localStorage',{get(){throw Error('Synthetic blocked storage');}});
  if(storage==='session-only')for(const method of ['getItem','setItem','removeItem'] as const){
   const original=Storage.prototype[method];Object.defineProperty(Storage.prototype,method,{value:function(key:string,value?:string){if(this===localStorage&&key===sessionKey)throw Error('Synthetic blocked session store');return Reflect.apply(original,this,method==='setItem'?[key,value]:[key]);}});
  }
 },{initial,stale,consentKey,sessionKey,staleId,storage});
 const events:Event[]=[],statuses:{name:string;status:number}[]=[],errors:string[]=[],failed:{name:string;reason?:string}[]=[];
 page.on('request',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.method()==='POST')events.push(r.postDataJSON());});
 page.on('response',r=>{if(r.url().endsWith('/api/v1/analytics/events')&&r.request().method()==='POST')statuses.push({name:r.request().postDataJSON().event_name,status:r.status()});});
 page.on('requestfailed',r=>{if(r.url().endsWith('/api/v1/analytics/events'))failed.push({name:r.postDataJSON().event_name,reason:r.failure()?.errorText});});
 page.on('pageerror',error=>errors.push(error.message));
 const views=()=>events.filter(e=>e.event_name==='PAGE_VIEW');
 const flush=async()=>{
  // Save immediately unloads its document. Its best-effort keepalive response
  // need not remain observable on Page, even when the backend accepts the POST.
  try{await expect.poll(()=>statuses.filter(s=>s.name!=='TRIP_SAVE').length===events.filter(e=>e.event_name!=='TRIP_SAVE').length).toBe(true);expect(statuses.every(s=>s.status===202)).toBe(true);expect(errors).toEqual([]);}
  finally{writeFileSync(test.info().outputPath('transport.json'),JSON.stringify({events:events.map(e=>e.event_name),responses:statuses,failed},null,2));}
 };
 return {events,views,flush,errors};
}
const storedId=(page:Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'null')?.id,sessionKey);
const documentId=(page:Page)=>page.evaluate(()=>(window as typeof window&{h3Document:string}).h3Document);
async function grant(page:Page){
 if(!await page.locator('.consent-panel').count())await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();
 await page.locator('.consent-panel input[type="checkbox"]').first().check();
 await page.getByRole('button',{name:'Zapisz wybór',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);
}
async function revoke(page:Page){
 await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Odrzuć opcjonalne',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);
}

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: accepted session survives reload, Save auto-open and full navigation`,async({page},info)=>{
 const {events,views,flush}=await setup(page);
 await page.goto(localizedHref('/deals/browser-deal?utm_source=newsletter&utm_campaign=test',locale));await expect(page.locator('#budget-start')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);await flush();
 const first=views()[0].anonymous_session_id,document=await documentId(page);
 await page.reload();await expect(page.locator('#budget-start')).toBeEnabled();await expect.poll(()=>views().length).toBe(2);await flush();
 expect(await documentId(page)).not.toBe(document);expect(await storedId(page)).toBe(first);expect(views()[1].anonymous_session_id).toBe(first);
 await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');
 await page.locator('#trip-save').getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();
 await expect(page).toHaveURL(/\/trip#local=[a-f0-9-]{36}$/);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);await expect.poll(()=>views().length).toBe(3);await flush();
 expect(events.filter(e=>e.event_name==='TRIP_SAVE')).toHaveLength(1);
 await page.goto(localizedHref('/saved',locale));await expect.poll(()=>views().length).toBe(4);await expect(page.locator('.consent-panel')).toHaveCount(0);await flush();
 expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));
 expect(events.every(e=>e.source==='newsletter'&&e.metadata.campaign==='test')).toBe(true);
 expect(views().map(e=>e.metadata.page_type)).toEqual(['deal','deal','saved_trip','saved']);
 writeFileSync(info.outputPath('navigation.json'),JSON.stringify({locale,views:4,distinctSessions:1,saveAutoOpenRetainsSession:true,sourceCampaignRetained:true},null,2));
});

test('client navigation and real language-switcher full navigations keep one session',async({page},info)=>{
 const {events,views,flush}=await setup(page);await page.goto('/saved?utm_source=newsletter&utm_campaign=test');await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id,document=await documentId(page);
 await page.getByRole('navigation',{name:navigation.pl.main,exact:true}).getByRole('link',{name:navigation.pl.budget,exact:true}).click();await expect(page).toHaveURL(/\/info\/trip-budget$/);await expect.poll(()=>views().length).toBe(2);await flush();expect(await documentId(page)).toBe(document);
 let previous=document;
 for(const [index,locale] of (['en','ru','uk','pl'] as const).entries()){
  await page.locator(`.language-switcher a[lang="${locale}"]`).click();await expect(page).toHaveURL(new RegExp(localizedHref('/info/trip-budget',locale)+'$'));await expect.poll(()=>views().length).toBe(index+3);await flush();
  expect(await documentId(page)).not.toBe(previous);previous=await documentId(page);
 }
 expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));expect(events.every(e=>e.source==='newsletter'&&e.metadata.campaign==='test')).toBe(true);
 writeFileSync(info.outputPath('client-locale.json'),JSON.stringify({clientNavigationWithoutDocumentReload:true,languageSwitches:4,views:6,distinctSessions:1},null,2));
});

test('denial, grant, revocation and regrant clear old identity without replaying actions',async({page},info)=>{
 const {events,views,flush}=await setup(page,'deny',true);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>storedId(page)).toBeUndefined();
 await page.locator('#budget-hotel').fill('10');expect(events).toEqual([]);
 await grant(page);await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;expect(first).not.toBe(staleId);expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(0);
 await page.locator('#budget-hotel').fill('20');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);await flush();
 await revoke(page);await expect.poll(()=>storedId(page)).toBeUndefined();const before=events.length;
 await page.locator('#budget-hotel').fill('30');await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();expect(events).toHaveLength(before);expect(await storedId(page)).toBeUndefined();
 await grant(page);await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(1);
 writeFileSync(info.outputPath('revocation.json'),JSON.stringify({staleIdentityCleared:true,noPreGrantOrRevokedReplay:true,regrantStartsNewSession:true},null,2));
});

for(const initial of ['absent','expired','future','malformed'] as const)test(`${initial} consent clears an existing session and sends nothing`,async({page})=>{
 const {events,flush}=await setup(page,initial,true);await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect(page.locator('.consent-panel')).toBeVisible();await expect.poll(()=>storedId(page)).toBeUndefined();
 await page.locator('#budget-hotel').fill('10');await flush();expect(events).toEqual([]);
});

test('idle expiry rotates at thirty minutes while a twenty-nine-minute session survives hydration',async({page},info)=>{
 const {views,flush}=await setup(page);await page.goto('/saved');await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
 for(const [minutes,count] of [[29,2],[30,3]]){
  await page.evaluate(({key,minutes})=>{const session=JSON.parse(localStorage.getItem(key)!);session.touched=Date.now()-minutes*60000;localStorage.setItem(key,JSON.stringify(session));},{key:sessionKey,minutes});
  await page.reload();await expect.poll(()=>views().length).toBe(count);await flush();
  if(minutes===29)expect(views()[count-1].anonymous_session_id).toBe(first);else expect(views()[count-1].anonymous_session_id).not.toBe(first);
 }
 writeFileSync(info.outputPath('expiry.json'),JSON.stringify({at29MinutesSameSession:true,at30MinutesNewSession:true,views:3},null,2));
});

test('consent storage events from another tab revoke tracking and clear shared identity',async({page,context})=>{
 const {events,views,flush}=await setup(page);
 await page.addInitScript(()=>{
  const state=window as typeof window&{h3SessionClears:number};state.h3SessionClears=0;const remove=Storage.prototype.removeItem;
  Storage.prototype.removeItem=function(key:string){if(key==='hoptrip.session.v2')state.h3SessionClears++;return remove.call(this,key);};
 });
 await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
 const other=await context.newPage();try{
  await other.goto('/saved');await expect.poll(()=>storedId(other)).toBe(first);await revoke(other);
  await page.bringToFront();await expect.poll(()=>page.evaluate(()=>(window as typeof window&{h3SessionClears:number}).h3SessionClears)).toBeGreaterThan(0);
  await expect.poll(()=>storedId(page)).toBeUndefined();const before=events.length;await page.locator('#budget-hotel').fill('15');await flush();expect(events).toHaveLength(before);
  await grant(other);await page.bringToFront();await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);expect(await storedId(page)).toBe(await storedId(other));expect(events.filter(e=>e.event_name==='BUDGET_USE')).toHaveLength(0);
 }finally{await other.close();}
});

for(const storage of ['session-only','all'] as const)test(`${storage} blocked storage keeps analytics optional and the calculator usable`,async({page},info)=>{
 const {events,views,flush}=await setup(page,'allow',false,storage);
 await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();
 if(storage==='all'){await expect(page.locator('.consent-panel')).toBeVisible();expect(events).toEqual([]);await grant(page);}
 await expect.poll(()=>views().length).toBe(1);await flush();const first=views()[0].anonymous_session_id;
 await page.locator('#budget-hotel').fill('15');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);await flush();expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));
 const before=events.length;await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();
 if(storage==='all'){await expect(page.locator('.consent-panel')).toBeVisible();expect(events).toHaveLength(before);}
 else{await expect.poll(()=>views().length).toBe(2);await flush();expect(views()[1].anonymous_session_id).not.toBe(first);}
 writeFileSync(info.outputPath('storage.json'),JSON.stringify({storage,calculatorUsable:true,inDocumentMemorySession:true,crossDocumentPersistenceAvailable:false},null,2));
});

test('blocked transport does not retry or reset a valid session',async({page},info)=>{
 const {events,views,errors}=await setup(page);await page.route('**/api/v1/analytics/events',route=>route.abort('failed'));
 await page.goto('/deals/browser-deal');await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(1);const first=views()[0].anonymous_session_id;
 await page.locator('#budget-hotel').fill('15');await expect.poll(()=>events.filter(e=>e.event_name==='BUDGET_USE').length).toBe(1);
 await page.getByRole('button',{name:'Ustawienia prywatności',exact:true}).click();await page.getByRole('button',{name:'Zapisz wybór',exact:true}).click();await expect(page.locator('.consent-panel')).toHaveCount(0);expect(views()).toHaveLength(1);
 await page.reload();await expect(page.locator('#budget-hotel')).toBeEnabled();await expect.poll(()=>views().length).toBe(2);expect(new Set(events.map(e=>e.anonymous_session_id))).toEqual(new Set([first]));expect(errors).toEqual([]);
 writeFileSync(info.outputPath('blocked.json'),JSON.stringify({attemptedViews:2,documents:2,distinctSessions:1,noRetryFromConsentRerender:true,calculatorUsable:true},null,2));
});
