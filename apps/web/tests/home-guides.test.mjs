import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {locales} from '../src/lib/i18n/config.ts';
import {homeCopy,homeText} from '../src/lib/i18n/home-copy.ts';
import {guideTexts} from '../src/lib/i18n/guide-text.ts';
import {guideTranslations,translatedGuideContent} from '../src/lib/i18n/guide-content.ts';
import {translatedGuideSlugs} from '../src/lib/i18n/guide-slugs.ts';
import {pageLocales,pathLocale} from '../src/lib/i18n/routing.ts';
import {referenceTicket,referenceText} from '../src/lib/i18n/reference-copy.ts';
import {referenceCosts,referenceGrosz} from '../src/lib/reference-costs.ts';
import activityCopy from '../src/lib/i18n/activity-copy.json' with {type:'json'};
// The editorial modules still use Next's extensionless imports. Compile their
// existing TypeScript for this Node-only inventory; no application is started.
const require=createRequire(import.meta.url),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const {getInfoContent,publishedInfoPages}=require('../src/lib/content.ts');
const {activitySelections}=require('../src/lib/destination-activities.ts');
const {activityText}=require('../src/lib/i18n/activity-copy.ts');
const {isServiceSlug}=require('../src/lib/i18n/service-content.ts');

test('home copy retains placeholders and homepage locale is selected by URL',()=>{
 for(const key of Object.keys(homeCopy))for(const locale of locales){
  const value=homeText(locale,key);
  assert.ok(value.trim());
  assert.deepEqual(value.match(/\{\w+\}/g),key.match(/\{\w+\}/g));
 }
 assert.deepEqual(pageLocales('/'),locales);
 for(const language of ['en','ru','uk'])assert.equal(pathLocale('/'+language),language);
 assert.equal(pathLocale('/de'),'pl');
});
test('translated guides preserve every source, date, number and section',()=>{
 assert.deepEqual(publishedInfoPages().filter(([slug])=>!isServiceSlug(slug)).map(([slug])=>slug).sort(),[...translatedGuideSlugs].sort());
 assert.deepEqual(Object.keys(guideTranslations).sort(),[...translatedGuideSlugs].sort());
 for(const slug of translatedGuideSlugs){
  const source=getInfoContent(slug),texts=guideTexts(source),record=guideTranslations[slug];
  assert.equal(record.sourceHash,createHash('sha256').update(JSON.stringify(texts)).digest('hex'),`Source changed: ${slug}`);
  for(const locale of ['en','ru','uk']){
   const translated=translatedGuideContent(slug,source,locale);
   assert.equal(translated.reviewedAt,source.reviewedAt);
   assert.equal(translated.category,source.category);
   assert.deepEqual(translated.related,source.related);
   assert.deepEqual(translated.sources?.map(s=>s.href),source.sources?.map(s=>s.href));
   assert.deepEqual(translated.routes?.map(s=>s.href),source.routes?.map(s=>s.href));
   assert.deepEqual(translated.sections?.map(s=>[s.sourceIds,s.links?.map(l=>l.href)]),source.sections?.map(s=>[s.sourceIds,s.links?.map(l=>l.href)]));
   assert.equal(guideTexts(translated).length,texts.length);
   guideTexts(translated).forEach((value,index)=>{
    assert.ok(value.trim(),`${locale}/${slug}/${index}`);
    assert.deepEqual(value.match(/\d+/g),texts[index].match(/\d+/g),`${locale}/${slug}/${index} changed a number`);
    for(const id of texts[index].match(/\b(?:[A-Z]{2,5}|[A-Z]{1,3}\d+[A-Z]?)\b/g)??[])assert.ok(value.includes(id),`${locale}/${slug}/${index} lost ${id}`);
   });
  }
 }
});
test('all activity selections have complete translations with unchanged quantities',()=>{
 const source=new Set();
 for(const selection of Object.values(activitySelections)){
  if(selection.heading)source.add(selection.heading);
  for(const item of selection.items)for(const field of ['title','category','description','beforeBooking','audience','duration'])if(item[field])source.add(item[field]);
 }
 assert.deepEqual([...source].sort(),Object.keys(activityCopy).sort());
 for(const text of source)for(const locale of locales){
  const value=activityText(locale,text);assert.ok(value.trim());
  assert.deepEqual(value.match(/\d+/g),text.match(/\d+/g));
 }
});
test('reference fare translations preserve amounts, eligibility and conversion',()=>{
 for(const locale of locales){
  for(const cost of referenceCosts){
   const copy=referenceTicket(locale,cost);assert.ok(copy.label&&copy.notes);
   assert.equal(referenceGrosz(cost,2,{date:'2026-10-07',plnPerEuro:4.25},Date.parse('2026-10-08')),Math.round(cost.euroCents*2*4.25));
  }
  assert.match(referenceText(locale,'converted',{eur:'7.60',quantity:'2',date:'2026-10-07',rate:'4.25'}),/7.60 EUR × 2/);
 }
 assert.match(referenceTicket('en',referenceCosts[1]).notes,/not a 72-hour/);
 assert.match(referenceTicket('ru',referenceCosts[2]).notes,/Не действует.*Aeroport T1\/T2.*L9 Sud/);
});
