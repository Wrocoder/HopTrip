import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyReleaseCache} from '../scripts/verify-release-cache.mjs';
const fixture=()=>{
 const assets=[{url:'/_next/static/a.js',status:200,bytes:10,headers:{'cache-control':'public, immutable','content-type':'application/javascript'}}];
 const rows=['pl','en','ru','uk'].flatMap(locale=>Array.from({length:7},(_,i)=>['normal','no-cache','cache-bust'].map(mode=>({locale,mode,pathname:`/${locale}/${i}`,status:200,headers:{'cache-control':'private, no-store'},buildIds:['build-a'],h1:['Page'],lang:locale,canonical:`https://example.test/${locale}/${i}`,assets:assets.map(x=>x.url)}))).flat());
 return {rows,assets,browser:Array.from({length:4},()=>({...rows[0],visibleH1:['City break'],visibleCards:12})),errors:[]};
};
test('complete same-build matrix passes without claiming release SHA or production rollout',()=>{const r=verifyReleaseCache(fixture());assert.equal(r.valid,true);assert.equal(r.releaseShaVerified,false);assert.equal(r.productionRollbackVerified,false);});
test('mixed or absent build IDs cannot pass',()=>{for(const ids of [[],['build-b']]){const r=fixture();r.rows[1].buildIds=ids;assert.equal(verifyReleaseCache(r).valid,false);}});
test('a stale heading or changed code assets in one mode cannot pass',()=>{for(const change of [{h1:['Old page']},{assets:['/_next/static/old.js']}]){const r=fixture();Object.assign(r.rows[1],change);assert.equal(verifyReleaseCache(r).valid,false);}});
test('cacheable HTML, bad MIME and missing resources cannot pass',()=>{for(const change of [{status:404},{headers:{'cache-control':'public, immutable','content-type':'text/html'}}]){const r=fixture();Object.assign(r.assets[0],change);assert.equal(verifyReleaseCache(r).valid,false);}const r=fixture();r.rows[0].headers['cache-control']='public, max-age=3600';assert.equal(verifyReleaseCache(r).valid,false);});
test('incomplete matrix and wrong locale cannot pass',()=>{const r=fixture();r.rows.pop();assert.equal(verifyReleaseCache(r).valid,false);const s=fixture();s.rows[0].lang='uk';assert.equal(verifyReleaseCache(s).valid,false);});
test('browser failure and captured request errors cannot pass',()=>{const r=fixture();r.browser[1].visibleCards=0;assert.equal(verifyReleaseCache(r).valid,false);const s=fixture();s.errors.push({error:'timeout'});assert.equal(verifyReleaseCache(s).valid,false);});
