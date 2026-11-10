import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {destinationImage,destinationImages,imageryCopy} from '../src/lib/destination-imagery.ts';
import {articlePhotoCaption} from '../src/lib/article-photo-captions.ts';
import photos from '../src/lib/article-photo-data.json' with {type:'json'};
import catalog from '../../api/app/data/destinations.json' with {type:'json'};
import liveSlugs from './fixtures/live-destination-photo-slugs.json' with {type:'json'};

test('editorial photo allowlist fails closed for unknown/prototype/path values and has complete localized descriptions',()=>{
 for(const slug of ['unknown-city','flight','luggage','__proto__','constructor','../../rome','ROME',''])assert.equal(destinationImage(slug),undefined);
 for(const image of Object.values(destinationImages)){
  assert.match(image.src,/^\/media\/(?:destinations|articles)\/[a-z-]+\.webp$/);
  assert.match(image.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
  assert.ok(image.title&&image.author);
  if(image.license==='FAL')assert.equal(image.licenseUrl,'https://artlibre.org/licence/lal/en');
  else if(image.license==='CC0')assert.equal(image.licenseUrl,'https://creativecommons.org/publicdomain/zero/1.0/');
  else if(image.license==='Public domain')assert.equal(image.licenseUrl,image.source);
  else assert.match(image.licenseUrl,/^https:\/\/creativecommons.org\/licenses\/by(?:-sa)?\/(?:2\.0|2\.5|3\.0|4\.0)(?:\/de\/deed.en)?\/?$/);
  for(const locale of ['pl','en','ru','uk'])assert.ok(image.alt[locale].length>10);
 }
 for(const copy of Object.values(imageryCopy))assert.ok(copy.photo&&copy.edited&&copy.unavailable);
});

test('shipped photographs decode with reserved aspect ratio, bounded bytes and complete on-disk attribution',async()=>{
 let bytes=0;
 for(const image of Object.values(destinationImages)){
  const reused=image.src.startsWith('/media/articles/');
  const credits=readFileSync(new URL(`../public/media/${reused?'articles':'destinations'}/CREDITS.md`,import.meta.url),'utf8').replaceAll('\r\n','\n');
  const file=readFileSync(new URL(`../public${image.src}`,import.meta.url));
  const meta=await sharp(file).metadata();
  assert.equal(meta.format,'webp');assert.equal(meta.width,reused?1200:960);assert.equal(meta.height,reused?750:600);
  assert.equal(image.width,meta.width);assert.equal(image.height,meta.height);
  assert.ok(file.length<=(reused?360000:200000));bytes+=file.length;
  for(const value of [image.title,image.author,image.licenseUrl])assert.ok(credits.includes(value.replaceAll('\r\n','\n')));
 }
 assert.ok(bytes<=16000000);
});

test('collection destinations from the reported screenshot reuse the reviewed city assets and licence metadata',()=>{
 for(const slug of ['stockholm','copenhagen','milan']){
  const image=destinationImage(slug);
  assert.equal(image.src,`/media/articles/${slug}.webp`);
  assert.ok(image.authorUrl);
  assert.equal(image.shareAlike,image.license.includes('BY-SA'));
 }
 assert.ok(destinationImage('paris').attribution.includes('Jorge Royan'));
});

test('every reviewed city photo is reachable from its exact catalog destination, including city-specific country article covers',()=>{
 const aliases={bergen:'norway',reykjavik:'iceland'};
 const known=new Set(catalog.destinations.map(destination=>destination.slug));
 for(const key of ['wroclaw','warsaw','krakow','gdansk','katowice','poznan','bergen','reykjavik']){
  assert.ok(known.has(key));
  const photoKey=aliases[key]??key,image=destinationImage(key);
  assert.ok(image,`${key}: reviewed city photo is missing from the registry`);
  for(const field of ['src','author','source','license','licenseUrl','attribution','shareAlike'])assert.equal(image[field],photos[photoKey][field]);
  for(const locale of ['pl','en','ru','uk'])assert.equal(image.alt[locale],articlePhotoCaption(photoKey,locale));
 }
 // Country-themed and glacier photographs must not silently illustrate arbitrary cities.
 for(const slug of ['norway','iceland','nigardsbreen','solheimajokull'])assert.equal(destinationImage(slug),undefined);
});

test('every catalog destination has a local photograph and matching attribution',()=>{
 for(const destination of catalog.destinations){
  const image=destinationImage(destination.slug);
  assert.ok(image,`${destination.slug}: missing destination photograph`);
  assert.ok(readFileSync(new URL(`../public${image.src}`,import.meta.url)).length>0);
 }
});

test('active production destinations observed on 2026-11-09 have exact photo mappings',()=>{
 for(const slug of liveSlugs)assert.ok(destinationImage(slug),`${slug}: missing production destination photograph`);
});
