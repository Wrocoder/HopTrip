import {test} from 'node:test';
import assert from 'node:assert/strict';
import {eventSearchDays,validEventDates} from '../src/lib/event-dates.ts';
import {changeStayDate} from '../src/lib/budget-draft.ts';
import {emptyBudget} from '../src/lib/trip-budget.ts';
import {eventUx} from '../src/lib/i18n/event-copy.ts';

test('calendar windows preserve the edited stay and allow up to 31 inclusive days',()=>{
 const draft={version:1,input:{...emptyBudget},start:'2026-10-27',end:'2026-10-29',context:'',review:false};
 const changed=changeStayDate(draft,'end','2026-10-30');
 assert.equal(changed.end,'2026-10-30');
 assert.equal(changed.input.nights,'3');assert.equal(changed.input.days,'4');
 assert.equal(validEventDates(changed.start,changed.end),true);
 assert.equal(validEventDates('2026-10-01','2026-10-31'),true);
 assert.equal(validEventDates('2026-10-01','2026-11-01'),false);
 assert.equal(validEventDates('2026-03-28','2026-03-30'),true);
 assert.equal(validEventDates('2026-10-24','2026-10-26'),true);
 for(const [start,end] of [['','2026-10-30'],['2026-10-30',''],['2026-10-30','2026-10-29'],['2026-02-30','2026-03-01']])assert.equal(validEventDates(start,end),false);
 assert.equal(changed.end,'2026-10-30');
});

test('date modes have complete labels in every supported language',()=>{
 for(const copy of Object.values(eventUx))for(const key of ['tripDates','otherDates','useTripDates','sharedHint','otherHint','noDates','restoring'])assert.ok(copy[key].trim());
});

test('day navigation includes both ends and stays on calendar dates across clock changes',()=>{
 assert.deepEqual(eventSearchDays('2026-10-24','2026-10-26'),['2026-10-24','2026-10-25','2026-10-26']);
 assert.deepEqual(eventSearchDays('2026-03-28','2026-03-30'),['2026-03-28','2026-03-29','2026-03-30']);
 assert.deepEqual(eventSearchDays('2026-12-31','2027-01-01'),['2026-12-31','2027-01-01']);
 assert.equal(eventSearchDays('2026-10-01','2026-10-31').length,31);
 assert.deepEqual(eventSearchDays('2026-10-27','2026-10-27'),['2026-10-27']);
 assert.deepEqual(eventSearchDays('2026-02-30','2026-03-01'),[]);
 assert.deepEqual(eventSearchDays('2026-10-01','2026-11-01'),[]);
});
