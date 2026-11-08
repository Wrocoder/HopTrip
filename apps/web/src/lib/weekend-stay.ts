import type {Deal} from './api';
import type {Locale} from './i18n/config';

export type WeekendStay={version:'weekend-stay-v1';eligibility:'ELIGIBLE'|'INELIGIBLE'|'UNKNOWN';
 airport_interval_minutes:number|null;usable_minutes:number|null;night_arrival:boolean|null;early_return:boolean|null;
 policy:{min_airport_minutes:number;min_usable_minutes:number;arrival_buffer_minutes:number;departure_buffer_minutes:number};reasons:string[]};

export function stayRecommendationEligible(deal:Deal,weekend=false):boolean{
 const assessment=deal.weekend_assessment;
 return assessment?.stay?.version==='weekend-stay-v1'&&assessment.stay.eligibility==='ELIGIBLE'&&
  (!weekend||assessment.calendar==='ELIGIBLE'&&assessment.no_leave==='ELIGIBLE');
}

const copy={
 pl:{night:'Przylot w nocy (00:00–06:00 czasu lokalnego).',early:'Wczesny lot powrotny (przed 08:00 czasu lokalnego).',short:'Za mało czasu na pobyt według zasad rekomendacji.',basis:'Ocena pobytu używa okna 08:00–22:00 i założonych buforów dojazdu oraz odprawy. To model, nie potwierdzony czas zwiedzania.'},
 en:{night:'Night arrival (00:00–06:00 local time).',early:'Early return flight (before 08:00 local time).',short:'Insufficient time at the destination under the recommendation rules.',basis:'The stay assessment uses an 08:00–22:00 window and assumed transfer and check-in buffers. This is a model, not confirmed sightseeing time.'},
 ru:{night:'Ночной прилёт (00:00–06:00 по местному времени).',early:'Ранний обратный вылет (до 08:00 по местному времени).',short:'Недостаточно времени для пребывания по правилам рекомендаций.',basis:'Оценка пребывания использует окно 08:00–22:00 и условные резервы на дорогу и регистрацию. Это модель, а не подтверждённое время для прогулок.'},
 uk:{night:'Нічний приліт (00:00–06:00 за місцевим часом).',early:'Ранній зворотний виліт (до 08:00 за місцевим часом).',short:'Недостатньо часу для перебування за правилами рекомендацій.',basis:'Оцінка перебування використовує вікно 08:00–22:00 та умовні резерви на дорогу й реєстрацію. Це модель, а не підтверджений час для прогулянок.'},
};
export function stayModelBasis(locale:Locale):string{return copy[locale].basis;}
export function stayWarnings(deal:Deal,locale:Locale,includeBasis=true):string[]{
 const stay=deal.weekend_assessment?.stay;
 if(stay?.version!=='weekend-stay-v1')return [];
 const c=copy[locale],warnings:string[]=[];
 if(stay.night_arrival)warnings.push(c.night);
 if(stay.early_return)warnings.push(c.early);
 if(stay.reasons.includes('INSUFFICIENT_STAY'))warnings.push(c.short);
 return warnings.length&&includeBasis?[...warnings,c.basis]:warnings;
}
