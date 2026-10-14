const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8').replace(/^\uFEFF/,'');
const snapshot=JSON.parse(read('offers-snapshot.json'));
const report=JSON.parse(read('public-check.json'));
const slides=JSON.parse(read('slides.json'));
const copy=read('pakiet.md');
assert.equal(report.passed,true);assert.equal(report.pages.length,5);assert.equal(slides.length,6);
for(const offer of snapshot.offers){
 assert.equal(offer.origin_code,'WRO');assert.equal(offer.trip_type,'ROUND_TRIP');
 assert.ok(offer.nights>=2&&offer.nights<=4);
 assert.ok(Date.parse(offer.expires_at)>Date.parse(report.checkedAtUtc));
 const row=report.pages.find(p=>p.url.endsWith(offer.slug));assert.ok(row?.budgetEditable);
 const total=Number(offer.flight_price_pln)*2+100*offer.nights;
 assert.ok(row.disclaimer.includes(total.toFixed(2).replace('.',',')),'Budget calculation mismatch');
 const price=Number(offer.flight_price_pln)+' zł';
 assert.ok(copy.includes(price));assert.ok(slides.some(s=>s.big.startsWith(price)));
}
const links=[...copy.matchAll(/https:\/\/hoptrip\.pl\/[^\s)]+/g)].map(m=>new URL(m[0]));
for(const url of links){
 assert.equal(url.searchParams.get('utm_campaign'),'wro-weekend');
 assert.ok(['facebook','instagram'].includes(url.searchParams.get('utm_source')));
 assert.ok(url.searchParams.get('utm_medium'));assert.ok(url.searchParams.get('utm_content'));
}
for(let i=1;i<=6;i++){
 const png=fs.readFileSync(path.join(__dirname,`slide-${i}.png`));
 assert.equal(png.readUInt32BE(16),1080);assert.equal(png.readUInt32BE(20),1350);
 assert.ok(read(`slide-${i}.svg`).includes('13.10.2026, 08:57'));
}
console.log(`PASS: 3 offers, 5 public pages, budget arithmetic, ${links.length} tagged links, 6 slides at 1080x1350.`);
