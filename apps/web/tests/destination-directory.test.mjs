import test from 'node:test';
import assert from 'node:assert/strict';
import {destinationGroups,destinationBrowseHref,directoryQuery} from '../src/lib/destination-directory.ts';
import {pageLocales,pathLocale} from '../src/lib/i18n/routing.ts';
import {directoryCopy} from '../src/lib/i18n/directory-copy.ts';
const milan={id:1,slug:'milan',city:'Milan',display_name:'Mediolan',country:'Italy',country_code:'IT',aliases:['Milano'],iata_codes:['BGY','MXP'],is_active:true};
const city={id:2,slug:'lodz',city:'Łódź',country:'Poland',country_code:'PL',aliases:['Lodz'],is_active:true};
const flatten=groups=>groups.flatMap(group=>group.destinations);
test('directory reuses multilingual aliases, diacritics and IATA without the suggestion cap',()=>{
 for(const query of ['Mediolan','Милан','Мілан',' Milano ','BGY','mxp','medi'])assert.deepEqual(flatten(destinationGroups([milan,city],query,'en')),[milan]);
 assert.deepEqual(flatten(destinationGroups([milan,city],'lodz','pl')),[city]);
 const many=Array.from({length:35},(_,index)=>({...milan,id:index+10,slug:'synthetic-'+index,city:'Synthetic '+index,display_name:undefined}));
 assert.equal(flatten(destinationGroups(many,'','en')).length,35);
 assert.equal(flatten(destinationGroups(many,'synthetic','en')).length,35);
});
test('groups use localized country and city order, exclude inactive rows and leave source arrays intact',()=>{
 const inactive={...milan,id:3,slug:'inactive',is_active:false},input=[city,milan,inactive];
 for(const locale of ['pl','en','ru','uk']){
  const groups=destinationGroups(input,'',locale),collator=new Intl.Collator(locale,{sensitivity:'base'});
  assert.equal(flatten(groups).length,2);assert.equal(groups.find(group=>group.code==='IT').label,new Intl.DisplayNames(locale,{type:'region'}).of('IT'));
  assert.ok(groups.every((group,index)=>!index||collator.compare(groups[index-1].label,group.label)<=0));
 }
 assert.deepEqual(input,[city,milan,inactive]);assert.equal(destinationGroups(input,'zzzz','pl').length,0);
 assert.equal(destinationGroups([],'','en').length,0);
 assert.equal(destinationGroups([{...city,country_code:'not-a-code'}],'','uk')[0].label,directoryCopy.uk.other);
});
test('directory has explicit canonical-language routes and preserves existing city browse targets',()=>{
 for(const locale of ['pl','en','ru','uk']){
  assert.ok(pageLocales('/destinations').includes(locale));assert.equal(pathLocale(locale==='pl'?'/destinations':`/${locale}/destinations`),locale);
  assert.equal(destinationBrowseHref(milan,locale),`${locale==='pl'?'':`/${locale}`}/destinations/milan`);
  const rome={...milan,slug:'rome'};
  assert.equal(destinationBrowseHref(rome,locale),locale==='pl'?'/destinations/rome':`/${locale}/destinations/rome`);
 }
});
test('directory query is bounded, single-valued and treats empty input as the full list',()=>{
 assert.equal(directoryQuery('  MILAN   city '),'MILAN city');assert.equal(directoryQuery(['milan','rome']),'');assert.equal(directoryQuery(undefined),'');
 assert.equal(directoryQuery('x'.repeat(101)).length,100);assert.equal(directoryQuery('   '),'');
});
