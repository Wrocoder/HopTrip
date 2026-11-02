import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real server action; only request-bound Next cookies/redirect are mocked.
const actionFile=new URL('../src/app/actions/origin-preference.ts',import.meta.url);
const require=createRequire(actionFile);
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,file);
function fixture(failCookies=false){
 const calls=[];
 const code=ts.transpileModule(readFileSync(actionFile,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const loaded={exports:{}};
 vm.runInThisContext(`(function(require,module,exports){${code}\n})`)(name=>{
  if(name==='next/headers')return {cookies:async()=>{
   if(failCookies)throw new Error('Synthetic cookie store failure');
   return {set:(...args)=>calls.push(['set',...args]),delete:(...args)=>calls.push(['delete',...args])};
  }};
  if(name==='next/navigation')return {redirect:href=>{calls.push(['redirect',href]);throw new Error('SYNTHETIC_REDIRECT');}};
  return require(name);
 },loaded,loaded.exports);
 return {action:loaded.exports.searchWithOrigin,calls};
}
test('search action saves the optional origin and redirects to the exact localized catalog query',async()=>{
 const {action,calls}=fixture();
 await assert.rejects(action('wro','/ru/deals?origin=WRO&budget=220'),/SYNTHETIC_REDIRECT/);
 assert.equal(calls[0][0],'set');assert.equal(calls[0][2],'WRO');
 assert.equal(calls[0][3].httpOnly,true);assert.equal(calls[0][3].sameSite,'lax');
 assert.deepEqual(calls[1],['redirect','/ru/deals?origin=WRO&budget=220']);
 const cleared=fixture();
 await assert.rejects(cleared.action('','/city-break?budget=220'),/SYNTHETIC_REDIRECT/);
 assert.equal(cleared.calls[0][0],'delete');
});
test('search action rejects external and unrelated navigation before any cookie write',async()=>{
 const {action,calls}=fixture();
 for(const href of ['https://example.com','//example.com','/deals/offer','/info/privacy','/deals\\evil','/deals?x=\n','/deals?x='+'x'.repeat(3000),null])
  await assert.rejects(action('WRO',href));
 assert.deepEqual(calls,[]);
});
test('an unavailable preference store does not block the actual search',async()=>{
 const {action,calls}=fixture(true);
 await assert.rejects(action('WRO','/deals?origin=WRO'),/SYNTHETIC_REDIRECT/);
 assert.deepEqual(calls,[['redirect','/deals?origin=WRO']]);
});
