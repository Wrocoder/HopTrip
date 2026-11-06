import {decodeTrip,readSavedTripsState,savedTripsKey} from './shared-trip.ts';

export const savedPlansKey='hoptrip.saved-plans.v2';
export const savedPlansLock='hoptrip:saved-plans.v2';
export const savedPlansMaxChars=700000;
export type SavedPlan={id:string;revision:number;token:string};
export type PlanCollection={version:2;revision:number;plans:SavedPlan[];legacyBackup:string|null;legacySource:string|null};
export const isPlanId=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
const revision=(value:unknown):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>0;
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const keys=(value:Record<string,unknown>,allowed:string[])=>Object.keys(value).every(key=>allowed.includes(key));
const sourceValid=(value:unknown):value is string|null=>value===null||typeof value==='string'&&value.length<=140000&&!readSavedTripsState(value).corrupt;
export function readSavedPlan(value:unknown):SavedPlan|null{
 if(!object(value)||!keys(value,['id','revision','token'])||!isPlanId(value.id)||!revision(value.revision)||!decodeTrip(value.token))return null;
 return {id:value.id,revision:value.revision,token:value.token as string};
}
export function readPlanCollection(raw:string|null,legacyRaw:string|null){
 const legacy=readSavedTripsState(legacyRaw);
 const base={plans:[] as SavedPlan[],legacyTokens:legacy.tokens,legacyRaw,legacyChanged:false,legacyCorrupt:legacy.corrupt,revision:0,collection:null as PlanCollection|null,corrupt:false};
 if(raw===null)return {...base,format:legacy.tokens.length?'legacy' as const:'empty' as const,corrupt:legacy.corrupt};
 if(raw.length>savedPlansMaxChars)return {...base,format:'invalid' as const,corrupt:true};
 try{
  const value:unknown=JSON.parse(raw);
  if(!object(value)||value.version!==2||!Array.isArray(value.plans))return {...base,format:'invalid' as const,corrupt:true};
  const plans:SavedPlan[]=[];
  let corrupt=!keys(value,['version','revision','plans','legacyBackup','legacySource'])||!revision(value.revision)||value.plans.length>20||!sourceValid(value.legacyBackup)||!sourceValid(value.legacySource);
  for(const item of value.plans.slice(0,20)){
   const plan=readSavedPlan(item);if(!plan||plans.some(saved=>saved.id===plan.id)){corrupt=true;continue;}plans.push(plan);
  }
  const collection:PlanCollection|null=corrupt?null:{version:2,revision:value.revision as number,plans,legacyBackup:value.legacyBackup as string|null,legacySource:value.legacySource as string|null};
  return {...base,format:'v2' as const,plans,revision:revision(value.revision)?value.revision:0,corrupt,collection,legacyChanged:value.legacySource!==legacyRaw};
 }catch{return {...base,format:'invalid' as const,corrupt:true};}
}
export type PlanOperation=
 |{type:'migrate';expectedLegacyRaw:string|null}
 |{type:'import';expectedLegacyRaw:string|null}
 |{type:'save';token:string}
 |{type:'duplicate';token:string}
 |{type:'update';id:string;expectedRevision:number;token:string}
 |{type:'remove';id:string;expectedRevision:number}
 |{type:'restore';plan:SavedPlan};
export type PlanStatus='saved'|'already'|'updated'|'removed'|'restored'|'migrated'|'imported'|'migration'|'full'|'corrupt'|'conflict'|'absent'|'invalid'|'unsupported'|'error'|'busy';
export type PlanResult={status:PlanStatus;next?:PlanCollection;plan?:SavedPlan};

