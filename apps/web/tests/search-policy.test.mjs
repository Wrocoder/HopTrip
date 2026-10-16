import assert from 'node:assert/strict';
import test from 'node:test';
import {searchFilters,searchUrl,searchSeo} from '../src/lib/search-policy.ts';
test('scenario conditions cannot be overridden by arbitrary URL parameters',()=>{
 assert.deepEqual(searchFilters({duration_min:'0',duration_max:'30',origin:'KRK'},'/city-break'),{duration_min:'2',duration_max:'4',origin:'KRK'});
 assert.equal(searchFilters({weekend:'false'},'/tanie-loty-na-weekend').weekend,'true');
 assert.deepEqual(searchFilters({origin:'WRO',destination:'milan'},'/routes/krakow-rome'),{origin:'KRK',destination:'rome'});
 for(const origin of [undefined,'','WRO','WAW,WMI'])assert.equal(searchFilters({origin},'/from/warszawa').origin,'WAW,WMI');
 for(const origin of ['WAW','WMI'])assert.equal(searchFilters({origin},'/from/warszawa').origin,origin);
});
test('canonical drops tracking, empty values and equivalent defaults; filtered pages remain noindex',()=>{
 assert.deepEqual(searchSeo({utm_source:'google',offset:'0',sort:'score'}),{canonical:'/deals',index:true});
 assert.deepEqual(searchSeo({duration_min:'2',duration_max:'4'},'/city-break'),{canonical:'/city-break',index:true});
 assert.deepEqual(searchSeo({budget:'300',origin:'WRO'},'/city-break'),{canonical:'/city-break?origin=WRO&budget=300',index:false});
 assert.equal(searchSeo({offset:'12',sort:'score'}).canonical,'/deals?offset=12');
 assert.equal(searchSeo({offset:'12',sort:'price'}).canonical,'/deals?offset=12&sort=price');
});
test('pagination and sorting keep all conditions and landing scenario',()=>{
 const filters=searchFilters({origin:'WMI',budget:'300',departure_from:'2030-05-03',offset:'12',sort:'price'},'/tanie-loty-na-weekend');
 const url=searchUrl('/tanie-loty-na-weekend',filters);
 assert.equal(url,'/tanie-loty-na-weekend?origin=WMI&departure_from=2030-05-03&budget=300&offset=12&sort=price');
 assert.deepEqual(searchFilters(Object.fromEntries(new URL(url,'http://test').searchParams),'/tanie-loty-na-weekend'),filters);
});
