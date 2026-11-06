import type {Filters} from './api.ts';
import type {CatalogKey} from './i18n/catalog-copy.ts';
import {searchUrl} from './search-policy.ts';

const choices:readonly {keys:readonly (keyof Filters)[];label:CatalogKey}[]=[
 {keys:['budget'],label:'Usuń limit ceny'},
 {keys:['departure_from','departure_to'],label:'Poszerz wyszukiwanie na inne daty'},
 {keys:['destination'],label:'Pokaż inne kierunki'},
 {keys:['weekend','weekend_mode','work_start','work_end'],label:'Pokaż też inne dni tygodnia'},
 {keys:['duration_min','duration_max'],label:'Usuń ograniczenie liczby nocy'},
 {keys:['origin'],label:'Pokaż inne lotniska wylotu'},
];
export function searchRecovery(filters:Filters){
 return choices.filter(choice=>choice.keys.some(key=>key==='weekend' ? ['true','1','on','yes'].includes((filters.weekend??'').toLowerCase()) : Boolean(filters[key])))
  .map(choice=>{
   const next={...filters};delete next.offset;
   for(const key of choice.keys)delete next[key];
   return {label:choice.label,href:searchUrl('/deals',next)};
  });
}
