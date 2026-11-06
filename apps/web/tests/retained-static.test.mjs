import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {retainStatic} from '../scripts/retain-static.mjs';
import {checkStatic} from '../scripts/check-static.mjs';

async function fixture(run){
 const workspace=fileURLToPath(new URL('../../../',import.meta.url));await mkdir(path.join(workspace,'.cache'),{recursive:true});const root=await mkdtemp(path.join(workspace,'.cache/static-test-'));
 assert(root.startsWith(path.join(workspace,'.cache/static-test-')));
 try{await run(root);}finally{await rm(root,{recursive:true,force:true});}
}
async function put(root,name,value){const file=path.join(root,name);await mkdir(path.dirname(file),{recursive:true});await writeFile(file,value);}
test('A/B publication keeps previous bytes, supports rollback and is idempotent',()=>fixture(async root=>{
 const a=path.join(root,'a'),b=path.join(root,'b'),cache=path.join(root,'cache');
 await put(a,'chunks/a.js','old');await put(b,'chunks/b.js','new');await put(b,'chunks/a.js','old');
 const report=await retainStatic([a,b],cache);assert.equal(report.added,2);assert.equal(report.files.length,2);
 assert.equal((await retainStatic([a],cache)).added,0);assert.equal(await readFile(path.join(cache,'chunks/b.js'),'utf8'),'new');
}));
test('conflicting URL aborts before publishing any unrelated new files',()=>fixture(async root=>{
 const a=path.join(root,'a'),b=path.join(root,'b'),cache=path.join(root,'cache');await put(a,'x.js','old');await retainStatic([a],cache);
 await put(b,'new.js','new');await put(b,'x.js','changed');await assert.rejects(retainStatic([b],cache),/collision/);
 await assert.rejects(readFile(path.join(cache,'new.js')),/ENOENT/);assert.equal(await readFile(path.join(cache,'x.js'),'utf8'),'old');
}));
test('two source generations cannot disagree on a public URL',()=>fixture(async root=>{
 const a=path.join(root,'a'),b=path.join(root,'b');await put(a,'x.css','a');await put(b,'x.css','b');
 await assert.rejects(retainStatic([a,b],path.join(root,'cache')),/collision/);
}));
test('source and target directory links are rejected',()=>fixture(async root=>{
 const real=path.join(root,'real'),linked=path.join(root,'linked'),cache=path.join(root,'cache');await put(real,'x.js','x');
 await symlink(real,linked,process.platform==='win32'?'junction':'dir');await assert.rejects(retainStatic([linked],cache),/Unsafe/);
 await assert.rejects(retainStatic([real],linked),/Unsafe/);
 await mkdir(cache);await symlink(real,path.join(cache,'chunks'),process.platform==='win32'?'junction':'dir');
 const nested=path.join(root,'nested');await put(nested,'chunks/x.js','x');await assert.rejects(retainStatic([nested],cache),/Unsafe/);
}));
test('entrypoint seeds the cache before starting even a legacy server module',()=>fixture(async root=>{
 await put(root,'static-seed/chunks/current.js','current');
 await put(root,'server.js',`require('node:assert/strict').equal(require('node:fs').readFileSync('.next/static/chunks/current.js','utf8'),'current');`);
 execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/start-with-static.mjs',import.meta.url))],{cwd:root,windowsHide:true});
}));
test('production entrypoint refuses to start without its dedicated volume',()=>fixture(async root=>{
 await put(root,'static-seed/x.js','x');await put(root,'server.js',`throw Error('server must not start');`);
 assert.throws(()=>execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/start-with-static.mjs',import.meta.url))],{cwd:root,windowsHide:true,env:{...process.env,HOPTRIP_STATIC_VOLUME_REQUIRED:'1'},stdio:'pipe'}),error=>String(error.stderr).includes('Production requires the retained static volume'));
}));
test('postflight checks previous/current URLs, rejects corrupt bytes and unsafe HTML cache',()=>fixture(async root=>{
 const source=path.join(root,'seed');await put(source,'x.js','payload');const manifest=await retainStatic([source],path.join(root,'cache'));
 let corrupt=false,unsafeHtml=false,missing=false,wrongMime=false;
 const server=createServer((request,response)=>{
  if(request.url.startsWith('/_next/static/')){response.statusCode=missing?404:200;response.setHeader('Content-Type',wrongMime?'text/html':'application/javascript');response.setHeader('Cache-Control','public,max-age=31536000,immutable');response.end(corrupt?'changed':'payload');}
  else {response.setHeader('Cache-Control',unsafeHtml?'public,max-age=3600':'private,no-store');response.end('<script src="/_next/static/x.js"></script>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.equal((await checkStatic(base,manifest,'<link href="/_next/static/x.js">')).checked,1);
  await assert.rejects(checkStatic(base,manifest,'','different-build'),/Wrong HTML build/);
  corrupt=true;await assert.rejects(checkStatic(base,manifest,''),/Corrupt/);corrupt=false;
  missing=true;await assert.rejects(checkStatic(base,manifest,''),/Unavailable/);missing=false;
  wrongMime=true;await assert.rejects(checkStatic(base,manifest,''),/Invalid static MIME/);wrongMime=false;
  unsafeHtml=true;await assert.rejects(checkStatic(base,manifest,''),/Unsafe HTML/);unsafeHtml=false;
  await assert.rejects(checkStatic(base,manifest,'<script src="/_next/static/missing.js">'),/Unseeded/);
 }finally{await new Promise(resolve=>server.close(resolve));}
}));
