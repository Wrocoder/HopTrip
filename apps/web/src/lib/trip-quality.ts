import type {Deal} from './api';
import type {Locale} from './i18n/config';

export type TripQualityKey='completeness'|'travel'|'usable_time'|'connections'|'airports'|'leave';
export type TripRecommendation={version:'trip-recommendation-v1';recommendation_eligible:boolean;
 planning_eligible?:boolean;
 label:'CONVENIENT'|'REQUIRES_PLANNING'|'INSUFFICIENT_DATA';data_confidence:'COMPLETE'|'LIMITED'|'INSUFFICIENT';
 warnings_severity:'NONE'|'WARNING'|'CRITICAL';reasons:string[]};
export type TripQuality={version:'trip-quality-v1';status:'KNOWN'|'PARTIAL'|'UNKNOWN';score:number|null;
 recommendation?:TripRecommendation;
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
 const r=q.recommendation;
 // Older API responses cannot establish convenience from a numeric score.
 if(!r||r.version!=='trip-recommendation-v1')return recommendationCopy[locale].INSUFFICIENT_DATA;
 return recommendationCopy[locale][r.label];
}
export function tripQualityModelSummary(deal:Pick<Deal,'trip_quality'>,locale:Locale):string|null{
 const q=deal.trip_quality;if(q?.version!=='trip-quality-v1')return null;
 const c=tripQualityCopy[locale];
 return `${c.label}: ${q.score===null?c.unknown:`${new Intl.NumberFormat(locale).format(q.score)}/100${q.status==='PARTIAL'?` · ${c.partial}`:''}`}`;
}

export const recommendationCopy={
 pl:{CONVENIENT:'Wygodna podróż',REQUIRES_PLANNING:'Wymaga planowania',INSUFFICIENT_DATA:'Za mało danych do oceny wygody'},
 en:{CONVENIENT:'Convenient trip',REQUIRES_PLANNING:'Requires planning',INSUFFICIENT_DATA:'Insufficient data to assess convenience'},
 ru:{CONVENIENT:'Удобная поездка',REQUIRES_PLANNING:'Требует планирования',INSUFFICIENT_DATA:'Недостаточно данных для оценки удобства'},
 uk:{CONVENIENT:'Зручна подорож',REQUIRES_PLANNING:'Потребує планування',INSUFFICIENT_DATA:'Недостатньо даних для оцінки зручності'},
};
const recommendationReasons:Record<string,readonly string[]>={
 TRANSFER_TIME_UNKNOWN:['Czas dojazdu do miasta nie jest potwierdzony.','City transfer time is unconfirmed.','Время трансфера до города не подтверждено.','Час трансферу до міста не підтверджено.'],
 OVERNIGHT_CONNECTION:['Nocna przesiadka.','Overnight connection.','Ночная пересадка.','Нічна пересадка.'],
 LONG_CONNECTION:['Długa przesiadka.','Long connection.','Долгая пересадка.','Тривала пересадка.'],
 RISKY_CONNECTION:['Przesiadka wymaga sprawdzenia.','The connection needs checking.','Пересадка требует проверки.','Пересадка потребує перевірки.'],
 AIRPORT_CHANGE:['Zmiana lotniska wymaga planowania.','An airport change requires planning.','Смена аэропорта требует планирования.','Зміна аеропорту потребує планування.'],
 INSUFFICIENT_STAY:['Za mało czasu na pobyt.','Insufficient time at the destination.','Недостаточно времени на месте.','Недостатньо часу на місці.'],
 NIGHT_ARRIVAL:['Przylot w nocy.','Night arrival.','Ночной прилёт.','Нічний приліт.'],
 NIGHT_HOME_ARRIVAL:['Powrót do domu w nocy.','Night arrival home.','Возвращение домой ночью.','Повернення додому вночі.'],
 EARLY_RETURN:['Wczesny lot powrotny.','Early return flight.','Ранний обратный вылет.','Ранній зворотний виліт.'],
 LATE_ARRIVAL:['Późny przylot.','Late arrival.','Поздний прилёт.','Пізній приліт.'],
 REMOTE_ARRIVAL_AIRPORT:['Lotnisko przylotu jest oddalone od miasta.','The arrival airport is far from the city.','Аэропорт прилёта удалён от города.','Аеропорт прильоту віддалений від міста.'],
 REMOTE_RETURN_AIRPORT:['Lotnisko powrotu jest oddalone od miasta.','The return airport is far from the city.','Аэропорт обратного вылета удалён от города.','Аеропорт зворотного вильоту віддалений від міста.'],
};
export function tripRecommendationReason(reason:string,locale:Locale):string{
 const index={pl:0,en:1,ru:2,uk:3}[locale];
 const fallback=['Nie wszystkie dane podróży są potwierdzone.','Some trip details are unconfirmed.','Не все данные поездки подтверждены.','Не всі дані подорожі підтверджено.'];
 return (recommendationReasons[reason]??fallback)[index];
}
export function tripRecommendationReasons(deal:Pick<Deal,'trip_quality'>,locale:Locale):string[]{
 const r=deal.trip_quality?.recommendation;if(!r||r.version!=='trip-recommendation-v1')return [];
 return [...new Set(r.reasons.map(reason=>tripRecommendationReason(reason,locale)))];
}