// Pure transition: storage is read again under the browser lock by the driver.
// Never writes the v1 key; old tabs cannot overwrite the v2 collection.
export function changePlanCollection(raw:string|null,legacyRaw:string|null,operation:PlanOperation,makeId:()=>string):PlanResult{
 const state=readPlanCollection(raw,legacyRaw);
 if(state.corrupt)return {status:'corrupt'};
 const create=(token:string):SavedPlan|null=>{const id=makeId();return isPlanId(id)?{id,revision:1,token}:null;};
 if(operation.type==='migrate'){
  if(state.collection)return {status:'already'};
  if(legacyRaw!==operation.expectedLegacyRaw)return {status:'conflict'};
  const plans:SavedPlan[]=[];
  for(const token of state.legacyTokens){const plan=create(token);if(!plan||plans.some(saved=>saved.id===plan.id))return {status:'invalid'};plans.push(plan);}
  return {status:'migrated',next:{version:2,revision:1,plans,legacyBackup:legacyRaw,legacySource:legacyRaw}};
 }
 if(!state.collection&&state.format==='legacy')return {status:'migration'};
 const store=state.collection??{version:2 as const,revision:0,plans:[],legacyBackup:legacyRaw,legacySource:legacyRaw};
 if(store.revision>=Number.MAX_SAFE_INTEGER)return {status:'invalid'};
 const finish=(status:PlanStatus,plans:SavedPlan[],plan?:SavedPlan,legacySource=store.legacySource):PlanResult=>({status,next:{...store,revision:store.revision+1,plans,legacySource},...(plan?{plan}:{})});
 if(operation.type==='import'){
  if(operation.expectedLegacyRaw!==legacyRaw)return {status:'conflict'};
  if(state.legacyCorrupt)return {status:'corrupt'};
  if(store.legacySource===legacyRaw)return {status:'already'};
  const previous=new Set(readSavedTripsState(store.legacySource).tokens),added:SavedPlan[]=[];
  for(const token of state.legacyTokens){
   // Only additions in the legacy source are imported. An unchanged old token
   // must not resurrect a v2 plan that the user has deleted or updated.
   if(previous.has(token)||store.plans.some(plan=>plan.token===token))continue;
   if(store.plans.length+added.length>=20)return {status:'full'};
   const plan=create(token);if(!plan||[...store.plans,...added].some(saved=>saved.id===plan.id))return {status:'invalid'};added.push(plan);
  }
  return finish('imported',[...added,...store.plans],undefined,legacyRaw);
 }
 if(operation.type==='save'||operation.type==='duplicate'){
  if(!decodeTrip(operation.token))return {status:'invalid'};
  const existing=store.plans.find(plan=>plan.token===operation.token);
  if(existing&&operation.type==='save')return {status:'already',plan:existing};
  if(store.plans.length>=20)return {status:'full'};
  const plan=create(operation.token);if(!plan||store.plans.some(saved=>saved.id===plan.id))return {status:'invalid'};
  return finish('saved',[plan,...store.plans],plan);
 }
 if(operation.type==='restore'){
  const saved=readSavedPlan(operation.plan);if(!saved||saved.revision>=Number.MAX_SAFE_INTEGER)return {status:'invalid'};
  if(store.plans.some(plan=>plan.id===saved.id))return {status:'conflict'};
  if(store.plans.length>=20)return {status:'full'};
  const plan={...saved,revision:saved.revision+1};return finish('restored',[plan,...store.plans],plan);
 }
 const index=store.plans.findIndex(plan=>plan.id===operation.id),plan=store.plans[index];
 if(!plan)return {status:'absent'};
 if(plan.revision!==operation.expectedRevision)return {status:'conflict'};
 if(operation.type==='remove')return finish('removed',store.plans.filter(saved=>saved.id!==plan.id),plan);
 if(!decodeTrip(operation.token)||plan.revision>=Number.MAX_SAFE_INTEGER)return {status:'invalid'};
 if(plan.token===operation.token)return {status:'already',plan};
 const updated={...plan,revision:plan.revision+1,token:operation.token};
 return finish('updated',store.plans.map(saved=>saved.id===plan.id?updated:saved),updated);
}
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
type LocksPort={request<T>(name:string,callback:()=>T|Promise<T>):Promise<T>};
export async function commitPlanOperation(storage:StoragePort,locks:LocksPort|null|undefined,operation:PlanOperation,makeId:()=>string):Promise<PlanResult>{
 if(!locks)return {status:'unsupported'};
 try{return await locks.request(savedPlansLock,()=>{
  const result=changePlanCollection(storage.getItem(savedPlansKey),storage.getItem(savedTripsKey),operation,makeId);
  if(result.next){const raw=JSON.stringify(result.next);if(raw.length>savedPlansMaxChars)return {status:'invalid' as const};storage.setItem(savedPlansKey,raw);}
  return result;
 });}catch{return {status:'error'};}
}
