import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
import {destinationImage,destinationImages,imageryCopy} from '../src/lib/destination-imagery.ts';

test('editorial photo allowlist fails closed for unknown/prototype/path values and has complete localized descriptions',()=>{
 for(const slug of ['milan','__proto__','constructor','../../rome','ROME',''])assert.equal(destinationImage(slug),undefined);
 for(const image of Object.values(destinationImages)){
  assert.match(image.src,/^\/media\/destinations\/[a-z]+\.webp$/);
  assert.match(image.source,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
  assert.ok(image.title&&image.author);assert.match(image.licenseUrl,/^https:\/\/creativecommons.org\/licenses\/by\/(?:3\.0|2\.5)\/$/);
  for(const locale of ['pl','en','ru','uk'])assert.ok(image.alt[locale].length>15);
 }
 for(const copy of Object.values(imageryCopy))assert.ok(copy.photo&&copy.edited&&copy.unavailable);
});

test('shipped photographs decode with reserved aspect ratio, bounded bytes and complete on-disk attribution',async()=>{
 const credits=readFileSync(new URL('../public/media/destinations/CREDITS.md',import.meta.url),'utf8');
 let bytes=0;
 for(const image of Object.values(destinationImages)){
  const file=readFileSync(new URL(`../public${image.src}`,import.meta.url));
  const meta=await sharp(file).metadata();
  assert.equal(meta.format,'webp');assert.equal(meta.width,960);assert.equal(meta.height,600);
  assert.ok(file.length<=110000);bytes+=file.length;
  for(const value of [image.title,image.author,image.licenseUrl])assert.ok(credits.includes(value));
 }
 assert.ok(bytes<=260000);
});
