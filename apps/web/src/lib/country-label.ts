import {intlLocales,type Locale} from './i18n/config.ts';

const names:Partial<Record<Locale,Intl.DisplayNames>>={};
// Source country names may be in another language; use the ISO identity for display.
export function countryLabel(code:string|undefined,locale:Locale='pl'):string|null {
 const normalized=code?.trim().toUpperCase()??'';
 if(!/^[A-Z]{2}$/.test(normalized)||normalized==='ZZ')return null;
 const display=names[locale]??(names[locale]=new Intl.DisplayNames(intlLocales[locale],{type:'region',fallback:'none'}));
 return display.of(normalized)??null;
}
