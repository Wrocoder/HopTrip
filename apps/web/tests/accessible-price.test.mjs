import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {renderToStaticMarkup} from 'react-dom/server';
import * as config from '../src/lib/i18n/config.ts';
import {catalogTemplate} from '../src/lib/i18n/catalog-copy.ts';
import * as format from '../src/lib/i18n/format.ts';
import {approximateEuro} from '../src/lib/exchange-rate.ts';

const require=createRequire(import.meta.url);
function euroComponent(rate){
 const loaded={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(new URL('../src/app/components/price.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const imports={'server-only':{},'../../lib/i18n/config':config,'../../lib/i18n/catalog-copy':{catalogTemplate},'../../lib/i18n/format':format,
  '../../lib/exchange-rate':{approximateEuro,getEurRate:async()=>rate}};
 vm.runInThisContext(`(function(require,module,exports){${code}\nexports.testEuroPrice=EuroPrice;})`)(name=>imports[name]??require(name),loaded,loaded.exports);
 return loaded.exports.testEuroPrice;
}

test('EUR annotation exposes the full existing explanation as text in every locale',async()=>{
 const EuroPrice=euroComponent({plnPerEuro:4,date:'2026-10-30'}); // Synthetic rate, no network.
 for(const locale of ['pl','en','ru','uk']){
  const html=renderToStaticMarkup(await EuroPrice({value:'200',locale}));
  assert.match(html,/<small class="price-eur" title=/);assert.doesNotMatch(html,/aria-label=/);
  assert.match(html,/<span aria-hidden="true">≈ /);assert.match(html,/<span class="sr-only">[^<]*NBP[^<]*<\/span>/);
  assert.equal((html.match(/class="sr-only"/g)||[]).length,1);
 }
});
test('missing rate or unknown flight price does not invent an EUR annotation',async()=>{
 assert.equal(await euroComponent(null)({value:'200',locale:'pl'}),null);
 assert.equal(await euroComponent({plnPerEuro:4,date:'2026-10-30'})({value:null,locale:'en'}),null);
});
