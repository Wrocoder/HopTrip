import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validCalendarDate,calendarNights,formatCalendarDate} from '../src/lib/calendar-date.ts';
import {budgetDateCounts,changeStayDate} from '../src/lib/budget-draft.ts';
import {validEventDates,eventSearchDays} from '../src/lib/event-dates.ts';
import {stay22Link} from '../src/lib/accommodation-links.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';

test('invalid calendar dates never reach formatting, counts, event requests or stay links',()=>{
 for(const invalid of ['10000-01-01','0000-01-01','','2028-02','2027-02-29','2028-02-30','2028-13-01']){
  assert.equal(validCalendarDate(invalid),false,invalid);
  assert.equal(formatCalendarDate(invalid,'en-GB'),null,invalid);
  for(const [start,end] of [[invalid,'2028-03-01'],['2028-02-28',invalid]]){
   assert.equal(calendarNights(start,end),null);
   assert.equal(budgetDateCounts(start,end),null);
   assert.equal(validEventDates(start,end),false);
   assert.deepEqual(eventSearchDays(start,end),[]);
   assert.equal(stay22Link({city:'London',checkin:start,checkout:end,adults:'2'}),null);
  }
 }
});

test('calendar validity is independent of duration limits and supports leap days',()=>{
 for(const date of ['0001-01-01','0099-12-31','2028-02-29','9999-12-31'])assert.equal(validCalendarDate(date),true,date);
 assert.equal(calendarNights('2028-03-01','2028-02-29'),null);
 assert.deepEqual(budgetDateCounts('2028-02-28','2028-03-01'),{nights:'2',days:'3'});
 assert.deepEqual(eventSearchDays('2028-02-28','2028-03-01'),['2028-02-28','2028-02-29','2028-03-01']);
 assert.equal(calendarNights('2028-01-01','2029-01-01'),366);
 assert.equal(budgetDateCounts('2028-01-01','2029-01-01'),null);
 assert.equal(validEventDates('2028-01-01','2028-02-01'),false);
 assert.ok(stay22Link({city:'London',checkin:'2028-01-01',checkout:'2029-01-01',adults:'2'}));
});

test('correcting an invalid edited date restores counts and preserves expenses',()=>{
 const draft={version:1,input:{...emptyBudget,hotel:'321',people:'2'},start:'2028-02-28',end:'2028-03-01',context:'',review:false};
 const invalid=changeStayDate(draft,'start','10000-01-01');
 assert.equal(invalid.input.hotel,'321');assert.equal(invalid.input.nights,'');
 const corrected=changeStayDate(invalid,'start','2028-02-29');
 assert.equal(corrected.input.hotel,'321');assert.equal(corrected.input.people,'2');
 assert.equal(corrected.input.nights,'1');assert.equal(corrected.input.days,'2');
});
