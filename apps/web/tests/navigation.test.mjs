import {test} from 'node:test';
import assert from 'node:assert/strict';
import {activeNavigation} from '../src/lib/i18n/navigation.ts';

for(const [path,hash,expected] of [
 ['/deals','', '/deals'],['/deals/offer','', '/deals'],['/from/WRO','', '/deals'],
 ['/routes/krakow-rome','', '/deals'],['/city-break','', '/deals'],
 ['/tanie-loty-na-weekend','', '/tanie-loty-na-weekend'],
 ['/destinations/milan','', '/#home-destinations'],['/','#home-destinations','/#home-destinations'],
 ['/','#other',undefined],['/deals','#home-destinations','/deals'],
 ['/saved','', '/saved'],['/info/trip-budget','', '/info/trip-budget'],
 ['/info/trip-budget-extra','',undefined],['/deals-extra','',undefined],['/info/price-comparison','',undefined],
])test(`navigation boundary ${path}${hash}`,()=>assert.equal(activeNavigation(path,hash),expected));
