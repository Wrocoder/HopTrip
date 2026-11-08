import test from 'node:test';
import assert from 'node:assert/strict';
import {countryLabel} from '../src/lib/country-label.ts';
import {passengerInstruction} from '../src/lib/passenger-label.ts';
import {tripText} from '../src/lib/i18n/trip-copy.ts';
import {money,date,dateTime} from '../src/lib/i18n/format.ts';
import translations from '../src/lib/i18n/guide-translations.json' with {type:'json'};

const locales=['pl','en','ru','uk'];
test('ISO identities give localized country names and unknown codes never become source-language labels',()=>{
 const italy={pl:'Włochy',en:'Italy',ru:'Италия',uk:'Італія'};
 const spain={pl:'Hiszpania',en:'Spain',ru:'Испания',uk:'Іспанія'};
 for(const locale of locales){
  assert.equal(countryLabel(' it ',locale),italy[locale]);assert.equal(countryLabel('ES',locale),spain[locale]);
  for(const code of [undefined,'','ZZ','XX','826','ITALY','constructor','<IT>'])assert.equal(countryLabel(code,locale),null);
 }
 assert.equal(countryLabel('PL'),'Polska');
});
test('partner instructions retain adult/person grammar for singular, few and many without treating children as adults',()=>{
 const expected={pl:['1 dorosłego','2 dorosłych','5 dorosłych','21 dorosłych'],en:['1 adult','2 adults','5 adults','21 adults'],ru:['1 взрослого','2 взрослых','5 взрослых','21 взрослого'],uk:['1 дорослого','2 дорослих','5 дорослих','21 дорослого']};
 for(const locale of locales){
  for(const [i,n] of [1,2,5,21].entries())assert.ok(passengerInstruction(String(n),true,locale).includes(expected[locale][i]));
  for(let n=1;n<=50;n++){assert.ok(passengerInstruction(String(n),true,locale).includes(String(n)));assert.notEqual(passengerInstruction(String(n),true,locale),passengerInstruction(String(n),false,locale));}
  for(const count of ['0','51','1.5','-1','NaN'])assert.equal(passengerInstruction(count,true,locale),tripText(locale,'U partnera ustaw skład grupy.'));
 }
});
test('localized dates and PLN retain calendar dates, unknowns and Warsaw clock changes',()=>{
 for(const locale of locales){
  assert.equal(money(null,locale),'—');assert.equal(money('Infinity',locale),'—');
  assert.ok(money('1234.50',locale).includes(locale==='pl'?'zł':'PLN'));
  assert.equal(date('2026-02-30',locale),'—');assert.ok(date('2026-03-29',locale).includes('2026'));
  assert.match(dateTime('2026-03-29T01:30:00Z',locale),/03:30/);
  assert.match(dateTime('2026-10-25T01:30:00Z',locale),/02:30/);
 }
});
test('reviewed guide instructions do not restore corrupt names or reversed travel/budget wording',()=>{
 const corrupt=/railroad robots|in prison|The prayer requires|The lavatory|Judicial Relations|al Ser seriously|Gamla State|\bMuzea\b|железнодорожными робот|ноч[ьи] в тюрьме|Молитва требует|Уборная и связь|Государство Гамла|Оплата устриц|\.ingvellir|Спасенные путешествия|Орки и горбатые/iu;
 for(const [slug,record] of Object.entries(translations))for(const locale of ['en','ru','uk'])for(const text of record[locale])assert.doesNotMatch(text,corrupt,`${slug}/${locale}`);
 assert.match(translations['lisbon-3-days'].en[19],/unknown prices.*unknown/);
 assert.match(translations['waw-airport'].en[5],/engineering works/);
 assert.match(translations['gdn-airport'].en[3],/Wrzeszcz/);
 assert.match(translations['prague-airport'].ru[3],/Nádraží Veleslavín/);
 for(const locale of ['en','ru','uk'])assert.doesNotMatch(translations['budapest-airport'][locale].join(' '),/(?:100|200)Е/u);
});
