import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyEstimates,emptyProfile,projectBudget,profileErrors,readBudgetEstimates,seedProfile,invalidProfiles} from '../src/lib/budget-estimates.ts';
import {emptyBudget,calculateBudget} from '../src/lib/trip-budget.ts';
import {readBudgetDraft,readLocalBudgetDraft,changeStayDate} from '../src/lib/budget-draft.ts';
import {encodeTrip,decodeTrip,readSavedTrips} from '../src/lib/shared-trip.ts';
const input={...emptyBudget,people:'2',flight:'100.25'};
const profile={hotel_basis:'night',hotel:{min:'100',max:'150'},food:{min:'20',max:'30'},transfers:{min:'50',max:'80'}};
const estimates={...emptyEstimates(),selected:'economy',profiles:{economy:profile}};
const draft={version:1,input,start:'2030-05-01',end:'2030-05-03',context:'private',review:false,estimates};
const offer={slug:'synthetic-budget',origin:'WRO',destination:'Barcelona',start:draft.start,end:draft.end,price:'100.25',observedAt:''};
test('personal profiles start unknown and do not invent market prices or alter exact inputs',()=>{
 const blank=emptyEstimates();assert.equal(projectBudget(input,[],blank),null);
 const result=projectBudget(input,[],{...blank,selected:'standard'});assert.equal(result.modeled,0);assert.equal(result.min,20050);assert.ok(result.missing.includes('Nocleg'));
 assert.deepEqual(emptyProfile().food,{min:'',max:''});assert.equal(calculateBudget(input).total,20050);
});
test('scenario uses group nights, person days and group transfers with a single flight subtotal',()=>{
 const before=structuredClone(input),result=projectBudget(input,[],estimates);
 assert.equal(result.min,57050);assert.equal(result.max,76050);assert.equal(result.personMin,28525);assert.equal(result.personMax,38025);
 assert.equal(result.modeled,3);assert.equal(result.valid,true);assert.ok(result.missing.includes('Bagaż i dodatki do lotu'));assert.ok(!result.missing.includes('Nocleg'));
 assert.equal(result.lines.find(line=>line.key==='flight').min,20050);assert.deepEqual(input,before);
});
test('manual zero and amounts override scenarios; inactive lodging amount is never double counted',()=>{
 const zero=projectBudget({...input,hotel:'0',hotel_total:'999'},[],estimates);assert.equal(zero.overridden,1);assert.equal(zero.min,37050);assert.equal(zero.max,46050);
 const manual=projectBudget({...input,food:'7'},[],estimates);assert.equal(manual.min,49250);assert.equal(manual.max,62250);
 const stay={...estimates,profiles:{economy:{...profile,hotel_basis:'stay',hotel:{min:'900',max:'1100'}}}};
 const result=projectBudget({...input,hotel_basis:'stay',hotel:'999'},[],stay);assert.equal(result.min,127050);assert.equal(result.max,156050);
});
test('date/party changes recalculate assumptions and preserve manual values; per-person bounds enclose fractional grosz',()=>{
 const next=changeStayDate(draft,'end','2030-05-05');const result=projectBudget(next.input,[],next.estimates);
 assert.equal(result.min,85050);assert.equal(result.max,118050);assert.equal(next.input.flight,'100.25');assert.equal(next.review,true);
 const fractional=projectBudget({...input,people:'3',flight:'0',nights:'1' },[],{...estimates,profiles:{economy:{...emptyProfile('stay'),transfers:{min:'1.00',max:'1.01'}}}});
 assert.equal(fractional.personMin,33);assert.equal(fractional.personMax,34);
 const day=projectBudget({...input,people:'1',nights:'0',days:'1'},[],estimates);assert.equal(day.min,17025);assert.equal(day.max,21025);
});
test('seed copies only explicit user amounts into empty bounds and respects lodging units',()=>{
 const source={...input,hotel:'100',food:'0',transfers:'50'};
 const seeded=seedProfile(emptyProfile(),source);assert.deepEqual(seeded.hotel,{min:'100',max:'100'});assert.deepEqual(seeded.food,{min:'0',max:'0'});
 assert.deepEqual(seedProfile({...profile,hotel:{min:'80',max:''}},source).hotel,{min:'80',max:''});
 assert.deepEqual(seedProfile(emptyProfile('stay'),source).hotel,{min:'',max:''});assert.deepEqual(source.hotel,'100');
});
test('incomplete, inverted, invalid or non-PLN ranges never yield a misleading projection or share token',()=>{
 for(const [range,error] of [[{min:'1',max:''},'bounds'],[{min:'20',max:'10'},'order'],[{min:'EUR 1',max:'2'},'amount'],[{min:'-1',max:'2'},'amount']]){
  const state={...estimates,profiles:{economy:{...profile,food:range}}};assert.equal(profileErrors(state.profiles.economy).food,error);
  assert.equal(projectBudget(input,[],state).valid,false);assert.equal(encodeTrip({version:1,offer,draft:{...draft,estimates:state}}),null);
 }
 const inactive={...estimates,selected:null,profiles:{standard:{...profile,food:{min:'2',max:'1'}}}};assert.deepEqual(invalidProfiles(inactive),['standard']);
 assert.equal(readBudgetEstimates({...estimates,currency:'EUR'}),null);
 assert.equal(projectBudget({...input,people:'bad'},[],estimates).valid,false);
});
test('v1 restores profiles and source annotations without leaking arbitrary extras; legacy exact budgets are unchanged',()=>{
 const raw={...estimates,notes:'private@example.com',profiles:{economy:{...profile,source:'https://private.example',hotel:{...profile.hotel,email:'private@example.com'}}}};
 const token=encodeTrip({version:1,offer,draft:{...draft,estimates:raw}});assert.ok(token);
 const restored=decodeTrip(token);assert.deepEqual(restored.draft.estimates,estimates);assert.equal(JSON.stringify(restored).includes('private'),false);
 assert.equal(projectBudget(restored.draft.input,restored.draft.events,restored.draft.estimates).min,57050);assert.deepEqual(readSavedTrips(JSON.stringify([token])),[token]);
 const legacy={...draft};delete legacy.estimates;assert.deepEqual(readBudgetDraft(JSON.stringify(legacy)),legacy);assert.ok(decodeTrip(encodeTrip({version:1,offer,draft:legacy})));
});
test('local typos survive reload; malformed models preserve exact budget with explicit recovery and cannot be silently shared',()=>{
 const partial={...draft,estimates:{...estimates,profiles:{economy:{...profile,food:{min:'12,',max:'oops'}}}}};
 const restored=readLocalBudgetDraft(JSON.stringify(partial));assert.equal(restored.draft.estimates.profiles.economy.food.max,'oops');
 const broken={...draft,estimates:{version:'future'}};const local=readLocalBudgetDraft(JSON.stringify(broken));assert.deepEqual(local.draft.input,input);assert.equal(local.draft.estimatesRecovery,true);
 assert.equal(readBudgetDraft(JSON.stringify(broken)),null);assert.equal(encodeTrip({version:1,offer,draft:local.draft}),null);
});
test('partially priced events remain partial and their known amounts are added only once',()=>{
 const events=[{id:'known',quantity:'2',unitPricePln:'10'},{id:'unknown',quantity:'1',unitPricePln:''}];
 const result=projectBudget(input,events,estimates);assert.equal(result.min,59050);assert.equal(result.max,78050);assert.ok(result.missing.includes('Wydarzenia w planie'));
 assert.equal(result.lines.find(line=>line.key==='events').unknown,true);
});
