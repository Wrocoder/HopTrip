import type {Deal} from './api';
import type {Locale} from './i18n/config';
import {destinationInterval} from './flight-facts.ts';
export type DestinationTime={version:'destination-time-v1';scope:'AIRPORT_ARRIVAL_TO_RETURN_DEPARTURE';status:'KNOWN'|'ESTIMATED'|'UNKNOWN';airport_interval_minutes:number|null;arrival_airport:string|null;departure_airport:string|null;airport_change:boolean|null;reason:string|null;usable_city_minutes:null;city_time_status:'UNKNOWN';buffers_applied:false;sort_eligible:boolean};
export const destinationTimeCopy={
 pl:{label:'Między przylotem a odlotem',unknown:'interwał nieznany',city:'Czas w mieście nieznany',estimated:'szacunek',broad:'Za dużo ofert do sortowania według czasu na miejscu. Zawęź lotnisko, daty lub cenę albo wybierz inną kolejność.',unsupported:'Sortowanie według czasu na miejscu jest chwilowo niedostępne. Wybierz inną kolejność.'},
 en:{label:'Between arrival and return departure',unknown:'interval unknown',city:'City time unknown',estimated:'estimate',broad:'Too many offers to sort by time at destination. Narrow the airport, dates or price, or choose another order.',unsupported:'Sorting by time at destination is temporarily unavailable. Choose another order.'},
 ru:{label:'Между прилётом и обратным вылетом',unknown:'интервал неизвестен',city:'Время в городе неизвестно',estimated:'оценка',broad:'Слишком много предложений для сортировки по времени на месте. Уточните аэропорт, даты или цену либо выберите другой порядок.',unsupported:'Сортировка по времени на месте временно недоступна. Выберите другой порядок.'},
 uk:{label:'Між прильотом і зворотним вильотом',unknown:'інтервал невідомий',city:'Час у місті невідомий',estimated:'оцінка',broad:'Забагато пропозицій для сортування за часом на місці. Уточніть аеропорт, дати чи ціну або виберіть інший порядок.',unsupported:'Сортування за часом на місці тимчасово недоступне. Виберіть інший порядок.'},
} as const;
export function destinationTimeView(deal:Pick<Deal,'destination_time'>,locale:Locale){
 const c=destinationTimeCopy[locale],d=deal.destination_time;
 const duration=d&&d.status!=='UNKNOWN'?destinationInterval(d.airport_interval_minutes,locale):null;
 return `${c.label}: ${duration??c.unknown}${duration&&d?.status==='ESTIMATED'?` (${c.estimated})`:''}${duration&&d?.arrival_airport&&d.departure_airport?` · ${d.arrival_airport} → ${d.departure_airport}`:''}. ${c.city}.`;
}
