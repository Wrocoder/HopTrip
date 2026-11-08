import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const require=createRequire(import.meta.url);
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const {loadDestinationPage}=require('../src/lib/destination-page.ts');
const {destinationArrivalSummary}=require('../src/lib/destination-arrival-summary.ts');
const {guidesForDestination,destinationForGuide}=require('../src/lib/guide-destinations.ts');
const {getInfoContent}=require('../src/lib/content.ts');
const {translatedGuideContent}=require('../src/lib/i18n/guide-content.ts');
const record={id:1,slug:'milan',city:'Milan',country:'Italy',country_code:'IT',is_active:true};
const unavailable=async()=>{throw new Error('Synthetic feed outage');};

test('registry failure is unavailable and must not be mistaken for a missing destination',async()=>{
 let calls=0;assert.deepEqual(await loadDestinationPage('milan',{getDestinations:unavailable,getDeals:async()=>{calls++;return [];}}),{status:'UNAVAILABLE'});assert.equal(calls,0);
});
test('unknown destination does not query flights or manufacture a template record',async()=>{
 let calls=0;assert.deepEqual(await loadDestinationPage('unknown',{getDestinations:async()=>[record],getDeals:async()=>{calls++;return [];}}),{status:'NOT_FOUND'});assert.equal(calls,0);
});
test('a successful empty result stays distinct from a failed flight feed',async()=>{
 const destinations=[record];
 const empty=await loadDestinationPage('milan',{getDestinations:async()=>destinations,getDeals:async filters=>{assert.deepEqual(filters,{destination:'milan'});return [];}});
 const failed=await loadDestinationPage('milan',{getDestinations:async()=>destinations,getDeals:unavailable});
 assert.equal(empty.status,'READY');assert.equal(empty.offersUnavailable,false);assert.deepEqual(empty.deals,[]);
 assert.equal(failed.status,'READY');assert.equal(failed.offersUnavailable,true);assert.deepEqual(failed.deals,[]);assert.equal(failed.record,record);assert.equal(failed.destinations,destinations);
});
test('available observations retain their identity and existing order',async()=>{
 const deals=[{id:9},{id:2}],result=await loadDestinationPage('milan',{getDestinations:async()=>[record],getDeals:async()=>deals});
 assert.equal(result.status,'READY');assert.equal(result.deals,deals);assert.equal(result.offersUnavailable,false);
});
test('Reykjavik links its regional guide without reclassifying it as a city-only article',()=>{
 assert.deepEqual(guidesForDestination('reykjavik').map(g=>g.slug),['islandia-wieloryby-lodowce-atrakcje']);
 assert.equal(destinationForGuide('islandia-wieloryby-lodowce-atrakcje'),undefined);
 assert.deepEqual(guidesForDestination('amsterdam'),[]);
 assert.equal(destinationForGuide('amsterdam-airport'),undefined);
});
test('arrival summaries reuse the exact published introduction in each language with no invented fallback',()=>{
 const seed=JSON.parse(readFileSync(new URL('../../api/app/data/destinations.json',import.meta.url))).destinations;
 let covered=0;
 for(const destination of seed){
  const guide=guidesForDestination(destination.slug).find(g=>/-airports?$/.test(g.slug));
  for(const locale of ['pl','en','ru','uk']){
   const summary=destinationArrivalSummary(destination.slug,locale);
   if(!guide){assert.equal(summary,null);continue;}
   const page=translatedGuideContent(guide.slug,getInfoContent(guide.slug),locale);
   assert.deepEqual(summary,{title:page.title,summary:page.paragraphs[0],href:`${locale==='pl'?'':'/'+locale}/info/${guide.slug}`});
  }
  if(guide)covered++;
 }
 assert.equal(covered,17);assert.equal(destinationArrivalSummary('unknown','ru'),null);
});
