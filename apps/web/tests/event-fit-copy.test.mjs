import {test} from 'node:test';
import assert from 'node:assert/strict';
import {eventFitReasons} from '../src/lib/event-flight-fit.ts';
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
