import type {Deal} from './api.ts';
import type {Locale} from './i18n/config.ts';
import {airportNoticeLines,airportContextCopy} from './airport-context.ts';
import {flightBookingContext} from './flight-booking-context.ts';
import {returnAirportNotice} from './flight-facts.ts';
import {stayWarningEntries} from './weekend-stay.ts';
import {weekendCopy} from './weekend.ts';
import {tripRecommendationReason} from './trip-quality.ts';
import {catalogText} from './i18n/catalog-copy.ts';

export const decisionCopy={
 pl:{connection:'Przesiadka',long:'długa',night:'nocna',change:'zmiana lotniska',risk:'ryzykowny transfer',unknown:'noc do potwierdzenia',protection:'Ochronę przesiadki potwierdź u partnera.',minutes:'min',parameters:'Zmiany planu nie są przekazywane. Sprawdź daty i cenę u partnera.'},
 en:{connection:'Connection',long:'long layover',night:'overnight',change:'airport change',risk:'risky transfer',unknown:'night hours unconfirmed',protection:'Confirm connection protection with the partner.',minutes:'min',parameters:'Plan changes are not sent. Check dates and price with the partner.'},
 ru:{connection:'Пересадка',long:'долгая',night:'ночная',change:'смена аэропорта',risk:'рискованный трансфер',unknown:'ночное время нужно уточнить',protection:'Защиту пересадки уточните у партнёра.',minutes:'мин',parameters:'Изменения плана не передаются. Проверьте даты и цену у партнёра.'},
 uk:{connection:'Пересадка',long:'тривала',night:'нічна',change:'зміна аеропорту',risk:'ризикований трансфер',unknown:'нічний час потрібно уточнити',protection:'Захист пересадки уточніть у партнера.',minutes:'хв',parameters:'Зміни плану не передаються. Перевірте дати й ціну в партнера.'},
};
const transferUnknown={pl:'Dojazd: czas i koszt nieznane.',en:'City transfer: time and cost unknown.',ru:'Трансфер: время и стоимость неизвестны.',uk:'Трансфер: час і вартість невідомі.'};
const unknownConnections={pl:'Szczegóły przesiadek do potwierdzenia.',en:'Connection details need confirmation.',ru:'Детали пересадок нужно уточнить.',uk:'Деталі пересадок потрібно уточнити.'};

// Presentation of existing assessments only. No scoring or eligibility changes.
export function tripDecisionRisks(deal:Deal,locale:Locale):string[]{
 const c=decisionCopy[locale],rows:string[]=[];
 const assessment=deal.connection_assessment;
 if(assessment?.version==='connections-v1'){
  for(const item of assessment.connections){
   const flags=[item.long_layover&&c.long,item.overnight&&c.night,item.airport_change&&c.change,item.risky_transfer&&c.risk,item.overnight===null&&c.unknown].filter(Boolean);
   if(flags.length)rows.push(`${catalogText(locale,item.direction==='RETURN'?'Powrót':'Wylot')} · ${c.connection} ${item.arrival_airport}${item.airport_change?` → ${item.departure_airport}`:''}: ${item.duration_minutes} ${c.minutes} · ${flags.join(', ')}.`);
  }
  if(assessment.unknown_directions.length)rows.push(unknownConnections[locale]);
 }
 if(deal.trip_type==='ROUND_TRIP'){
  const airports=returnAirportNotice(deal.flight_facts,locale);
  const checkpoint=deal.components.some(item=>item.component_type==='FLIGHT'&&item.available&&item.redirect_path)&&flightBookingContext(deal.flight_facts,locale);
  if(airports&&!checkpoint)rows.push(airports);
  const context=deal.airport_context,warnings=context?.itinerary_verified?context.warnings:[];
  for(const warning of stayWarningEntries(deal,locale)){
   if(warning.key==='NIGHT_ARRIVAL'&&warnings.includes('EARLY_ARRIVAL')&&context?.arrival_local_time)continue;
   if(warning.key==='EARLY_RETURN'&&warnings.includes('EARLY_RETURN_DEPARTURE')&&context?.return_departure_local_time)continue;
   rows.push(warning.text);
  }
  if(deal.weekend_assessment?.might_require_leave)rows.push(weekendCopy[locale].leave);
  const recommendation=deal.trip_quality?.recommendation;
  if(recommendation?.version==='trip-recommendation-v1'&&recommendation.reasons.includes('NIGHT_HOME_ARRIVAL'))
   rows.push(tripRecommendationReason('NIGHT_HOME_ARRIVAL',locale));
 }
 rows.push(...airportNoticeLines(deal,locale).map(line=>line===airportContextCopy[locale].unknown?transferUnknown[locale]:line));
 return [...new Set(rows.filter(Boolean))];
}
