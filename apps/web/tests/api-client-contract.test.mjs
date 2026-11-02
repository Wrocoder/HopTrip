import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';

const require=createRequire(import.meta.url),modules=new Map();
function load(file){
 if(modules.has(file))return modules.get(file).exports;
 const loaded={exports:{}};modules.set(file,loaded);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInThisContext(`(function(require,module,exports){${source}\n})`)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name.endsWith('.ts')?name:name+'.ts')):require(name),loaded,loaded.exports);
 return loaded.exports;
}
const api=load(path.resolve('src/lib/api.ts'));
async function withFetch(request,run){const original=globalThis.fetch;globalThis.fetch=request;try{await run();}finally{globalThis.fetch=original;}}
const failure=(status,code)=>error=>error instanceof api.ApiError&&error.status===status&&error.code===code;

test('malformed 200 catalog page is an unavailable response, never an empty result',()=>withFetch(async()=>Response.json({items:null,total:0,offset:0,limit:12}),async()=>{
 await assert.rejects(api.getDealResults(),failure(502,'INVALID_RESPONSE'));
}));
test('200 null detail is not confused with a genuine 404',()=>withFetch(async()=>Response.json(null),async()=>{
 await assert.rejects(api.getDeal('test-only'),failure(502,'INVALID_RESPONSE'));
}));
test('malformed airport registry is rejected before a selector can use it',()=>withFetch(async()=>Response.json({items:[]}),async()=>{
 await assert.rejects(api.getAirports(),failure(502,'INVALID_RESPONSE'));
}));
test('malformed alert status fails closed instead of accepting a truthy string',()=>withFetch(async()=>Response.json({enabled:'false'}),async()=>{
 assert.deepEqual(await api.alertStatus(),{enabled:false,delivery_enabled:false});
}));
test('invalid JSON is classified without leaking its body',()=>withFetch(async()=>new Response('<private upstream diagnostics>',{status:200}),async()=>{
 await assert.rejects(api.getDeals(),error=>failure(502,'INVALID_RESPONSE')(error)&&!String(error).includes('private'));
}));
test('network rejection has a stable API error and is attempted only once',async()=>{
 let calls=0;await withFetch(async()=>{calls++;throw new TypeError('private upstream URL');},async()=>{
  await assert.rejects(api.getDeals(),failure(0,'NETWORK_ERROR'));
 });assert.equal(calls,1);
});
test('timeout rejection has a stable API error and is not retried',()=>withFetch(async()=>{throw new DOMException('Synthetic deadline','TimeoutError');},async()=>{
 await assert.rejects(api.getDeals(),failure(504,'TIMEOUT'));
}));
test('HTTP errors preserve status/code and genuine 404 detail remains null',async()=>{
 await withFetch(async()=>Response.json({detail:{code:'UNKNOWN_ORIGIN',message:'private input'}},{status:422}),async()=>{
  await assert.rejects(api.getDeals(),error=>failure(422,'UNKNOWN_ORIGIN')(error)&&!String(error).includes('private'));
 });
 await withFetch(async()=>new Response('Not JSON',{status:404}),async()=>assert.equal(await api.getDeal('missing'),null));
});
test('valid empty pages beyond total keep offset and do not invent results',()=>withFetch(async()=>Response.json({items:[],total:0,offset:24,limit:12}),async()=>{
 assert.deepEqual(await api.getDealResults({offset:'24',limit:'12'}),{items:[],total:0,offset:24,limit:12});
}));
test('invalid pagination metadata is rejected before rendering',async()=>{
 for(const patch of [{total:-1},{offset:0.5},{limit:0},{offset:10001},{limit:101},{has_more:'yes',items:null}])await withFetch(async()=>Response.json({items:[],total:0,offset:0,limit:12,...patch}),async()=>{
  await assert.rejects(api.getDealResults(),failure(502,'INVALID_RESPONSE'));
 });
});
test('an abort while consuming the body is classified as a timeout',()=>withFetch(async()=>({ok:true,json:async()=>{throw new DOMException('Synthetic body deadline','AbortError');}}),async()=>{
 await assert.rejects(api.getDeals(),failure(504,'TIMEOUT'));
}));
test('query allowlist, original decimals, no-store and encoded slugs are preserved',async()=>{
 await withFetch(async(url,options)=>{
  const parsed=new URL(url);assert.equal(options.cache,'no-store');assert.ok(options.signal instanceof AbortSignal);
  assert.equal(parsed.searchParams.get('origin'),'WRO');assert.equal(parsed.searchParams.get('budget'),'200.01');
  assert.equal(parsed.searchParams.has('private'),false);return Response.json([]);
 },async()=>assert.deepEqual(await api.getDeals({origin:'wro',budget:'200.01',private:'never sent'}),[]));
 await withFetch(async url=>{assert.ok(url.endsWith('/deals/a%2Fb%3Fc'));return new Response('',{status:404});},async()=>assert.equal(await api.getDeal('a/b?c'),null));
});
