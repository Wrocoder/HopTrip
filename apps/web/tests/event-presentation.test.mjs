import test from 'node:test';
import assert from 'node:assert/strict';
import {eventCheckedAt,eventSaleState,eventTicketsAllowed,eventTimeZone} from '../src/lib/event-presentation.ts';
import {eventContextCopy} from '../src/lib/i18n/event-context-copy.ts';
import {eventCopy} from '../src/lib/i18n/event-copy.ts';

test('source sale states do not invent inventory; inactive/unknown parent or option cannot be planned',()=>{
 for(const value of ['onsale','rescheduled']){
  assert.equal(eventSaleState(value),value);assert.equal(eventTicketsAllowed(value),true);
  assert.equal(eventTicketsAllowed(value,'onsale'),true);
  for(const option of ['offsale','unknown',null,'cancelled'])assert.equal(eventTicketsAllowed(value,option),false);
 }
 assert.equal(eventSaleState('offsale'),'offsale');
 for(const value of ['offsale','soldout','cancelled','postponed','ONSale',undefined,null,'']){
  assert.equal(eventTicketsAllowed(value),false);assert.equal(eventTicketsAllowed(value,'onsale'),false);
  if(value!=='offsale')assert.equal(eventSaleState(value),'unknown');
 }
});

test('missing or invalid event zones remain unknown rather than defaulting to UTC',()=>{
 for(const zone of ['Europe/Madrid','Europe/London','UTC'])assert.equal(eventTimeZone(zone),zone);
 for(const zone of [null,undefined,'',' ','Unknown/Zone',123])assert.equal(eventTimeZone(zone),null);
});

test('catalogue check timestamps require a valid aware calendar instant',()=>{
 for(const stamp of ['2026-10-31T20:30:00Z','2026-10-31T21:30:00+01:00','2026-10-31T20:30:00.000000+00:00']){
  assert.equal(eventCheckedAt(stamp).toISOString(),'2026-10-31T20:30:00.000Z');
 }
 for(const stamp of [null,undefined,'','broken','2026-10-31','2026-10-31T20:30:00','2026-02-30T20:30:00Z','2026-10-31T24:00:00Z'])assert.equal(eventCheckedAt(stamp),null);
});

test('event confidence/missing fields/status copy is complete in all four locales',()=>{
 for(const locale of ['pl','en','ru','uk']){
  const copy=eventContextCopy[locale];
  for(const value of Object.values(copy))for(const text of typeof value==='string'?[value]:Object.values(value))assert.ok(text.trim());
  assert.equal(copy.sale.rescheduled,eventCopy[locale].rescheduled);
  assert.notEqual(copy.sale.onsale,copy.sale.offsale);
  assert.notEqual(copy.sale.offsale,copy.sale.unknown);
 }
});
