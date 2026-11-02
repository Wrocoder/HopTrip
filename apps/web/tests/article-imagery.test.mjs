import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {articlePhoto,articleInlineSection} from '../src/lib/article-imagery.ts';
import {articlePhotoCopy} from '../src/lib/article-photo-captions.ts';
import {translatedGuideSlugs} from '../src/lib/i18n/guide-slugs.ts';
import assets from '../../../docs/article-imagery/assets.json' with {type:'json'};

test('every translated guide and price-method article has an explicitly chosen illustration in all four languages',()=>{
 const slugs=[...translatedGuideSlugs,'price-comparison','price-freshness','price-history'];
 assert.equal(slugs.length,49);
 for(const slug of slugs)for(const locale of ['pl','en','ru','uk']){
  const photo=articlePhoto(slug,locale);assert.ok(photo,slug);assert.ok(photo.caption.length>12);
  assert.match(photo.image.src,/^\/media\/articles\/[a-z]+\.webp$/);
  assert.ok(photo.image.author);assert.ok(articlePhotoCopy[locale].edited);
 }
 for(const slug of ['privacy','terms','contact','about','partners','__proto__','constructor','barcelona-missing','../rome','']){
  assert.equal(articlePhoto(slug,'pl'),undefined);assert.equal(articleInlineSection(slug),undefined);
 }
});

test('real encoded files match reviewed source manifests, image budgets and reusable licence conditions',async()=>{
 assert.equal(assets.length,31);let bytes=0;
 for(const asset of assets){
  const data=readFileSync(new URL('../public'+asset.src,import.meta.url)),meta=await sharp(data).metadata();
  assert.equal(meta.format,'webp');assert.equal(meta.width,1200);assert.equal(meta.height,750);
  assert.equal(meta.exif,undefined);assert.equal(meta.xmp,undefined);
  assert.equal(createHash('sha256').update(data).digest('hex'),asset.outputSha256);
  assert.ok(data.length<=360000,asset.key);bytes+=data.length;
  assert.match(asset.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
  assert.match(asset.licenseUrl,/^https:\/\/creativecommons.org\/licenses\/by(?:-sa)?\/(?:2\.0|2\.5|3\.0|4\.0)\/?$/);
  assert.equal(asset.shareAlike,asset.license.includes('BY-SA'));
  assert.match(asset.originalSha1,/^[0-9a-f]{40}$/);
 }
 assert.ok(bytes<=5000000);
 const credits=readFileSync(new URL('../public/media/articles/CREDITS.md',import.meta.url),'utf8');
 for(const asset of assets)for(const field of ['title','author','licenseUrl'])assert.ok(credits.includes(asset[field]),asset.key+' '+field);
});

test('airport covers identify the city and glacier illustrations have explicit contextual placement',()=>{
 for(const slug of ['wro-airport','wmi-airport','milan-airports','barcelona-airports'])assert.equal(articlePhoto(slug,'en').cityContext,true);
 assert.equal(articlePhoto('baggage','en').cityContext,false);
 assert.equal(articlePhoto('norwegia-wieloryby-lodowce-fiordy','en','inline').key,'nigardsbreen');
 assert.equal(articleInlineSection('norwegia-wieloryby-lodowce-fiordy'),2);
 assert.equal(articleInlineSection('islandia-wieloryby-lodowce-atrakcje'),3);
 assert.equal(articlePhoto('rome-3-days','en','inline'),undefined);
});
