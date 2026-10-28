import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {createRequire} from "node:module";
import ts from "typescript";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {locales} from "../src/lib/i18n/config.ts";
import {getMessages} from "../src/lib/i18n/messages.ts";
import {filterCopy,filterText} from "../src/lib/i18n/filter-copy.ts";
import {airportLabel,matchingAirports,airportSuggestions} from "../src/lib/airports.ts";
import {destinationLabel,matchingDestinations} from "../src/lib/destinations.ts";
import {tripPresets} from "../src/lib/trip-filters.ts";

// Render the real client components with React SSR. Only Next navigation/server
// actions and analytics are stubbed; dictionaries, fields and selectors are real.
const require=createRequire(import.meta.url),cache=new Map();
function load(file){
 if(file.endsWith('/actions/origin-preference'))return {rememberOrigin:async()=>{}};
 if(file.endsWith('/lib/session'))return {track:()=>{}};
 const resolved=[file,file+'.tsx',file+'.ts'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
 if(!resolved)throw new Error(file);
 if(cache.has(resolved))return cache.get(resolved).exports;
 const loadedModule={exports:{}};cache.set(resolved,loadedModule);
 const code=ts.transpileModule(fs.readFileSync(resolved,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${code}\n})`,{filename:resolved})(name=>{
  if(name==='next/navigation')return {useRouter:()=>({push:()=>{}})};
  if(name==='next/link')return {__esModule:true,default:({onNavigate,...props})=>{void onNavigate;return React.createElement('a',props);}};
  return name.startsWith('.') ? load(path.resolve(path.dirname(resolved),name).replaceAll('\\','/')) : require(name);
 },loadedModule,loadedModule.exports);
 return loadedModule.exports;
}
const root=path.resolve('src/app/components').replaceAll('\\','/');
const {FilterForm}=load(root+'/filters');
const {LocaleProvider}=load(root+'/locale-provider');
const airports=[{id:'krk',iata_code:'KRK',city:'Krakow',name:'Krakow Airport',is_active:true},{id:'waw',iata_code:'WAW',city:'Warsaw',name:'Chopin',is_active:true},{id:'wmi',iata_code:'WMI',city:'Warsaw',name:'Modlin',is_active:true}];
const destinations=[{id:'milan',slug:'milan',city:'Milan',display_name:'Mediolan',country_code:'IT',iata_codes:['MIL'],is_active:true}];

test('filter forms render all languages, localized values and links without changing identifiers',()=>{
 for(const locale of locales){
  const html=renderToStaticMarkup(React.createElement(LocaleProvider,{locale,messages:getMessages(locale)},React.createElement(FilterForm,{airports,destinations,filters:{origin:'KRK',destination:'milan',budget:'300',duration_min:'2',duration_max:'3',sort:'price'},path:locale==='pl'?'/deals':`/${locale}/deals`})));
  for(const source of ['Filtry ofert','Zastosowane filtry','Wyczyść wszystkie filtry','Jak działają filtry'])assert.ok(html.includes(filterText(locale,source)),source+' '+locale);
  assert.ok(html.includes(airportLabel(airports[0],locale)));
  assert.ok(html.includes(destinationLabel(destinations[0],locale)));
  assert.ok(html.includes('data-destination-slug="milan"'));
  assert.ok(html.includes(`action="${locale==='pl'?'':'/'+locale}/deals"`));
  assert.ok(html.includes(`href="${locale==='pl'?'':'/'+locale}/deals?sort=price"`));
  assert.ok(!html.includes('offset='));
  for(const preset of tripPresets){assert.ok(filterText(locale,preset.label));assert.ok(filterText(locale,preset.rule));}
 }
});

test('localized search resolves original IATA and slugs, preserving unknown and ambiguous results',()=>{
 for(const name of ['Kraków','Краков','Краків','KRK'])assert.equal(matchingAirports(airports,name)[0]?.iata_code,'KRK');
 assert.equal(airportSuggestions(airports,'Кра').length,1);
 assert.equal(matchingAirports(airports,'Варшава').length,2);
 for(const name of ['Милан','Мілан','Milan','Mediolan','MIL'])assert.equal(matchingDestinations(destinations,name)[0]?.slug,'milan');
 assert.equal(matchingDestinations(destinations,'missing').length,0);
 const duplicate={...destinations[0],id:'other',slug:'other'};
 assert.equal(matchingDestinations([...destinations,duplicate],'Milan').length,2);
 assert.equal(destinationLabel({...destinations[0],slug:'unknown-city',city:'Local name'},'uk'),'Local name');
 for(const source of Object.keys(filterCopy))for(const locale of locales)assert.ok(filterText(locale,source).trim());
});
