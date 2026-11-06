import test from 'node:test';
import assert from 'node:assert/strict';
import {searchFilters,searchSeo,searchUrl} from '../src/lib/search-policy.ts';
import {normalizeWeekendForm,weekendCopy,weekendLabel} from '../src/lib/weekend.ts';
import {togglePreset} from '../src/lib/trip-filters.ts';
import {searchRecovery} from '../src/lib/search-recovery.ts';
test('exact modes and work hours survive general and legacy landing URL roundtrips',()=>{
 for(const path of ['/deals','/tanie-loty-na-weekend','/city-break','/from/warszawa']){
  const f=searchFilters({weekend_mode:'no-leave-v1',work_start:'07:00',work_end:'15:00',budget:'250'},path);
  assert.deepEqual(searchFilters(Object.fromEntries(new URL(searchUrl(path,f),'http://test').searchParams),path),f);
  assert.equal(searchSeo(f,path).index,false);
  if(path==='/tanie-loty-na-weekend')assert.equal(f.weekend,undefined);
 }
 assert.equal(searchFilters({},'/tanie-loty-na-weekend').weekend,'true');
});
test('form normalization removes conflicts and stale work hours; unrelated presets keep selected mode',()=>{
 const q=new URLSearchParams({weekend:'true',weekend_mode:'no-leave-v1',work_start:'07:00',work_end:'15:00',budget:'220',offset:'12'});
 normalizeWeekendForm(q);assert.equal(q.has('weekend'),false);
 togglePreset(q,'nights');togglePreset(q,'budget');togglePreset(q,'weekend');
 assert.equal(q.get('weekend_mode'),'no-leave-v1');assert.equal(q.get('work_end'),'15:00');
 q.set('weekend_mode','calendar-v1');normalizeWeekendForm(q);assert.equal(q.has('work_start'),false);
 q.set('weekend_mode','legacy');normalizeWeekendForm(q);assert.equal(q.get('weekend'),'true');assert.equal(q.has('weekend_mode'),false);
 q.delete('weekend_mode');normalizeWeekendForm(q);assert.equal(q.has('weekend'),false);
});
test('recovery removes the whole weekend group without changing manual constraints',()=>{
 const options=searchRecovery({weekend_mode:'no-leave-v1',work_start:'07:00',work_end:'15:00',budget:'123'});
 assert.equal(options.find(x=>x.label==='Pokaż też inne dni tygodnia').href,'/deals?budget=123');
});
for(const locale of ['pl','en','ru','uk'])test(`${locale} has distinct modes and explicit airport-only caveats`,()=>{
 assert.equal(new Set(['calendar-v1','flexible-v1','no-leave-v1'].map(x=>weekendLabel(x,locale))).size,3);
 for(const value of Object.values(weekendCopy[locale]))assert.ok(value.length>4);
});
