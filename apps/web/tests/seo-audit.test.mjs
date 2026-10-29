import {test} from 'node:test';
import assert from 'node:assert/strict';
import {auditSitemap,auditPage,auditReciprocity,publishedPages,localizedPath} from '../scripts/seo-contract.mjs';
import inventory from '../scripts/seo-pages.json' with {type:'json'};

test('translated article metadata is enabled only for reviewed translated routes',()=>{
 assert.throws(()=>publishedPages({...inventory,translatedArticlePaths:['/info/unreviewed']}),/without translated route/);
 assert.throws(()=>publishedPages({...inventory,translatedArticlePaths:['/deals']}),/without translated route/);
});

const canonical='https://hoptrip.pl',pages=publishedPages();
const urls=[...pages.keys()].map(path=>new URL(path,canonical).href);
function metadata(path){
 const expected=pages.get(path);
 return {lang:expected.locale,headings:1,title:`Title ${path}`,description:`Description ${path}`,
  canonical:[canonical+path],robots:'index, follow',ogTitle:'Title',ogDescription:'Description',ogUrl:canonical+path,
  alternates:expected.locales.length===1?[]:[...expected.locales,'x-default'].map(lang=>({lang,href:canonical+localizedPath(expected.path,lang==='x-default'?'pl':lang)}))};
}

test('published multilingual inventory passes without a hard-coded sitemap count',()=>{
 assert.deepEqual(auditSitemap(urls,canonical),[]);
 for(const path of pages.keys())assert.deepEqual(auditPage(path,metadata(path),canonical),[],path);
 assert.deepEqual(auditReciprocity(new Map([...pages.keys()].map(path=>[path,metadata(path)]))),[]);
});
test('audit rejects removed mandatory pages, private/filtered URLs, duplicates and other origins',()=>{
 assert.ok(auditSitemap(urls.filter(url=>url!==canonical+'/ru/deals'),canonical).some(error=>error.includes('/ru/deals: missing required')));
 for(const invalid of [canonical+'/trip',canonical+'/en/saved',canonical+'/deals?origin=WRO','https://other.example/deals'])assert.ok(auditSitemap([...urls,invalid],canonical).length);
 assert.ok(auditSitemap([...urls,urls[0]],canonical).some(error=>error.includes('duplicate')));
});
test('audit detects wrong canonical, language, status, headings, indexing and missing metadata',()=>{
 for(const change of [{canonical:[canonical+'/deals']},{canonical:[canonical+'/en/deals',canonical+'/en/deals']},{lang:'pl'},{headings:2},{robots:'none'},{title:''},{description:''}]){
  assert.ok(auditPage('/en/deals',{...metadata('/en/deals'),...change},canonical).length,JSON.stringify(change));
 }
 assert.ok(auditPage('/en/deals',metadata('/en/deals'),canonical,{status:404}).length);
 assert.ok(auditPage('/en/deals',metadata('/en/deals'),canonical,{staging:true}).length);
 assert.deepEqual(auditPage('/en/deals',metadata('/en/deals'),canonical,{staging:true,headerRobots:'noindex'}),[]);
});
test('missing self/x-default, wrong targets and a broken reciprocal language pair fail',()=>{
 for(const lang of ['en','ru','x-default']){
  const data=metadata('/en/deals');data.alternates=data.alternates.filter(item=>item.lang!==lang);
  assert.ok(auditPage('/en/deals',data,canonical).length);
 }
 const data=metadata('/ru/deals');data.alternates.find(item=>item.lang==='en').href=canonical+'/en/info';
 assert.ok(auditPage('/ru/deals',data,canonical).some(error=>error.includes('hreflang en')));
 const collected=new Map([...pages.keys()].map(path=>[path,metadata(path)]));collected.set('/ru/deals',data);
 assert.ok(auditReciprocity(collected).some(error=>error.includes('non-reciprocal')));
 const untranslated=metadata('/info/baggage');
 assert.deepEqual(auditPage('/info/baggage',untranslated,canonical),[]);
});
