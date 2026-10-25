import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addPlannedEvent,cleanPlannedEvent,readPlannedEvents,maxPlannedEvents} from '../src/lib/planned-events.ts';
import {calculateBudget,emptyBudget,plannedEventCost} from '../src/lib/trip-budget.ts';
import {readBudgetDraft,changeStayDate} from '../src/lib/budget-draft.ts';
import {encodeTrip,decodeTrip,readSavedTrips} from '../src/lib/shared-trip.ts';
const ticket=(id='duke')=>`https://ticketmaster.evyy.net/c/7853869/1958975/23899?u=${encodeURIComponent('https://www.ticketmaster.co.uk/event/'+id)}&partnerpropertyid=9029029`;
const event={id:'duke',name:'Duke Dumont — Żywy koncert',venue:'OVO Arena Wembley',date:'2027-01-16',time:'18:00:00',timezone:'Europe/London',url:ticket(),quantity:'2',unitPricePln:'120,29'};
const draft={version:1,input:{...emptyBudget,flight:'100',people:'3'},start:'2027-01-15',end:'2027-01-17',context:'private-context',review:false,events:[event]};
const trip={version:1,offer:{slug:'example',origin:'Wrocław',destination:'Londyn',start:draft.start,end:draft.end,price:'100',observedAt:''},draft};

test('tickets use integer grosz and their own quantity, once, independent of people and nights',()=>{
 for(const people of ['1','3','5']){
  const result=calculateBudget({...emptyBudget,people,nights:'7',activities:'10'},[event,event]);
  assert.equal(result.lines.find(line=>line.key==='events').total,24058);
  assert.equal(result.total,24058+Number(people)*1000);
 }
});
test('known ticket costs contribute while unknown prices keep the budget incomplete; zero stays known',()=>{
 const unknown={...event,id:'unknown',unitPricePln:''};
 const result=calculateBudget(emptyBudget,[event,unknown]);
 assert.equal(result.total,24058);assert.ok(result.missing.includes('Wydarzenia w planie'));
 assert.equal(result.lines.find(line=>line.key==='events').incomplete,true);
 assert.equal(calculateBudget(emptyBudget,[unknown]).lines.find(line=>line.key==='events').total,null);
 assert.equal(plannedEventCost({...unknown,unitPricePln:'0'}).total,0);
 assert.equal(calculateBudget(emptyBudget,[{...unknown,unitPricePln:'0'}]).missing.includes('Wydarzenia w planie'),false);
});
test('invalid event quantities and money never produce a plausible total or shared link',()=>{
 for(const quantity of ['','0','-1','1.5','51','1e1']){
  const events=[{...event,quantity}];assert.equal(calculateBudget(emptyBudget,events).total,null);
  assert.equal(encodeTrip({...trip,draft:{...draft,events}}),null);
 }
 for(const unitPricePln of ['-1','Infinity','1e3','12,345','10000000']){
  assert.equal(calculateBudget(emptyBudget,[{...event,unitPricePln}]).valid,false);
 }
});
test('adding the same offer preserves manual costs; premium and separate sessions keep distinct IDs',()=>{
 const again={...event,unitPricePln:'',quantity:'1'};
 assert.deepEqual(addPlannedEvent([event],again),[event]);
 const premium={...event,id:'premium',name:'Duke Dumont - Venue Premium Tickets',url:ticket('premium')};
 assert.equal(addPlannedEvent([event],premium).length,2);
 assert.equal(addPlannedEvent([event],{...event,id:'late',time:'21:30:00'}).length,2);
 assert.deepEqual(readPlannedEvents([event,again]),[event]);
});
test('local draft, date changes and shared snapshot preserve event facts and costs without private extras',()=>{
 const withExtras={...draft,events:[{...event,note:'private',email:'private@example.com'}]};
 const restored=readBudgetDraft(JSON.stringify(withExtras));assert.deepEqual(restored.events,[event]);
 const next=changeStayDate(restored,'end','2027-01-18');assert.deepEqual(next.events,[event]);
 const decoded=decodeTrip(encodeTrip({...trip,draft:withExtras}));assert.deepEqual(decoded.draft.events,[event]);
 assert.equal(decoded.draft.context,'');assert.equal(decoded.draft.review,true);
 decoded.draft.events[0].quantity='5';assert.equal(decodeTrip(encodeTrip(trip)).draft.events[0].quantity,'2');
});
test('legacy v1 links without events still restore identical budgets and saved-list entries',()=>{
 const snapshot={...trip,draft:{...draft,events:undefined}};
 // An actual old-format token, constructed independently of the current encoder.
 const token=Buffer.from(JSON.stringify(snapshot),'utf8').toString('base64url');
 const restored=decodeTrip(token);assert.equal(restored.draft.events,undefined);
 assert.equal(calculateBudget(restored.draft.input,restored.draft.events).total,30000);
 assert.deepEqual(readSavedTrips(JSON.stringify([token])),[token]);
});
test('shared links cannot introduce scripts, credentialed URLs or arbitrary redirect targets',()=>{
 for(const url of ['javascript:alert(1)','https://evil.example/event','https://ticketmaster.evyy.net.evil.example/c/1/2/3',
  'https://name:pass@ticketmaster.evyy.net/c/1/2/3?u=https%3A%2F%2Fwww.ticketmaster.co.uk%2Fevent%2Fa',
  ticket()+'&apikey=secret',ticket().replace(encodeURIComponent('https://www.ticketmaster.co.uk/event/duke'),encodeURIComponent('https://evil.example/event/a')),
  ticket().replace(encodeURIComponent('https://www.ticketmaster.co.uk/event/duke'),encodeURIComponent('https://www.ticketmaster.co.uk/event/a?redirect=https://evil.example'))]){
  assert.equal(cleanPlannedEvent({...event,url}),null,url);
  assert.equal(encodeTrip({...trip,draft:{...draft,events:[{...event,url}]}}),null);
 }
});
test('invalid event dates, clocks, zones, oversized arrays and corrupted event structures are rejected',()=>{
 for(const change of [{date:'2027-02-30'},{date:'invalid'},{time:'24:30'},{timezone:'Unknown/Zone'},{name:''},{quantity:2},{unitPricePln:120}])
  assert.equal(cleanPlannedEvent({...event,...change}),null);
 assert.equal(readPlannedEvents({}),null);
 assert.equal(readBudgetDraft(JSON.stringify({...draft,events:null})),null);
 const full=Array.from({length:maxPlannedEvents},(_,i)=>({...event,id:String(i)}));
 assert.equal(addPlannedEvent(full,event),full);assert.equal(readPlannedEvents([...full,event]),null);
});
test('unknown clocks and explicit zero survive sharing without inferred prices or dates',()=>{
 const events=[{...event,time:null,unitPricePln:'0'},{...event,id:'unknown',unitPricePln:''}];
 assert.deepEqual(decodeTrip(encodeTrip({...trip,draft:{...draft,events}})).draft.events,events);
});
test('oversized share fails explicitly without dropping events from a valid local draft',()=>{
 const events=Array.from({length:8},(_,i)=>({...event,id:String(i),url:ticket(String(i))+'&subId1='+('x'.repeat(1000))}));
 const restored=readBudgetDraft(JSON.stringify({...draft,events}));assert.equal(restored.events.length,8);
 assert.equal(encodeTrip({...trip,draft:restored}),null);
});
