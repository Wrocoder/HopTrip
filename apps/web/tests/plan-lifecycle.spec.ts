import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {encodeTrip,decodeTrip} from '../src/lib/shared-trip';
import {savedPlansKey,savedPlansLock} from '../src/lib/saved-plans';
import {localPlanPath,planDraftKey} from '../src/lib/plan-editor';
import {planEditorCopy} from '../src/lib/i18n/plan-editor-copy';
import {savedTripCopy} from '../src/lib/i18n/saved-trip-copy';
import {tripText} from '../src/lib/i18n/trip-copy';
import {budgetText} from '../src/lib/i18n/budget-copy';
import {localizedHref} from '../src/lib/i18n/routing';
import {emptyBudget} from '../src/lib/trip-budget';
type Page=import('@playwright/test').Page;
test.setTimeout(90000);
test.beforeEach(async({page})=>{await page.addInitScript(()=>localStorage.setItem('hoptrip.consent.v1',JSON.stringify({version:1,analytics:false,marketing:false,at:Date.now()})));});
const records=(page:Page)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).plans as {id:string;revision:number;token:string}[],savedPlansKey);
const currentId=(page:Page)=>new URLSearchParams(new URL(page.url()).hash.slice(1)).get('local')!;
async function create(page:Page,locale:'pl'|'en'|'ru'|'uk'='pl'){
 await page.goto(localizedHref('/deals/browser-deal',locale));await page.locator('#budget-start').fill('2030-05-01');await page.locator('#budget-end').fill('2030-05-03');await page.locator('#budget-people').fill('2');await page.locator('#budget-flight').fill('100.25');await page.locator('#budget-hotel').fill('0');await page.locator('#budget-food').fill('10');
 await page.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();await expect(page).toHaveURL(/\/trip#local=[0-9a-f-]{36}$/);await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy[locale].saved);return currentId(page);
}
for(const locale of ['pl','en','ru','uk'] as const)test(`${locale}: Save opens an ID editor; Update, return, Duplicate, Delete, Undo and independent Share preserve the lifecycle`,async({page,browser},info)=>{
 const copy=planEditorCopy[locale],id=await create(page,locale),update=page.getByRole('button',{name:copy.update,exact:true});await expect(update).toBeDisabled();
 await page.locator('#budget-food').fill('20');await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.dirty);await update.click();await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.saved);
 let plans=await records(page);expect(plans).toHaveLength(1);expect(plans[0].id).toBe(id);expect(plans[0].revision).toBe(2);expect(decodeTrip(plans[0].token)!.draft.input.food).toBe('20');await expect(page.getByTestId('budget-total')).toContainText(/320[,.]50/);
 await page.locator('#budget-food').fill('30');await page.goto(localizedHref('/saved',locale));const original=page.locator('li[data-plan-id="'+id+'"]');await expect(original.getByRole('link')).toHaveAttribute('href',localizedHref(localPlanPath(id),locale));await expect(original).toContainText(/320[,.]50/);await original.getByRole('link').click();await expect(page.locator('#budget-food')).toHaveValue('30');await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.dirty);
 await page.reload();await expect(page.locator('#budget-food')).toHaveValue('30');await update.click();await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.saved);
 await page.locator('#budget-food').fill('40');await page.getByRole('button',{name:copy.duplicate,exact:true}).click();await expect(page).not.toHaveURL(new RegExp('#local='+id+'$'));await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.saved);const duplicate=currentId(page);expect(duplicate).not.toBe(id);
 plans=await records(page);expect(plans).toHaveLength(2);expect(decodeTrip(plans.find(plan=>plan.id===id)!.token)!.draft.input.food).toBe('30');expect(decodeTrip(plans.find(plan=>plan.id===duplicate)!.token)!.draft.input.food).toBe('40');
 await page.getByRole('button',{name:copy.remove,exact:true}).click();await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.removed);await page.getByRole('button',{name:savedTripCopy[locale].undo,exact:true}).click();await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.saved);expect((await records(page)).find(plan=>plan.id===duplicate)!.revision).toBe(2);
 await page.getByRole('button',{name:tripText(locale,'Udostępnij'),exact:true}).click();const link=await page.locator('#trip-share-link').inputValue(),token=new URLSearchParams(new URL(link).hash.slice(1)).get('plan')!;expect(token).toBeTruthy();expect(JSON.stringify(decodeTrip(token))).not.toContain(duplicate);expect(new URL(link).search).toBe('');
 const recipient=await browser.newContext();try{const copyPage=await recipient.newPage();await copyPage.goto(link);await expect(copyPage.locator('#budget-food')).toHaveValue('40');await copyPage.locator('#budget-food').fill('99');await copyPage.getByRole('button',{name:tripText(locale,'Zapisz wyjazd'),exact:true}).click();await expect(copyPage).toHaveURL(/#local=[0-9a-f-]{36}$/);await expect(copyPage.locator('#budget-food')).toHaveValue('99');expect(currentId(copyPage)).not.toBe(duplicate);}finally{await recipient.close();}
 await expect(page.locator('#budget-food')).toHaveValue('40');expect((await records(page)).find(plan=>plan.id===duplicate)!.revision).toBe(2);
 expect((await new AxeBuilder({page}).include('main').analyze()).violations).toEqual([]);await page.setViewportSize({width:320,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);if(locale==='pl')await page.locator('#trip-save').screenshot({path:info.outputPath('editor-320.png'),scale:'css',animations:'disabled'});
});
test('two tabs retain independent drafts through conflicts, reload, explicit discard and deletion recovery',async({page,context})=>{
 const copy=planEditorCopy.pl,id=await create(page),url=page.url(),other=await context.newPage();try{
  await other.goto(url);await expect(other.locator('#budget-food')).toHaveValue('10');await page.locator('#budget-food').fill('20');await other.locator('#budget-food').fill('30');await page.getByRole('button',{name:copy.update,exact:true}).click();await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.saved);
  await expect(other.getByTestId('plan-edit-state')).toHaveText(copy.conflict);await expect(other.locator('#budget-food')).toHaveValue('30');await other.reload();await expect(other.locator('#budget-food')).toHaveValue('30');await expect(other.getByRole('button',{name:copy.update,exact:true})).toBeDisabled();
  await other.getByRole('button',{name:copy.reload,exact:true}).click();await expect(other.getByTestId('plan-edit-state')).toHaveText(copy.saved);await expect(other.locator('#budget-food')).toHaveValue('20');
  await page.locator('#budget-food').fill('50');await other.locator('#budget-food').fill('40');await other.getByRole('button',{name:copy.update,exact:true}).click();await expect(other.getByTestId('plan-edit-state')).toHaveText(copy.saved);await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.conflict);await expect(page.locator('#budget-food')).toHaveValue('50');
  await page.getByRole('button',{name:copy.duplicate,exact:true}).click();await expect(page).not.toHaveURL(new RegExp('#local='+id+'$'));await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.saved);const newId=currentId(page);expect(decodeTrip((await records(page)).find(plan=>plan.id===id)!.token)!.draft.input.food).toBe('40');
  await other.goto('/saved');await other.locator('li[data-plan-id="'+newId+'"]').getByRole('button').click();await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.removed);await page.reload();await expect(page.getByTestId('plan-edit-state')).toHaveText(copy.removed);await expect(page.locator('#budget-food')).toHaveValue('50');
  await page.getByRole('button',{name:copy.duplicate,exact:true}).click();await expect(page).not.toHaveURL(new RegExp('#local='+newId+'$'));await expect(page.locator('#budget-food')).toHaveValue('50');expect((await records(page)).some(plan=>plan.id===newId)).toBe(false);
 }finally{await other.close();}
});
test('edits and reset during an update waiting for the lock are retained while only the captured snapshot is committed',async({page,context})=>{
 const id=await create(page),other=await context.newPage();await other.goto('/saved');
 async function hold(){const promise=other.evaluate(async name=>{await navigator.locks.request(name,async()=>{const flags=window as typeof window&{held:boolean;release:()=>void};flags.held=true;await new Promise<void>(resolve=>{flags.release=resolve;});flags.held=false;});},savedPlansLock);await expect.poll(()=>other.evaluate(()=>(window as typeof window&{held:boolean}).held)).toBe(true);return {promise,release:()=>other.evaluate(()=>(window as typeof window&{release:()=>void}).release())};}
 try{
  for(const reset of [false,true]){
   const oldRevision=(await records(page)).find(plan=>plan.id===id)!.revision,lock=await hold();try{
    await page.locator('#budget-food').fill(reset?'40':'20');await page.getByRole('button',{name:planEditorCopy.pl.update,exact:true}).click();await expect(page.getByRole('button',{name:planEditorCopy.pl.update,exact:true})).toHaveAttribute('aria-busy','true');
    if(reset)await page.getByRole('button',{name:budgetText('pl','Wyczyść kalkulator'),exact:true}).click();else await page.locator('#budget-food').fill('30');
    await lock.release();await lock.promise;await expect.poll(async()=>(await records(page)).find(plan=>plan.id===id)!.revision).toBe(oldRevision+1);await expect.poll(()=>page.evaluate(key=>JSON.parse(JSON.parse(sessionStorage.getItem(key)!).context).plan.revision,planDraftKey(id))).toBe(oldRevision+1);
    await expect(page.locator('#budget-food')).toHaveValue(reset?'':'30');await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.dirty);expect(decodeTrip((await records(page)).find(plan=>plan.id===id)!.token)!.draft.input.food).toBe(reset?'40':'20');
   }finally{await lock.release().catch(()=>{});await lock.promise.catch(()=>{});}
  }
 }finally{await other.close();}
});
const fixedId=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
const snapshot=(slug='browser-deal',past=false)=>encodeTrip({version:1,offer:{slug,origin:'WRO',destination:'Barcelona',start:past?'2020-05-01':'2030-05-01',end:past?'2020-05-03':'2030-05-03',price:'111',observedAt:''},draft:{version:1,input:{...emptyBudget,flight:'100.25',food:'0',hotel:'0'},start:'2030-05-01',end:'2030-05-03',context:'',review:true,adultsOnly:false}})!;
async function seed(page:Page,tokens:string[]){await page.goto('/saved');await page.evaluate(({key,tokens})=>{localStorage.setItem(key,JSON.stringify({version:2,revision:1,plans:tokens.map((token,i)=>({id:'00000000-0000-4000-8000-'+String(i+1).padStart(12,'0'),revision:1,token})),legacyBackup:null,legacySource:null}));},{key:savedPlansKey,tokens});}
test('changed, missing, unavailable and expired offers retain amounts and can still be updated',async({page})=>{
 await seed(page,[snapshot(),snapshot('missing-offer'),snapshot('missing-expired',true)]);await page.goto(localPlanPath(fixedId(1)));await expect(page.getByTestId('saved-offer-changed')).toHaveText(planEditorCopy.pl.changed);await expect(page.locator('#budget-flight')).toHaveValue('100.25');await page.locator('#budget-food').fill('20');await page.getByRole('button',{name:planEditorCopy.pl.update,exact:true}).click();await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);expect(decodeTrip((await records(page)).find(plan=>plan.id===fixedId(1))!.token)!.offer.price).toBe('111');
 await page.goto(localPlanPath(fixedId(2)));await expect(page.getByRole('main').getByRole('status').first()).toContainText('nie jest już dostępna');await expect(page.locator('#budget-flight')).toHaveValue('100.25');
 await page.goto(localPlanPath(fixedId(3)));await expect(page.getByRole('main').getByRole('status').first()).toContainText('już minął');await expect(page.locator('#budget-flight')).toHaveValue('100.25');
 await page.route('**/api/v1/deals/browser-deal',route=>route.abort());await page.goto(localPlanPath(fixedId(1)));await expect(page.getByRole('main').getByRole('status').first()).toContainText('Nie udało się sprawdzić');await expect(page.locator('#budget-food')).toHaveValue('20');
});
test('local links are device-bound; malformed or missing IDs do not request offers',async({page})=>{
 const requests:string[]=[];page.on('request',request=>{if(request.url().includes('/api/v1/deals/'))requests.push(request.url());});await page.goto(localPlanPath(fixedId(9)));await expect(page.getByRole('heading',{level:1})).toHaveText(planEditorCopy.pl.missing);
 for(const hash of ['#local=bad','#local='+fixedId(9)+'&local='+fixedId(9),'#local='+fixedId(9)+'&plan='+snapshot()]){await page.goto('/trip'+hash);await expect(page.getByRole('heading',{level:1})).toHaveText('Nie można odczytać planu');}
 expect(requests).toEqual([]);
});
test('capacity blocks Duplicate without blocking Update; source profiles, events and legacy-copy work survive opening',async({page})=>{
 const values=Array.from({length:20},(_,i)=>snapshot('missing-'+i));const first=decodeTrip(values[0])!;
 first.draft.estimates={version:'budget-estimates-v1',currency:'PLN',selected:'economy',profiles:{economy:{hotel_basis:'night',hotel:{min:'100',max:'150'},food:{min:'20',max:'30'},transfers:{min:'50',max:'80'}}}};
 first.draft.events=[{id:'synthetic-ticket',name:'Synthetic concert',venue:'Synthetic venue',date:'2030-05-02',time:'18:00:00',timezone:'Europe/London',url:'https://ticketmaster.evyy.net/c/7853869/1958975/23899?u='+encodeURIComponent('https://www.ticketmaster.co.uk/event/synthetic-ticket')+'&partnerpropertyid=9029029',quantity:'2',unitPricePln:'10'}];values[0]=encodeTrip(first)!;
 await seed(page,values);await page.goto('/trip#plan='+values[0]);await page.locator('#budget-food').fill('5');await page.goto(localPlanPath(fixedId(1)));await expect(page.locator('#budget-food')).toHaveValue('5');await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.dirty);await page.getByRole('button',{name:planEditorCopy.pl.update,exact:true}).click();await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);
 const plans=await records(page),saved=decodeTrip(plans.find(plan=>plan.id===fixedId(1))!.token)!;expect(plans).toHaveLength(20);expect(saved.draft.estimates).toEqual(first.draft.estimates);expect(saved.draft.events).toEqual(first.draft.events);expect(saved.draft.input.hotel).toBe('0');
 await page.getByRole('button',{name:planEditorCopy.pl.duplicate,exact:true}).click();await expect(page.locator('#trip-save')).toContainText('Masz już 20');expect(currentId(page)).toBe(fixedId(1));expect(await records(page)).toHaveLength(20);
});
test('unavailable locks and draft storage keep reading and independent sharing available',async({page,context})=>{
 const id=await create(page),other=await context.newPage();try{
  await other.addInitScript(()=>{Object.defineProperty(navigator,'locks',{value:undefined});Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Synthetic blocked draft');}});});await other.goto(localPlanPath(id));await expect(other.locator('#budget-food')).toHaveValue('10');await other.locator('#budget-food').fill('30');await expect(other.getByRole('button',{name:planEditorCopy.pl.update,exact:true})).toBeDisabled();await expect(other.locator('#calculator')).toContainText(planEditorCopy.pl.sessionError);
  await other.getByRole('button',{name:'Udostępnij',exact:true}).click();await expect(other.locator('#trip-share-link')).toHaveValue(/\/trip#plan=/);expect(decodeTrip((await records(page)).find(plan=>plan.id===id)!.token)!.draft.input.food).toBe('10');
 }finally{await other.close();}
});
test('local sections, language switching and Back preserve the ID and uncommitted tab draft',async({page})=>{
 const id=await create(page);await page.locator('#budget-food').fill('25');await page.locator('.trip-navigation a[href="#calculator"]').focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp('#local='+id+'&section=calculator$'));await page.reload();await expect(page.locator('#budget-food')).toHaveValue('25');await expect(page.locator('#calculator')).toBeFocused();
 await page.locator('.language-switcher').getByRole('link',{name:'English',exact:true}).click();await expect(page.locator('#budget-food')).toHaveValue('25');await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.en.dirty);await expect(page).toHaveURL(new RegExp('/en/trip#local='+id+'&section=calculator$'));
 await page.goBack();await expect(page.locator('#budget-food')).toHaveValue('25');expect(decodeTrip((await records(page))[0].token)!.draft.input.food).toBe('10');
});
test('failed Update preserves the dirty draft and committed version, then recovers without a new ID',async({page})=>{
 const id=await create(page);await page.locator('#budget-food').fill('20');await page.evaluate(key=>{const set=Storage.prototype.setItem;const flags=window as typeof window&{failPlanWrite:boolean};flags.failPlanWrite=true;Storage.prototype.setItem=function(name,value){if(name===key&&flags.failPlanWrite)throw new DOMException('Synthetic quota','QuotaExceededError');return set.call(this,name,value);};},savedPlansKey);
 await page.getByRole('button',{name:planEditorCopy.pl.update,exact:true}).click();await expect(page.locator('#trip-save')).toContainText('Nie udało się zapisać');await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.dirty);await expect(page.locator('#budget-food')).toHaveValue('20');expect((await records(page))[0].revision).toBe(1);expect(decodeTrip((await records(page))[0].token)!.draft.input.food).toBe('10');
 await page.getByRole('button',{name:'Udostępnij',exact:true}).click();await expect(page.locator('#trip-share-link')).toHaveValue(/#plan=/);await page.evaluate(()=>(window as typeof window&{failPlanWrite:boolean}).failPlanWrite=false);await page.getByRole('button',{name:planEditorCopy.pl.update,exact:true}).click();await expect(page.getByTestId('plan-edit-state')).toHaveText(planEditorCopy.pl.saved);expect(currentId(page)).toBe(id);expect(await records(page)).toHaveLength(1);expect((await records(page))[0].revision).toBe(2);
 await page.evaluate(key=>{localStorage.setItem(key,'{broken');window.dispatchEvent(new Event('focus'));},savedPlansKey);await expect(page.locator('#trip-save')).toContainText(savedTripCopy.pl.corrupt);await expect(page.getByTestId('plan-edit-state')).toHaveCount(0);await expect(page.locator('#budget-food')).toHaveValue('20');await expect(page.getByRole('button',{name:'Udostępnij',exact:true})).toBeEnabled();expect(await page.evaluate(key=>localStorage.getItem(key),savedPlansKey)).toBe('{broken');
});
