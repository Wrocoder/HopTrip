import test from 'node:test';
import assert from 'node:assert/strict';
import {staticAffiliateUrl} from '../src/lib/static-affiliate-url.ts';
import {airportTransfers,transferForGuide} from '../src/lib/airport-transfers.ts';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {partnerContextCopy} from '../src/lib/i18n/partner-context-copy.ts';
// Match the existing CommonJS test loader for Next-managed JSON imports.
const require=createRequire(import.meta.url),modules=new Map();
function load(file){
 if(file.endsWith('.json'))return require(file);
 if(modules.has(file))return modules.get(file).exports;
 const loaded={exports:{}};modules.set(file,loaded);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),/\.(ts|json)$/.test(name)?name:name+'.ts')):require(name),loaded,loaded.exports);
 return loaded.exports;
}
const {activitySelections,activitiesForDestination}=load(path.resolve('src/lib/destination-activities.ts'));
test('every reviewed static affiliate URL is accepted unchanged',()=>{
 for(const [slug,transfer] of Object.entries(airportTransfers)){
  assert.equal(staticAffiliateUrl(transfer.affiliateHref,'transfer'),transfer.affiliateHref);
  assert.equal(transferForGuide(slug).affiliateHref,transfer.affiliateHref);
 }
 for(const [slug,selection] of Object.entries(activitySelections))for(const item of selection.items){
  if(!item.affiliateHref)continue;
  assert.equal(staticAffiliateUrl(item.affiliateHref,'activity'),item.affiliateHref,`${slug}/${item.id}`);
  assert.equal(activitiesForDestination(slug).items.find(x=>x.id===item.id).affiliateHref,item.affiliateHref);
 }
});
test('unsafe or unsupported redirect forms fail closed without rewriting attribution',()=>{
 for(const value of ['http://tpx.gr/ABC','https://tpx.gr.evil/ABC','https://user@tpx.gr/ABC','https://tpx.gr:444/ABC',
  'https://tpx.gr/ABC?checkin=2030-05-31','https://tpx.gr/ABC#private','https://tpx.gr/AB\\C','https://tpx.gr/AB\nC',
  'javascript:alert(1)','//tpx.gr/ABC'])assert.equal(staticAffiliateUrl(value,'transfer'),null);
 for(const target of ['https://evil.example/product','http://www.tiqets.com/product','https://user@www.tiqets.com/product']){
  assert.equal(staticAffiliateUrl('https://tp.media/r?'+new URLSearchParams({u:target}),'activity'),null);
 }
 assert.equal(staticAffiliateUrl('https://tp.media/r?u=https://www.tiqets.com/a&u=https://www.tiqets.com/b','activity'),null);
 assert.equal(staticAffiliateUrl('https://tp.media/r?marker=123','activity'),null);
 assert.equal(staticAffiliateUrl('https://tpx.gr/ABC','activity'),null);
});
test('unsupported static links disappear or fall back to the separate official product',()=>{
 const transfer=airportTransfers['malaga-airport'],before=transfer.affiliateHref;
 try{transfer.affiliateHref='https://evil.example/injected';assert.equal(transferForGuide('malaga-airport'),undefined);}finally{transfer.affiliateHref=before;}
 const selection=Object.values(activitySelections).find(x=>x.items.some(i=>i.affiliateHref));
 const item=selection.items.find(i=>i.affiliateHref),saved=item.affiliateHref;
 const slug=Object.keys(activitySelections).find(key=>activitySelections[key]===selection);
 try{item.affiliateHref='https://evil.example/injected';const result=activitiesForDestination(slug).items.find(i=>i.id===item.id);assert.equal(result.affiliateHref,undefined);assert.equal(result.href,item.href);}finally{item.affiliateHref=saved;}
});
test('unsupported plan context disclaimer is localized in all four languages',()=>{
 assert.deepEqual(Object.keys(partnerContextCopy).sort(),['en','pl','ru','uk']);
 for(const text of Object.values(partnerContextCopy))assert.ok(text.length>80);
});
