import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isEventResults} from '../src/lib/api-contract.ts';
import {eventFitFilterCopy} from '../src/lib/i18n/event-fit-filter-copy.ts';
import {eventFitCopy} from '../src/lib/i18n/event-fit-copy.ts';
const item={id:'event',name:'Synthetic',category:'MUSIC',venue:'Venue',city:'London',start_date:'2030-11-01',end_date:null,local_time:null,timezone:'Europe/London',status:'offsale',url:'https://example.com',price_from:null,currency:null};
test('legacy all responses remain readable; possible requires a supported mode and an assessment for every card',()=>{
 const legacy={status:'READY',events:[item]};assert.equal(isEventResults(legacy),true);
 assert.equal(isEventResults({...legacy,fit_mode:'all'}),true);
 for(const status of ['TIGHT','CHECK','NO_KNOWN_CONFLICT'])assert.equal(isEventResults({...legacy,fit_mode:'possible',flight_fit:{event:{status,reasons:[]}}}),true);
 assert.equal(isEventResults({...legacy,fit_mode:'possible'}),false);
 assert.equal(isEventResults({...legacy,fit_mode:'possible',flight_fit:{other:{status:'CHECK',reasons:[]}}}),false);
 assert.equal(isEventResults({...legacy,fit_mode:'possible',flight_fit:{event:{status:'CONFLICT',reasons:['AFTER_RETURN']}}}),false);
});
test('an unknown filter mode is rejected and filtered empty results retain scope and partial coverage',()=>{
 assert.equal(isEventResults({status:'READY',events:[item],fit_mode:'fits'}),false);
 assert.equal(isEventResults({status:'EMPTY',events:[],fit_mode:'possible',partial:true,total:13,page:3,page_size:12,has_more:false}),true);
});
test('all four locales explain uncertainty and provide explicit recovery instead of promising attendance',()=>{
 assert.deepEqual(Object.keys(eventFitFilterCopy).sort(),['en','pl','ru','uk']);
 for(const [locale,copy]of Object.entries(eventFitFilterCopy)){
  for(const value of Object.values(copy))assert.ok(value.trim().length);
  assert.notEqual(copy.all,copy.possible);assert.ok(eventFitCopy[locale].status.NO_KNOWN_CONFLICT.trim());
 }
 assert.match(eventFitFilterCopy.en.hint,/missing information remain visible/);
 assert.match(eventFitCopy.en.status.NO_KNOWN_CONFLICT,/May fit/);
});
