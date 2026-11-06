import type {Deal} from './api.ts';
import {flightLocalCalendarDate,flightDayShift,dayShiftLabel} from './flight-facts.ts';
import {date} from './i18n/format.ts';
import type {Locale} from './i18n/config.ts';

export const timelineCopy={
 pl:{nights:'Noce na miejscu',unknown:'do potwierdzenia',returnUnknown:'Dzień i godzina przylotu powrotnego do potwierdzenia.',arrival:'Przylot do',estimated:'szac.',departures:'Daty wylotów'},
 en:{nights:'Nights at destination',unknown:'to be confirmed',returnUnknown:'Return arrival day and time need confirmation.',arrival:'Arrival at',estimated:'estimated',departures:'Departure dates'},
 ru:{nights:'Ночей на месте',unknown:'нужно уточнить',returnUnknown:'День и время обратного прилёта нужно уточнить.',arrival:'Прилёт в',estimated:'расчётно',departures:'Даты вылетов'},
 uk:{nights:'Ночей на місці',unknown:'потрібно уточнити',returnUnknown:'День і час зворотного прильоту потрібно уточнити.',arrival:'Приліт до',estimated:'розрахунково',departures:'Дати вильотів'},
};
// Legacy API fallback uses airport facts only, never advertised dates or Deal.nights.
export function timelineView(deal:Pick<Deal,'flight_facts'|'trip_type'>,locale:Locale='pl'){
 const f=deal.flight_facts,t=f?.timeline,c=timelineCopy[locale];
 const start=flightLocalCalendarDate(f?.outbound_arrival,f?.destination_timezone);
 const end=flightLocalCalendarDate(f?.return_departure,f?.return_origin_timezone);
 const validStay=f&&start&&end&&f.destination_timezone===f.return_origin_timezone&&
  Date.parse(f.return_departure!)>=Date.parse(f.outbound_arrival!);
 const fallbackNights=validStay?(Date.parse(end)-Date.parse(start))/86400000:null;
 const nights=t?t.nights_at_destination:fallbackNights;
 const arrival=t?t.local_return_arrival_date:flightLocalCalendarDate(f?.return_arrival,f?.return_destination_timezone);
 const estimated=t?t.return_arrival_estimated:f?.return_arrival_calculated;
 const nightsEstimated=t?t.nights_estimated:f?.outbound_arrival_calculated;
 const shift=t?(t.return_arrival_day_offset===null?null:dayShiftLabel(t.return_arrival_day_offset,locale)):
  flightDayShift(f?.return_departure,f?.return_arrival,f?.return_origin_timezone,f?.return_destination_timezone,locale);
 return {
  nights:deal.trip_type==='ROUND_TRIP'?`${c.nights}: ${nights??c.unknown}${nights!==null&&nightsEstimated?` (${c.estimated})`:''}`:'',
  arrival:deal.trip_type==='ROUND_TRIP'?(arrival&&f?.return_destination_airport?
   `${c.arrival} ${f.return_destination_airport}: ${date(arrival,locale)}${shift?` (${shift})`:''}${estimated?` · ${c.estimated}`:''}`:c.returnUnknown):'',
 };
}
