import test from 'node:test';
import assert from 'node:assert/strict';
import {editorialLastModified} from '../src/lib/editorial-updates.ts';
test('sitemap dates reflect actual editorial changes without refreshing unrelated content or overriding later reviews',()=>{
 assert.equal(editorialLastModified('/info/alicante-airport','2026-09-24'),'2026-11-07');
 assert.equal(editorialLastModified('/from/KRK'),'2026-11-07');
 assert.equal(editorialLastModified('/info/alicante-airport','2026-12-01'),'2026-12-01');
 assert.equal(editorialLastModified('/info/baggage','2026-09-23'),'2026-09-23');
 for(const path of ['/unknown','__proto__','constructor'])assert.equal(editorialLastModified(path),undefined);
});
