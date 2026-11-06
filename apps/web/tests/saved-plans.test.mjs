import test from 'node:test';
import assert from 'node:assert/strict';
import {changePlanCollection,commitPlanOperation,readPlanCollection,savedPlansKey,savedPlansLock} from '../src/lib/saved-plans.ts';
import {savedTripsKey,encodeTrip,decodeTrip} from '../src/lib/shared-trip.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
const token=(slug='synthetic',food='0')=>encodeTrip({version:1,offer:{slug,origin:'WRO',destination:'Barcelona',start:'2030-05-01',end:'2030-05-03',price:'100',observedAt:''},draft:{version:1,input:{...emptyBudget,food,flight:'100'},start:'2030-05-01',end:'2030-05-03',context:'',review:true}});
const id=value=>'00000000-0000-4000-8000-'+String(value).padStart(12,'0');
const ids=()=>{let i=0;return()=>id(++i);};
const json=JSON.stringify;
const changed=(store,legacy,operation,makeId=ids())=>changePlanCollection(store===null?null:json(store),legacy,operation,makeId);
test('legacy plans remain readable but require explicit migration; corrupt and unknown versions never silently become empty writable lists',()=>{
 const legacy=json([token()]),state=readPlanCollection(null,legacy);assert.equal(state.format,'legacy');assert.deepEqual(state.legacyTokens,[token()]);
 assert.equal(changed(null,legacy,{type:'save',token:token('new')}).status,'migration');
 for(const raw of ['{broken','null','{}','{"version":3,"plans":[]}']){
  assert.equal(readPlanCollection(raw,legacy).corrupt,true);assert.equal(changePlanCollection(raw,legacy,{type:'migrate',expectedLegacyRaw:legacy},ids()).status,'corrupt');
 }
 assert.equal(readPlanCollection(null,'["bad"]').corrupt,true);assert.equal(readPlanCollection(null,null).format,'empty');
});
test('migration is explicit, checks the latest legacy source, preserves exact tokens and keeps a byte-exact backup',()=>{
 const a=token(),b=token('b'),legacy='[\n "'+a+'",\n "'+b+'", "'+a+'"\n]';
 assert.equal(changed(null,legacy,{type:'migrate',expectedLegacyRaw:'[]'}).status,'conflict');
 const result=changed(null,legacy,{type:'migrate',expectedLegacyRaw:legacy});assert.equal(result.status,'migrated');assert.equal(result.next.legacyBackup,legacy);assert.equal(result.next.legacySource,legacy);
 assert.deepEqual(result.next.plans.map(plan=>plan.token),[a,b]);assert.equal(new Set(result.next.plans.map(plan=>plan.id)).size,2);
 assert.equal(changed(result.next,legacy,{type:'migrate',expectedLegacyRaw:legacy}).status,'already');assert.equal(readPlanCollection(json(result.next),legacy).legacyChanged,false);
});
test('save and explicit update retain a permanent ID while replacing the budget and advancing the revision',()=>{
 const first=changed(null,null,{type:'save',token:token()});assert.equal(first.plan.id,id(1));assert.equal(first.plan.revision,1);
 const updated=changed(first.next,null,{type:'update',id:id(1),expectedRevision:1,token:token('synthetic','37.42')});
 assert.equal(updated.status,'updated');assert.equal(updated.plan.id,first.plan.id);assert.equal(updated.plan.revision,2);assert.equal(updated.next.plans.length,1);assert.equal(decodeTrip(updated.plan.token).draft.input.food,'37.42');
 assert.equal(changed(updated.next,null,{type:'save',token:updated.plan.token}).status,'already');
 assert.equal(changed(updated.next,null,{type:'update',id:id(1),expectedRevision:2,token:updated.plan.token}).status,'already');
});
test('duplicate has a distinct identity even with identical contents; update/delete/undo operate by ID and prevent stale revisions',()=>{
 const makeId=ids(),a=changed(null,null,{type:'save',token:token()},makeId),b=changed(a.next,null,{type:'duplicate',token:token()},makeId);
 assert.equal(b.next.plans.length,2);assert.notEqual(a.plan.id,b.plan.id);assert.equal(a.plan.token,b.plan.token);
 const update=changed(b.next,null,{type:'update',id:a.plan.id,expectedRevision:1,token:token('synthetic','10')});assert.equal(update.next.plans.find(plan=>plan.id===b.plan.id).token,token());
 for(const type of ['remove','update'])assert.equal(changed(update.next,null,{type,id:a.plan.id,expectedRevision:1,token:token()}).status,'conflict');
 const remove=changed(update.next,null,{type:'remove',id:a.plan.id,expectedRevision:2});assert.deepEqual(remove.next.plans.map(plan=>plan.id),[b.plan.id]);
 const undo=changed(remove.next,null,{type:'restore',plan:remove.plan});assert.equal(undo.plan.id,a.plan.id);assert.equal(undo.plan.revision,3);
 assert.equal(changed(undo.next,null,{type:'restore',plan:remove.plan}).status,'conflict');assert.equal(changed(undo.next,null,{type:'update',id:a.plan.id,expectedRevision:2,token:token()}).status,'conflict');
 assert.equal(changed(remove.next,null,{type:'update',id:a.plan.id,expectedRevision:2,token:token()}).status,'absent');
});
test('capacity never evicts a plan; an update of an existing identity is allowed in a full collection',()=>{
 const legacy=json(Array.from({length:20},(_,i)=>token('legacy-'+i))),store=changed(null,legacy,{type:'migrate',expectedLegacyRaw:legacy}).next;
 for(const type of ['save','duplicate'])assert.equal(changed(store,legacy,{type,token:token('extra')}).status,'full');
 assert.equal(changed(store,legacy,{type:'restore',plan:{id:id(99),revision:1,token:token('extra')}}).status,'full');
 const update=changed(store,legacy,{type:'update',id:store.plans[0].id,expectedRevision:1,token:token('updated')});assert.equal(update.status,'updated');assert.equal(update.next.plans.length,20);
});
test('invalid IDs, duplicate IDs, invalid backups, unknown fields and malformed records block writes while valid records can still be shown',()=>{
 const store=changed(null,null,{type:'save',token:token()}).next;
 for(const bad of [{...store,revision:0},{...store,legacyBackup:'{bad'},{...store,private:'extra'},{...store,plans:[...store.plans,...store.plans]},{...store,plans:[{...store.plans[0],id:'unsafe'},...store.plans]},{...store,plans:[{...store.plans[0],token:'bad'},...store.plans]}]){
  const read=readPlanCollection(json(bad),null);assert.equal(read.corrupt,true);assert.ok(read.plans.some(plan=>plan.token===token()));assert.equal(changed(bad,null,{type:'save',token:token('extra')}).status,'corrupt');
 }
 assert.equal(changed(null,null,{type:'save',token:token()},()=> 'bad').status,'invalid');
 assert.equal(changed(store,null,{type:'duplicate',token:token()},()=>id(1)).status,'invalid');
 assert.equal(changed({...store,revision:Number.MAX_SAFE_INTEGER},null,{type:'save',token:token('extra')}).status,'invalid');
});
test('legacy writes cannot replace v2 plans; explicit import adds only new source snapshots and cannot resurrect unchanged deleted or updated plans',()=>{
 const old=json([token('a'),token('b')]),makeId=ids();let store=changed(null,old,{type:'migrate',expectedLegacyRaw:old},makeId).next;
 store=changed(store,old,{type:'remove',id:store.plans[0].id,expectedRevision:1}).next;
 store=changed(store,old,{type:'update',id:store.plans[0].id,expectedRevision:1,token:token('b','20')}).next;
 const newer=json([token('a'),token('b'),token('c')]);assert.equal(readPlanCollection(json(store),newer).legacyChanged,true);
 assert.equal(changed(store,newer,{type:'import',expectedLegacyRaw:old}).status,'conflict');
 const imported=changed(store,newer,{type:'import',expectedLegacyRaw:newer},makeId);assert.equal(imported.status,'imported');assert.deepEqual(new Set(imported.next.plans.map(plan=>plan.token)),new Set([token('c'),token('b','20')]));
 assert.equal(imported.next.legacyBackup,old);assert.equal(imported.next.legacySource,newer);assert.equal(readPlanCollection(json(imported.next),newer).legacyChanged,false);
 assert.equal(changed(imported.next,newer,{type:'import',expectedLegacyRaw:newer}).status,'already');
});
test('failed or full legacy import leaves the entire active collection intact; a damaged old source does not erase valid v2 data',()=>{
 const old=json(Array.from({length:20},(_,i)=>token('p'+i))),store=changed(null,old,{type:'migrate',expectedLegacyRaw:old}).next,newer=json([token('added')]);
 const result=changed(store,newer,{type:'import',expectedLegacyRaw:newer});assert.equal(result.status,'full');assert.equal(result.next,undefined);
 const damaged=readPlanCollection(json(store),'{bad');assert.equal(damaged.corrupt,false);assert.equal(damaged.legacyCorrupt,true);assert.equal(damaged.plans.length,20);
 assert.equal(changed(store,'{bad',{type:'import',expectedLegacyRaw:'{bad'}).status,'corrupt');
 assert.equal(changed(store,'{bad',{type:'remove',id:store.plans[0].id,expectedRevision:1}).status,'removed');
});
test('import preserves the order of multiple source additions and retains the original order of existing plans',()=>{
 const raw=json([token('original-a'),token('original-b')]),makeId=ids(),store=changed(null,raw,{type:'migrate',expectedLegacyRaw:raw},makeId).next;
 const newer=json([token('new-first'),token('new-second'),token('original-a'),token('original-b')]);
 const imported=changed(store,newer,{type:'import',expectedLegacyRaw:newer},makeId);
 assert.deepEqual(imported.next.plans.map(plan=>plan.token),[token('new-first'),token('new-second'),token('original-a'),token('original-b')]);assert.deepEqual(imported.next.plans.slice(2),store.plans);
});
function memory(){const values=new Map(),writes=[];return {values,writes,getItem:key=>values.get(key)??null,setItem:(key,value)=>{writes.push(key);values.set(key,value);}};}
function serialLocks(){let tail=Promise.resolve();return {request(name,callback){assert.equal(name,savedPlansLock);const next=tail.then(callback);tail=next.catch(()=>{});return next;}};}
test('exclusive driver serializes concurrent saves and stale updates without losing unrelated plans or writing the legacy key',async()=>{
 const storage=memory(),locks=serialLocks(),makeId=ids();storage.values.set(savedTripsKey,'[]');
 const saved=await Promise.all(['a','b','c'].map(slug=>commitPlanOperation(storage,locks,{type:'save',token:token(slug)},makeId)));assert.ok(saved.every(result=>result.status==='saved'));
 const a=saved[0].plan,updates=await Promise.all(['10','20'].map(food=>commitPlanOperation(storage,locks,{type:'update',id:a.id,expectedRevision:1,token:token('a',food)},makeId)));
 assert.deepEqual(updates.map(result=>result.status),['updated','conflict']);const store=readPlanCollection(storage.getItem(savedPlansKey),'[]');assert.equal(store.plans.length,3);assert.equal(store.plans.find(plan=>plan.id===a.id).revision,2);
 assert.deepEqual(new Set(storage.writes),new Set([savedPlansKey]));assert.equal(storage.getItem(savedTripsKey),'[]');
});
test('driver rejects absent locks and storage/lock failures without pretending a write succeeded',async()=>{
 const storage=memory(),operation={type:'save',token:token()};assert.equal((await commitPlanOperation(storage,null,operation,ids())).status,'unsupported');assert.equal(storage.writes.length,0);
 assert.equal((await commitPlanOperation(storage,{request:async()=>{throw Error('denied');}},operation,ids())).status,'error');
 const failing={getItem:()=>null,setItem:()=>{throw Error('quota');}};assert.equal((await commitPlanOperation(failing,serialLocks(),operation,ids())).status,'error');
 assert.equal((await commitPlanOperation({getItem:()=>{throw Error('blocked');},setItem:()=>assert.fail()},serialLocks(),operation,ids())).status,'error');
});
