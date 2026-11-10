import test from 'node:test';
import assert from 'node:assert/strict';
import {countryLabel} from '../src/lib/country-label.ts';
import {pageLocales,pathLocale,localizedHref,languageAlternates} from '../src/lib/i18n/routing.ts';
import {locales} from '../src/lib/i18n/config.ts';
import {destinationPresentation} from '../src/lib/destination-presentation.ts';
import {destinationBrowseHref} from '../src/lib/destination-directory.ts';
import catalog from '../../api/app/data/destinations.json' with {type:'json'};
import liveSlugs from './fixtures/live-destination-photo-slugs.json' with {type:'json'};

test('country identity overrides English source names in all four locales',()=>{
 const expected={pl:'Norwegia',en:'Norway',ru:'Норвегия',uk:'Норвегія'};
 for(const locale of locales)assert.equal(countryLabel(' no ',locale),expected[locale]);
 for(const code of ['ZZ','constructor','Norway','',undefined])assert.equal(countryLabel(code,'pl'),null);
 for(const destination of catalog.destinations){
  if(destination.country_code!=='ZZ')for(const locale of locales)assert.ok(countryLabel(destination.country_code,locale));
 }
});
test('catalog and observed production destination slugs support equivalent language routes without changing identity',()=>{
 for(const slug of new Set([...catalog.destinations.map(d=>d.slug),...liveSlugs])){
  const path=`/destinations/${slug}`;
  assert.deepEqual(pageLocales(path),locales);
  for(const locale of locales){
   const href=localizedHref(path+'?origin=WRO#destination-flights-heading',locale);
   assert.equal(pathLocale(href),locale);
   assert.equal(localizedHref(href,'pl'),path+'?origin=WRO#destination-flights-heading');
   assert.equal(destinationBrowseHref({slug},locale),localizedHref(path,locale));
  }
  assert.equal(Object.keys(languageAlternates(path,pageLocales(path))).length,5);
 }
 for(const path of ['/destinations-extra/rome','/destinations/rome/extra','/destinations/../trip'])assert.deepEqual(pageLocales(path),['pl']);
});
test('generic destination presentation follows the selected locale instead of Polish page fallback',()=>{
 const destination={slug:'milan',city:'Milan',display_name:'Mediolan'};
 const expected={pl:'Mediolan',en:'Milan',ru:'Милан',uk:'Мілан'};
 const descriptions=new Set();
 for(const locale of locales){
  const presentation=destinationPresentation(destination,locale);
  assert.ok(presentation.title.includes(expected[locale]));
  assert.ok(presentation.description.includes(expected[locale]));
  assert.ok(!presentation.description.includes('{city}'));
  descriptions.add(presentation.description);
 }
 assert.equal(descriptions.size,4);
});
