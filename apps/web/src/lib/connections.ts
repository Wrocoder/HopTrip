import type {Deal} from './api';
import type {Locale} from './i18n/config';

export type Connection={direction:'OUTBOUND'|'RETURN';after_leg:number;arrival_airport:string;departure_airport:string;
 duration_minutes:number;overnight:boolean|null;airport_change:boolean;long_layover:boolean;risky_transfer:boolean;protection:'UNKNOWN'};
export type ConnectionAssessment={version:'connections-v1';status:'KNOWN'|'PARTIAL'|'UNKNOWN';
 policy:{long_layover_minutes:number;short_transfer_minutes:number};connections:Connection[];unknown_directions:('OUTBOUND'|'RETURN')[]};

const copy={
 pl:{out:'Przesiadka w drodze tam',back:'Przesiadka w drodze powrotnej',minutes:'min',long:'Długa przesiadka.',night:'Przesiadka obejmuje noc (00:00–06:00 czasu lotniska przylotu).',change:'Zmiana lotniska. Przejazd między lotniskami nie jest potwierdzony.',risk:'Transfer może być utrudniony — sprawdź wymagania lotnisk i czas na przejście.',zone:'Nocny charakter przesiadki: do potwierdzenia (brak strefy czasowej).',protection:'Ochrona przesiadki i samodzielny transfer: do potwierdzenia u partnera.',unknown:'Brak potwierdzonych szczegółów przesiadek. Sprawdź czas, lotniska i warunki transferu u partnera.'},
 en:{out:'Outbound connection',back:'Return connection',minutes:'min',long:'Long layover.',night:'The connection includes night hours (00:00–06:00 in the arrival airport time zone).',change:'Airport change. Ground transfer between airports is not confirmed.',risk:'The transfer may be difficult — check airport requirements and transfer time.',zone:'Overnight connection: to be confirmed (time zone missing).',protection:'Connection protection and self-transfer: confirm with the partner.',unknown:'Connection details are not confirmed. Check times, airports and transfer conditions with the partner.'},
 ru:{out:'Пересадка по пути туда',back:'Пересадка на обратном пути',minutes:'мин',long:'Длительная пересадка.',night:'Пересадка включает ночные часы (00:00–06:00 в поясе аэропорта прилёта).',change:'Смена аэропорта. Наземный переезд между аэропортами не подтверждён.',risk:'Трансфер может быть затруднён — проверь требования аэропортов и время на переход.',zone:'Ночной характер пересадки нужно уточнить: часовой пояс неизвестен.',protection:'Защиту стыковки и самостоятельный трансфер уточни у партнёра.',unknown:'Детали пересадок не подтверждены. Уточни время, аэропорты и условия трансфера у партнёра.'},
 uk:{out:'Пересадка дорогою туди',back:'Пересадка на зворотному шляху',minutes:'хв',long:'Тривала пересадка.',night:'Пересадка охоплює нічні години (00:00–06:00 у поясі аеропорту прильоту).',change:'Зміна аеропорту. Наземний переїзд між аеропортами не підтверджено.',risk:'Трансфер може бути ускладнений — перевір вимоги аеропортів і час на перехід.',zone:'Нічний характер пересадки потрібно уточнити: часовий пояс невідомий.',protection:'Захист стикування та самостійний трансфер уточни в партнера.',unknown:'Деталі пересадок не підтверджені. Уточни час, аеропорти та умови трансферу в партнера.'},
};

export function connectionWarnings(deal:Pick<Deal,'connection_assessment'>,locale:Locale):{key:string;title:string;details:string[]}[]{
 const assessment=deal.connection_assessment;
 if(assessment?.version!=='connections-v1')return [];
 const c=copy[locale],direction=(value:'OUTBOUND'|'RETURN')=>value==='OUTBOUND'?c.out:c.back;
 const warnings=assessment.connections.map(connection=>{
  const details:string[]=[];
  if(connection.long_layover)details.push(c.long);
  if(connection.overnight)details.push(c.night);
  if(connection.airport_change)details.push(c.change);
  if(connection.risky_transfer)details.push(c.risk);
  if(connection.overnight===null)details.push(c.zone);
  details.push(c.protection);
  const airports=connection.arrival_airport===connection.departure_airport?connection.arrival_airport:`${connection.arrival_airport} → ${connection.departure_airport}`;
  return {key:`${connection.direction}-${connection.after_leg}`,title:`${direction(connection.direction)}: ${airports} · ${new Intl.NumberFormat(locale).format(connection.duration_minutes)} ${c.minutes}`,details};
 });
 for(const value of assessment.unknown_directions)warnings.push({key:`${value}-unknown`,title:direction(value),details:[c.unknown]});
 return warnings;
}
