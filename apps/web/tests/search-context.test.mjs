import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchReturnPath} from '../src/lib/search-context.ts';

test('offer return context preserves catalog conditions, pagination and normalizes origin',()=>{
 assert.equal(searchReturnPath('/deals?origin=wro&destination=milan&departure_from=2030-05-01&departure_to=2030-05-10&budget=220&duration_min=2&duration_max=4&weekend=true&offset=12&sort=price'),
  '/deals?origin=WRO&destination=milan&departure_from=2030-05-01&departure_to=2030-05-10&budget=220&duration_min=2&duration_max=4&weekend=true&offset=12&sort=price');
 assert.equal(searchReturnPath('/deals?origin=WRO&secret=private&returnTo=https%3A%2F%2Fexample.com'),'/deals?origin=WRO');
});
test('offer return context never accepts another route, external URL, oversized or malformed input',()=>{
 for(const value of [undefined,null,[],['/deals?origin=WRO'],'https://example.com','//example.com','/deals/other','/dealshop?x=1','/deals\\evil','/deals?x=\n','/deals?x='+ 'x'.repeat(3000)])
  assert.equal(searchReturnPath(value),'/deals');
 assert.equal(searchReturnPath('/deals?origin=WRO#ignored'),'/deals?origin=WRO');
});
