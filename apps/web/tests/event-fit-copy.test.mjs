import {test} from 'node:test';
import assert from 'node:assert/strict';
import {eventFitReasons,primaryFitReason} from '../src/lib/event-flight-fit.ts';
import {eventFitCopy} from '../src/lib/i18n/event-fit-copy.ts';

test('flight compatibility warnings and unknowns are translated in every language',()=>{
 for(const copy of Object.values(eventFitCopy)){
  for(const reason of eventFitReasons)assert.ok(copy.reasons[reason].trim());
  for(const status of ['CONFLICT','TIGHT','CHECK','NO_KNOWN_CONFLICT'])assert.ok(copy.status[status].trim());
  for(const key of ['notChecked','durationUnknown','policy','afterArrival','beforeReturn'])assert.ok(copy[key].trim());
 }
 assert.match(eventFitCopy.pl.policy,/180 min/);
 assert.match(eventFitCopy.pl.durationUnknown,/nieznany/);
});

test('the compact warning prioritises conflicts over missing data and tight intervals',()=>{
 assert.equal(primaryFitReason({reasons:['UNKNOWN_DURATION','UNKNOWN_ARRIVAL','ARRIVAL_BUFFER','AFTER_RETURN']}),'AFTER_RETURN');
 assert.equal(primaryFitReason({reasons:['UNKNOWN_EVENT_TIME','RETURN_BUFFER']}),'RETURN_BUFFER');
 assert.equal(primaryFitReason({reasons:['UNKNOWN_DURATION','INVALID_EVENT_TIME']}),'INVALID_EVENT_TIME');
 assert.equal(primaryFitReason({reasons:['UNKNOWN_DURATION']}),undefined);
 assert.equal(primaryFitReason(undefined),undefined);
});
