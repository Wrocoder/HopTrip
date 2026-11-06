import type {Deal} from './api';
import type {Locale} from './i18n/config';
import {validCalendarDate} from './calendar-date.ts';
import {cityLabel} from './cities.ts';

export type AirportCityContext={airport:string|null;destination_slug:string;target_city:string|null;status:'KNOWN'|'STALE'|'UNKNOWN';distance_km:number|null;distance_basis:'PUBLISHER_UNSPECIFIED'|null;source:string|null;last_verified_at:string|null;remote:boolean|null;travel_minutes:null;travel_estimate_status:'UNKNOWN'};
export const airportWarnings=['UNVERIFIED_ITINERARY','DIFFERENT_DESTINATION_AIRPORTS','DIFFERENT_HOME_AIRPORTS','REMOTE_ARRIVAL_AIRPORT','REMOTE_RETURN_AIRPORT','ARRIVAL_METADATA_UNKNOWN','RETURN_METADATA_UNKNOWN','STALE_AIRPORT_METADATA','LATE_ARRIVAL','EARLY_ARRIVAL','EARLY_RETURN_DEPARTURE','ARRIVAL_TIME_UNKNOWN','RETURN_DEPARTURE_TIME_UNKNOWN','TRANSFER_TIME_UNKNOWN'] as const;
export type AirportContext={version:'airport-context-v1';itinerary_verified:boolean;arrival:AirportCityContext;return_departure:AirportCityContext|null;different_destination_airports:boolean|null;different_home_airports:boolean|null;arrival_local_time:string|null;return_departure_local_time:string|null;arrival_time_estimated:boolean;warnings:(typeof airportWarnings)[number][];remote_from_km:40;metadata_max_age_days:180;late_arrival_from:'22:00';early_arrival_before:'06:00';early_return_departure_before:'08:00';limitations:string[]};
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const nullable=(v:unknown,check:(v:unknown)=>boolean)=>v===null||check(v);
const text=(v:unknown)=>typeof v==='string';
const bool=(v:unknown)=>typeof v==='boolean';
const iata=(v:unknown)=>typeof v==='string'&&/^[A-Z]{3}$/.test(v);
const day=(v:unknown)=>typeof v==='string'&&validCalendarDate(v);
export function airportSource(value:unknown):string|null{
 if(typeof value!=='string')return null;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;}catch{return null;}
}
function isCity(v:unknown):v is AirportCityContext{
 if(!object(v)||!nullable(v.airport,iata)||!text(v.destination_slug)||!nullable(v.target_city,text)||!nullable(v.source,x=>airportSource(x)!==null)||!nullable(v.last_verified_at,day)||v.travel_minutes!==null||v.travel_estimate_status!=='UNKNOWN')return false;
 if(v.status==='KNOWN')return iata(v.airport)&&typeof v.target_city==='string'&&!!v.target_city&&typeof v.distance_km==='number'&&Number.isSafeInteger(v.distance_km)&&v.distance_km>0&&v.distance_basis==='PUBLISHER_UNSPECIFIED'&&v.remote===(v.distance_km>=40)&&v.source!==null&&v.last_verified_at!==null;
 return (v.status==='STALE'||v.status==='UNKNOWN')&&v.distance_km===null&&v.distance_basis===null&&v.remote===null&&
  (v.status!=='STALE'||v.source!==null&&v.last_verified_at!==null);
}
const clock=(v:unknown)=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,6})?)?$/.test(v);
export function isAirportContext(v:unknown):v is AirportContext{
 return object(v)&&v.version==='airport-context-v1'&&bool(v.itinerary_verified)&&isCity(v.arrival)&&nullable(v.return_departure,isCity)&&
  nullable(v.different_destination_airports,bool)&&nullable(v.different_home_airports,bool)&&nullable(v.arrival_local_time,clock)&&nullable(v.return_departure_local_time,clock)&&bool(v.arrival_time_estimated)&&
  Array.isArray(v.warnings)&&v.warnings.every(x=>airportWarnings.includes(x))&&v.remote_from_km===40&&v.metadata_max_age_days===180&&v.late_arrival_from==='22:00'&&v.early_arrival_before==='06:00'&&v.early_return_departure_before==='08:00'&&Array.isArray(v.limitations)&&v.limitations.every(text);
}
export const airportContextCopy={
 pl:{title:'Dojazd z lotniska i na lotnisko',remote:'Dalszy dojazd do miasta',late:'Późny przylot',early:'Wczesny przylot',earlyReturn:'Wczesny odlot powrotny',estimated:'szacunek',unknown:'Czas i koszt dojazdu nieznane — sprawdź transport na datę podróży.',metadataUnknown:'Brak zweryfikowanej odległości do miasta.',stale:'Dane o dojeździe wymagają ponownej weryfikacji.',source:'Źródło',reviewed:'Sprawdzono',distance:'Odległość podana przez źródło',basis:'Przybliżona odległość do wskazanego miasta; metoda i punkt pomiaru nie są ujednolicone. To nie długość trasy ani czas przejazdu.',policy:'Progi przypomnień: odległość od 40 km; przylot od 22:00 lub przed 06:00; odlot powrotny przed 08:00, lokalnie. Nie określają godzin kursowania transportu.',clockUnknown:'Godzina dojazdu do sprawdzenia: rozkład lotu lub strefa czasowa nieznane.'},
 en:{title:'Travel between airport and city',remote:'Longer trip to the city',late:'Late arrival',early:'Early arrival',earlyReturn:'Early return departure',estimated:'estimate',unknown:'Transfer time and cost unknown — check transport for your travel date.',metadataUnknown:'No verified distance to the city.',stale:'Airport transport data needs another review.',source:'Source',reviewed:'Checked',distance:'Distance published by the source',basis:'Approximate distance to the named city; measurement method and endpoint are not standardised. This is not a route length or travel time.',policy:'Reminder thresholds: distance from 40 km; arrival from 22:00 or before 06:00; return departure before 08:00, locally. These do not describe transport operating hours.',clockUnknown:'Check transfer timing: flight time or time zone unknown.'},
 ru:{title:'Дорога между аэропортом и городом',remote:'Дальний доезд до города',late:'Поздний прилёт',early:'Ранний прилёт',earlyReturn:'Ранний обратный вылет',estimated:'оценка',unknown:'Время и стоимость доезда неизвестны — проверьте транспорт на дату поездки.',metadataUnknown:'Нет проверенного расстояния до города.',stale:'Сведения о доезде требуют повторной проверки.',source:'Источник',reviewed:'Проверено',distance:'Расстояние по данным источника',basis:'Приблизительное расстояние до указанного города; метод и точка измерения не унифицированы. Это не длина маршрута и не время в пути.',policy:'Пороги напоминаний: расстояние от 40 км; прилёт с 22:00 или до 06:00; обратный вылет до 08:00, по местному времени. Они не задают часы работы транспорта.',clockUnknown:'Уточните время доезда: время рейса или часовой пояс неизвестны.'},
 uk:{title:'Дорога між аеропортом і містом',remote:'Далекий доїзд до міста',late:'Пізній приліт',early:'Ранній приліт',earlyReturn:'Ранній зворотний виліт',estimated:'оцінка',unknown:'Час і вартість доїзду невідомі — перевірте транспорт на дату подорожі.',metadataUnknown:'Немає перевіреної відстані до міста.',stale:'Відомості про доїзд потребують повторної перевірки.',source:'Джерело',reviewed:'Перевірено',distance:'Відстань за даними джерела',basis:'Приблизна відстань до вказаного міста; метод і точка вимірювання не уніфіковані. Це не довжина маршруту й не час у дорозі.',policy:'Пороги нагадувань: відстань від 40 км; приліт з 22:00 або до 06:00; зворотний виліт до 08:00, за місцевим часом. Вони не визначають години роботи транспорту.',clockUnknown:'Уточніть час доїзду: час рейсу або часовий пояс невідомі.'},
} as const;
export function airportContexts(deal:Pick<Deal,'airport_context'>):AirportCityContext[]{
 const c=deal.airport_context;if(!c?.itinerary_verified)return [];
 return [c.arrival,c.return_departure].filter((x):x is AirportCityContext=>x!==null).filter((x,i,all)=>all.findIndex(y=>y.airport===x.airport&&y.destination_slug===x.destination_slug)===i);
}
export function airportNoticeLines(deal:Pick<Deal,'airport_context'>,locale:Locale):string[]{
 const c=deal.airport_context,t=airportContextCopy[locale];
 if(!c?.itinerary_verified)return [t.unknown];
 const lines=airportContexts(deal).filter(x=>x.status==='KNOWN'&&x.remote).map(x=>`${t.remote}: ${x.airport} → ${cityLabel(x.target_city!,x.destination_slug,locale)} · ≈${x.distance_km} km.`);
 const clocks=[['LATE_ARRIVAL',t.late,c.arrival_local_time,c.arrival.airport,c.arrival_time_estimated],['EARLY_ARRIVAL',t.early,c.arrival_local_time,c.arrival.airport,c.arrival_time_estimated],['EARLY_RETURN_DEPARTURE',t.earlyReturn,c.return_departure_local_time,c.return_departure?.airport,false]] as const;
 for(const [key,label,clock,airport,estimated] of clocks)if(c.warnings.includes(key)&&clock)lines.push(`${label}: ${airport??'?'} · ${clock.slice(0,5)}${estimated?` (${t.estimated})`:''}.`);
 if(airportContexts(deal).some(x=>x.status==='STALE'))lines.push(t.stale);
 lines.push(t.unknown);return lines;
}
