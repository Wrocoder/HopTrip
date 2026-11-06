import {test,expect,type Page} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {encodeTrip} from '../src/lib/shared-trip';
import {emptyBudget} from '../src/lib/trip-budget';
import {savedPlansKey} from '../src/lib/saved-plans';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';
import {tripText} from '../src/lib/i18n/trip-copy';
import {localizedHref} from '../src/lib/i18n/routing';

type Locale='pl'|'en'|'ru'|'uk';
type WireEvent={event_id:string;anonymous_session_id:string;event_name:string;metadata:{page_type?:string};[key:string]:unknown};
test.setTimeout(60000);
test.skip(process.env.HOPTRIP_H3_PRODUCTION!=='1','Audit requires an isolated production fixture build');
test.beforeAll(async({request})=>{
 const runner=readFileSync('playwright.config.ts','utf8');expect(runner).toContain('command:"npm run start --');expect(runner).toContain('NODE_ENV:"production"');expect(runner).not.toContain('reuseExistingServer:true');
 expect(await (await request.get('/saved')).text()).toContain(readFileSync('.next/BUILD_ID','utf8').trim());
});
async function capture(page:Page,allowed=true){
 await page.addInitScript(analytics=>{if(!localStorage.getItem('hoptrip.consent.v1'))localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics,marketing:false,at:Date.now()}));},allowed);
 const events:WireEvent[]=[],errors:string[]=[];
 page.on('request',request=>{if(request.url().endsWith('/api/v1/analytics/events')&&request.method()==='POST')events.push(request.postDataJSON());});page.on('pageerror',error=>errors.push(error.message));
 return {events,errors,views:()=>events.filter(event=>event.event_name==='PAGE_VIEW'&&event.metadata.page_type==='saved_trip')};
}
async function save(page:Page,locale:Locale='pl'){
 await page.goto(localizedHref('/deals/browser-deal',locale));await expect(page.locator('#budget-start')).toBeEnabled();
 await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');
 await page.locator('#trip-save').getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();
 await expect(page).toHaveURL(/\/trip#local=[a-f0-9-]{36}$/);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);
 return new URL(page.url()).hash.slice('#local='.length);
}
const safe=(events:WireEvent[])=>events.map(event=>({event:event.event_name,page_type:event.metadata.page_type}));

for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: Save automatically emits a saved-page view before any manual return`,async({page},info)=>{
 await page.addInitScript(()=>{
  const remove=Storage.prototype.removeItem;
  Storage.prototype.removeItem=function(key:string){
   if(this===localStorage&&key==='hoptrip.session.v2'&&this.getItem(key)){
    const consent=JSON.parse(localStorage.getItem('hoptrip.consent.v1')||'null'),session=JSON.parse(this.getItem(key)!);
    const trace=JSON.parse(sessionStorage.getItem('h3.audit.session-removals')||'[]');
    trace.push({path:location.pathname,storedAnalyticsConsent:consent?.analytics===true,consentAgeMs:Date.now()-consent?.at,sessionAgeMs:Date.now()-session.touched,stack:new Error().stack});
    sessionStorage.setItem('h3.audit.session-removals',JSON.stringify(trace));
   }
   return remove.call(this,key);
  };
 });
 const {events,views,errors}=await capture(page);const id=await save(page,locale);await expect.poll(()=>views().length).toBe(1);
 const saved=events.findIndex(event=>event.event_name==='TRIP_SAVE'),opened=events.findIndex(event=>event===views()[0]);
 expect(saved).toBeGreaterThanOrEqual(0);expect(opened).toBeGreaterThan(saved);
 expect(JSON.stringify(views())).not.toContain(id);expect(errors).toEqual([]);
 const sessionRemovals=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('h3.audit.session-removals')||'[]'));
 writeFileSync(info.outputPath('auto-open.json'),JSON.stringify({locale,manualReturnPerformed:false,naiveSaveThenSavedViewIgnoringIdentityWouldBePositive:true,sameAnonymousSessionAcrossAutoOpen:views()[0].anonymous_session_id===events[saved].anonymous_session_id,sessionRemovals,trace:safe(events)},null,2));
});

const idA='00000000-0000-4000-8000-000000000071',idB='00000000-0000-4000-8000-000000000072';
const snapshot=(food:string)=>encodeTrip({version:1,offer:{slug:'browser-deal',origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''},draft:{version:1,input:{...emptyBudget,flight:'100',food},start:'2030-05-01',end:'2030-05-03',context:'',review:false}})!;
async function seed(page:Page){
 await page.goto('/saved');const a=snapshot('10'),b=snapshot('20');
 await page.evaluate(({key,a,b,idA,idB})=>localStorage.setItem(key,JSON.stringify({version:2,revision:1,plans:[{id:idA,revision:1,token:a},{id:idB,revision:1,token:b}],legacyBackup:null,legacySource:null})),{key:savedPlansKey,a,b,idA,idB});return {a,b};
}

test('reload, different local plan and shared copy have the same observable view shape; hash-only changes can be missed',async({page},info)=>{
 const {views,errors}=await capture(page),{a}=await seed(page);
 await page.route('**/__audit__/untracked',route=>route.fulfill({contentType:'text/html',body:'<title>Synthetic untracked page</title><p>Local fixture without the application tracker</p>'}));
 await page.goto('/trip#local='+idA);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);await expect(page.locator('#budget-food')).toHaveValue('10');await expect.poll(()=>views().length).toBe(1);
 await page.reload();await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);await expect.poll(()=>views().length).toBe(2);
 await page.goto('/__audit__/untracked');await page.goto('/trip#local='+idA);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);await expect.poll(()=>views().length).toBe(3);
 await page.goto('/__audit__/untracked');await page.goto('/trip#local='+idB);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);await expect(page.locator('#budget-food')).toHaveValue('20');await expect.poll(()=>views().length).toBe(4);
 await page.goto('/__audit__/untracked');await page.goto('/trip#plan='+a);await expect(page.locator('#budget-food')).toBeEnabled();await expect(page.locator('#budget-food')).toHaveValue('10');await expect(page.getByTestId('plan-edit-state')).toHaveCount(0);await expect.poll(()=>views().length).toBe(5);
 const normalized=views().map(({event_id,anonymous_session_id,...event})=>{void event_id;void anonymous_session_id;return event;});
 for(const shape of normalized)expect(shape).toEqual(normalized[0]);
 expect(Object.keys(views()[0]).sort()).toEqual(['anonymous_session_id','event_id','event_name','metadata']);
 await page.evaluate(id=>{location.hash='local='+id;},idA);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);expect(views()).toHaveLength(5);
 expect(JSON.stringify(views())).not.toMatch(/plan=|local=|plan_id|revision|navigation_cause/);expect(errors).toEqual([]);
 const sessions=[...new Set(views().map(event=>event.anonymous_session_id))];
 writeFileSync(info.outputPath('indistinguishable.json'),JSON.stringify({cases:['local A open','local A reload','return to A after untracked local fixture','different local B','shared copy A'],distinctAnonymousSessions:sessions.length,sessionSequence:views().map(event=>'session-'+(sessions.indexOf(event.anonymous_session_id)+1)),semanticShapesEqual:true,excludedRandomIdentityFields:['event_id','anonymous_session_id'],normalizedKeys:Object.keys(normalized[0]).sort(),pageTypes:safe(views()),hashOnlyLocalTransitionGeneratedNewView:false},null,2));
});

test('the same retained plan can reopen with a new anonymous session after idle expiry',async({page},info)=>{
 const {views,errors}=await capture(page);await seed(page);await page.goto('/trip#local='+idA);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);await expect.poll(()=>views().length).toBe(1);
 const first=views()[0].anonymous_session_id;
 await page.evaluate(()=>{const key='hoptrip.session.v2',session=JSON.parse(localStorage.getItem(key)!);session.touched=Date.now()-30*60*1000-1;localStorage.setItem(key,JSON.stringify(session));});
 await page.reload();await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);await expect.poll(()=>views().length).toBe(2);
 expect(views()[1].anonymous_session_id).not.toBe(first);expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).plans[0].id,savedPlansKey)).toBe(idA);expect(errors).toEqual([]);
 writeFileSync(info.outputPath('session-expiry.json'),JSON.stringify({sameBrowser:true,sameRetainedLocalPlan:true,anonymousSessionChanged:true,trace:safe(views())},null,2));
});

test('denied analytics still allows Save and an actual reopen with no received browser events',async({page},info)=>{
 const {events,views,errors}=await capture(page,false),id=await save(page);await page.goto('/saved');await page.locator(`li[data-plan-id="${id}"]`).getByRole('link').click();
 await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);expect(events).toEqual([]);expect(views()).toEqual([]);expect(await page.evaluate(()=>localStorage.getItem('hoptrip.session.v2'))).toBeNull();expect(errors).toEqual([]);
 writeFileSync(info.outputPath('denied.json'),JSON.stringify({manualReturnPerformed:true,localPlanAvailable:true,analyticsEvents:0,sessionIdStored:false},null,2));
});
