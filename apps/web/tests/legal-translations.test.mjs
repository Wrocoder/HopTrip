import {test} from "node:test";
import assert from "node:assert/strict";
import {legalContent} from "../src/lib/legal-content.ts";
import {legalTranslations} from "../src/lib/i18n/legal-translations.ts";
import {pageLocales,translatedPaths} from "../src/lib/i18n/routing.ts";

test("legal translations preserve all sections, numeric terms and storage identifiers",()=>{
 for(const [locale,documents] of Object.entries(legalTranslations)){
  for(const slug of ["privacy","terms"]){
   const source=legalContent[slug],translated=documents[slug];
   assert.ok(translated.title && translated.description);
   assert.equal(translated.paragraphs.length,source.paragraphs.length);
   assert.equal(translated.sections?.length,source.sections?.length);
   source.sections?.forEach((section,index)=>{
    assert.ok(translated.sections[index].title);
    assert.equal(translated.sections[index].paragraphs.length,section.paragraphs.length);
   });
   const paragraphs=page=>[...page.paragraphs,...(page.sections??[]).flatMap(section=>section.paragraphs)];
   const translatedParagraphs=paragraphs(translated);
   paragraphs(source).forEach((paragraph,index)=>{
    const text=translatedParagraphs[index];
    assert.ok(text.trim(),`${locale}/${slug}/${index}`);
    assert.deepEqual(text.match(/\d+/g),paragraph.match(/\d+/g),`${locale}/${slug}/${index}: numeric terms`);
    for(const marker of paragraph.match(/hoptrip\.[a-z]+\.v\d|emrld\.ltd|tp\.media|uodo\.gov\.pl/g)??[])assert.ok(text.includes(marker));
   });
   assert.ok(pageLocales(`/${locale}/info/${slug}`).includes(locale));
   assert.ok(!translatedPaths.includes(`/info/${slug}`));
  }
 }
});
