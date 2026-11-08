import test from 'node:test';
import assert from 'node:assert/strict';
import {tripQualitySummary} from '../src/lib/trip-quality.ts';
import {searchFilters,searchUrl,searchSeo} from '../src/lib/search-policy.ts';
import {filterText} from '../src/lib/i18n/filter-copy.ts';

for(const locale of ['pl','en','ru','uk'])test(`${locale}: convenience model distinguishes unknown, partial and zero scores`,()=>{
 const q={version:'trip-quality-v1',status:'KNOWN',score:0};
 assert.match(tripQualitySummary({trip_quality:q},locale),/0\/100/);
 assert.match(tripQualitySummary({trip_quality:{...q,score:75,status:'PARTIAL'}},locale),/75\/100 · /);
 assert.ok(!tripQualitySummary({trip_quality:{...q,score:null,status:'UNKNOWN'}},locale).includes('0/100'));
 assert.equal(tripQualitySummary({},locale),null);
 assert.ok(filterText(locale,'Polecane').length>4);
});
test('recommended survives search/pagination with noindex and existing price default unchanged',()=>{
 const filters={sort:'recommended',offset:'12',origin:'WRO',weekend_mode:'no-leave-v1'};
 assert.deepEqual(searchFilters(Object.fromEntries(new URL(searchUrl('/deals',filters),'http://test').searchParams)),filters);
 assert.match(searchSeo(filters).canonical,/sort=recommended/);assert.equal(searchSeo(filters).index,false);
 assert.equal(searchSeo({sort:'price'}).canonical,'/deals');
});
