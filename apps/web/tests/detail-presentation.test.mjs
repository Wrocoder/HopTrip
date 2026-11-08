import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {tripText} from '../src/lib/i18n/trip-copy.ts';
import {tripSectionCopy} from '../src/lib/i18n/trip-section-copy.ts';
import {qualityNotice} from '../src/lib/flight-quality.ts';
import {qualityText,qualityReasonText} from '../src/lib/i18n/quality-copy.ts';

const require=createRequire(import.meta.url);
function component(file,imports){
 const loaded={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name=>imports[name]??require(name),loaded,loaded.exports);
 return loaded.exports;
}
const {TripNavigation}=component('../src/app/components/trip-navigation.tsx',{'../../lib/i18n/trip-copy':{tripText},'../../lib/i18n/trip-section-copy':{tripSectionCopy}});
const {FlightQualityNotice}=component('../src/app/components/flight-quality.tsx',{
 '../../lib/flight-quality':{qualityNotice},'../../lib/i18n/quality-copy':{qualityText,qualityReasonText},
});
const render=(type,props)=>renderToStaticMarkup(React.createElement(type,props));

test('detail and saved-plan navigation expose the same four localized sections',()=>{
 for(const locale of ['pl','en','ru','uk']){
  const full=render(TripNavigation,{locale});
  assert.deepEqual([...full.matchAll(/href="([^"]+)"/g)].map(m=>m[1]),['#trip-flight','#trip-stay','#calculator','#trip-save']);
  for(const key of ['flight','stay','budget','save'])assert.ok(full.includes(tripSectionCopy[locale][key]));
 }
});

test('all critical reasons are outside disclosure in detail mode while other contexts retain their policy',()=>{
 const reasons=['MISSING_ORIGIN','MISSING_DATES','UNKNOWN_STOPS'];
 const deal={flight_quality:{version:'flight-quality-v1',status:'CRITICAL_INCOMPLETE',reasons}};
 for(const locale of ['pl','en','ru','uk']){
  const detail=render(FlightQualityNotice,{deal,locale,expandedCritical:true});
  assert.ok(!detail.includes('<details'));
  for(const reason of reasons)assert.ok(detail.includes(renderToStaticMarkup(React.createElement(React.Fragment,null,qualityReasonText(locale,reason)))));
  assert.ok(render(FlightQualityNotice,{deal,locale}).includes('<details'));
  assert.ok(!render(FlightQualityNotice,{deal,locale,compact:true}).includes('<details'));
 }
});
