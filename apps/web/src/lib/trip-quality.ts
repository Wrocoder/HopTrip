import type {Deal} from './api';
import type {Locale} from './i18n/config';

export type TripQualityKey='completeness'|'travel'|'usable_time'|'connections'|'airports'|'leave';
export type TripQuality={version:'trip-quality-v1';status:'KNOWN'|'PARTIAL'|'UNKNOWN';score:number|null;
 components:{key:TripQualityKey;points:number;max_points:number;known:boolean}[];reasons:string[];
 policy:{weights:Record<TripQualityKey,number>;good_travel_minutes:number;bad_travel_minutes:number;target_usable_minutes:number;
 inconvenient_stay_percent:number;night_home_travel_percent:number;connection_penalty_percent:number;long_connection_penalty_percent:number;
 night_connection_penalty_percent:number;risky_connection_penalty_percent:number;airport_change_penalty_percent:number}};
export const tripQualityCopy={
 pl:{label:'Indeks wygody podróży (model)',partial:'niepełne dane',unknown:'za mało potwierdzonych danych',broad:'Za dużo ofert do sortowania rekomendacji. Zawęź lotnisko, kierunek, daty lub cenę (maks. 500 kandydatów).',unsupported:'Rekomendowane sortowanie jest chwilowo niedostępne. Wybierz inną kolejność.'},
 en:{label:'Trip convenience index (model)',partial:'incomplete data',unknown:'insufficient confirmed data',broad:'Too many offers to rank recommendations. Narrow the airport, destination, dates or price (maximum 500 candidates).',unsupported:'Recommended sorting is temporarily unavailable. Choose another order.'},
 ru:{label:'Индекс удобства поездки (модель)',partial:'неполные данные',unknown:'недостаточно подтверждённых данных',broad:'Слишком много предложений для ранжирования рекомендаций. Уточните аэропорт, направление, даты или цену (не более 500 кандидатов).',unsupported:'Сортировка рекомендаций временно недоступна. Выберите другой порядок.'},
 uk:{label:'Індекс зручності подорожі (модель)',partial:'неповні дані',unknown:'недостатньо підтверджених даних',broad:'Забагато пропозицій для ранжування рекомендацій. Уточніть аеропорт, напрямок, дати чи ціну (не більше 500 кандидатів).',unsupported:'Сортування рекомендацій тимчасово недоступне. Виберіть інший порядок.'},
};
export function tripQualitySummary(deal:Pick<Deal,'trip_quality'>,locale:Locale):string|null{
 const q=deal.trip_quality;if(q?.version!=='trip-quality-v1')return null;
 const c=tripQualityCopy[locale];
 return `${c.label}: ${q.score===null?c.unknown:`${new Intl.NumberFormat(locale).format(q.score)}/100${q.status==='PARTIAL'?` · ${c.partial}`:''}`}`;
}
