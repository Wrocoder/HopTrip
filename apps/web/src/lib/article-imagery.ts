import photos from './article-photo-data.json' with {type:'json'};
import {articlePhotoCaption,type ArticlePhotoKey} from './article-photo-captions.ts';
import type {Locale} from './i18n/config';

// Explicit editorial choices: no guessed place names or images for unknown routes.
const covers:Record<string,ArticlePhotoKey>={
 baggage:'luggage',connections:'flight','booking-with-agents':'flight','trip-budget':'flight',
 'one-way-round-trip':'flight','concert-trip':'flight','city-break-planning':'prague',
 'gdzie-poleciec-na-weekend-jesienia':'prague','tanie-loty-last-minute':'flight',
 'price-comparison':'flight','price-freshness':'flight','price-history':'flight',
 'wro-airport':'wroclaw','waw-airport':'warsaw','wmi-airport':'warsaw',
 'krk-airport':'krakow','gdn-airport':'gdansk','ktw-airport':'katowice','poz-airport':'poznan',
 'barcelona-airports':'barcelona','barcelona-3-days':'barcelona',
 'rome-airports':'rome','rome-3-days':'rome','lisbon-airport':'lisbon','lisbon-3-days':'lisbon',
 'athens-airport':'athens','paris-airports':'paris','paris-weekend':'paris',
 'london-airports':'london','milan-airports':'milan','milan-weekend':'milan',
 'budapest-airport':'budapest','madrid-airport':'madrid','valencia-airport':'valencia',
 'alicante-airport':'alicante','alicante-weekend':'alicante',
 'malaga-airport':'malaga','malaga-weekend':'malaga','porto-airport':'porto',
 'vienna-airport':'vienna','prague-airport':'prague','prague-weekend':'prague',
 'amsterdam-airport':'amsterdam','copenhagen-airport':'copenhagen',
 'stockholm-airports':'stockholm','stockholm-weekend':'stockholm','oslo-weekend':'oslo',
 'norwegia-wieloryby-lodowce-fiordy':'norway','islandia-wieloryby-lodowce-atrakcje':'iceland',
};
const illustrations:Record<string,ArticlePhotoKey>={
 'norwegia-wieloryby-lodowce-fiordy':'nigardsbreen',
 'islandia-wieloryby-lodowce-atrakcje':'solheimajokull',
};
export type ArticlePhoto=typeof photos[keyof typeof photos];
export function articleInlineSection(slug:string){
 return Object.hasOwn(illustrations,slug)?(slug==='islandia-wieloryby-lodowce-atrakcje'?3:2):undefined;
}
export function articlePhoto(slug:string,locale:Locale,placement:'cover'|'inline'='cover'){
 const registry=placement==='cover'?covers:illustrations;
 if(!Object.hasOwn(registry,slug))return undefined;
 const key=registry[slug];
 if(!Object.hasOwn(photos,key))return undefined;
 return {key,image:photos[key],caption:articlePhotoCaption(key,locale),
  cityContext:(slug.endsWith('-airport')||slug.endsWith('-airports'))&&key!=='flight'};
}
