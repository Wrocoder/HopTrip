import type {Destination} from './api';
import {destinationLabel,destinationSearchTerms,normalizeDestination} from './destinations.ts';
import {intlLocales,type Locale} from './i18n/config.ts';
import {localizedHref,pageLocales} from './i18n/routing.ts';
import {directoryCopy} from './i18n/directory-copy.ts';

export function destinationBrowseHref(destination:Destination,locale:Locale):string{
 const path='/destinations/'+encodeURIComponent(destination.slug);
 return pageLocales(path).includes(locale)?localizedHref(path,locale):localizedHref('/deals?'+new URLSearchParams({destination:destination.slug}),locale);
}
export function directoryQuery(value:string|string[]|undefined):string{
 return typeof value==='string'?value.trim().replace(/\s+/g,' ').slice(0,100):'';
}
export function destinationGroups(destinations:readonly Destination[],query:string,locale:Locale){
 const normalized=normalizeDestination(query),collator=new Intl.Collator(intlLocales[locale],{sensitivity:'base'});
 const names=new Intl.DisplayNames(intlLocales[locale],{type:'region',fallback:'none'});
 const groups=new Map<string,{code:string;label:string;destinations:Destination[]}>();
 for(const destination of destinations){
  if(!destination.is_active||normalized&&!destinationSearchTerms(destination).some(term=>term.includes(normalized)))continue;
  const country=destination.country_code.trim().toUpperCase();
  const label=/^[A-Z]{2}$/.test(country)&&country!=='ZZ'?names.of(country):undefined;
  const code=label?country:'other';
  let group=groups.get(code);
  if(!group){group={code,label:label??directoryCopy[locale].other,destinations:[]};groups.set(code,group);}
  group.destinations.push(destination);
 }
 for(const group of groups.values())group.destinations.sort((a,b)=>collator.compare(destinationLabel(a,locale),destinationLabel(b,locale))||a.slug.localeCompare(b.slug));
 return [...groups.values()].sort((a,b)=>collator.compare(a.label,b.label)||a.code.localeCompare(b.code));
}
