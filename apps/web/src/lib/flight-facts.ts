import {intlLocales,type Locale} from "./i18n/config.ts";
import {catalogText} from "./i18n/catalog-copy.ts";
import type {Deal} from "./api";

// Keep the two directions independent, including for old API responses without return fields.
export function flightLegs(facts:Deal["flight_facts"]) {
  return {
    outbound:{origin:facts?.origin_airport,destination:facts?.destination_airport,
      originZone:facts?.origin_timezone,destinationZone:facts?.destination_timezone,
      departure:facts?.outbound_departure,arrival:facts?.outbound_arrival,
      stops:facts?.outbound_stops,calculated:facts?.outbound_arrival_calculated},
    inbound:{origin:facts?.return_origin_airport,destination:facts?.return_destination_airport,
      originZone:facts?.return_origin_timezone,destinationZone:facts?.return_destination_timezone,
      departure:facts?.return_departure,arrival:facts?.return_arrival,
      stops:facts?.return_stops,calculated:facts?.return_arrival_calculated},
  };
}

export function flightPriceBasis(deal:Pick<Deal,"trip_type">,locale:Locale="pl"):string {
  return catalogText(locale,deal.trip_type==="ROUND_TRIP" ? "za osobę · w obie strony" : "za osobę · w jedną stronę");
}

// Only instants with explicit offsets are clocks. Date-only/naive values stay unknown.
function instantDate(value:string|null|undefined):Date|null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const instant=new Date(value);
  return Number.isFinite(instant.getTime()) ? instant : null;
}
export function validFlightZone(zone:string|null|undefined):zone is string {
  if(!zone)return false;
  try {new Intl.DateTimeFormat("en-GB",{timeZone:zone});return true;}catch{return false;}
}
export function flightTime(value:string|null|undefined,zone?:string|null,locale:Locale="pl"):string|null {
  const instant=instantDate(value);
  if(!instant)return null;
  const known=validFlightZone(zone);
  return new Intl.DateTimeFormat(intlLocales[locale],{
    day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",
    timeZone:known ? zone : "UTC",...(known ? {timeZoneName:"shortOffset" as const} : {}),
  }).formatToParts(instant).map(part=>
    // ICU versions disagree on GMT versus GMT+0. Keep hydration text identical.
    part.type==="timeZoneName" && /^(?:GMT|UTC)(?:[+-]0{1,2}(?::00)?)?$/.test(part.value) ? "GMT" : part.value
  ).join("")+(known ? ` (${zone})` : ` UTC · ${catalogText(locale,"brak strefy lotniska")}`);
}
export function compactFlightTime(value:string|null|undefined,zone?:string|null,locale:Locale="pl") {
  const instant=instantDate(value);
  if(!instant)return null;
  const local=validFlightZone(zone);
  const timeZone=local ? zone : "UTC";
  return {
    day:new Intl.DateTimeFormat(intlLocales[locale],{day:"numeric",month:"short",timeZone}).format(instant),
    time:new Intl.DateTimeFormat(intlLocales[locale],{hour:"2-digit",minute:"2-digit",timeZone}).format(instant)+(local ? "" : " UTC"),
    local,
  };
}
function localDay(value:string|null|undefined,zone:string|null|undefined):number|null {
  const instant=instantDate(value);
  if(!instant || !validFlightZone(zone))return null;
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(instant);
  const n=(type:string)=>Number(parts.find(part=>part.type===type)?.value);
  return Date.UTC(n("year"),n("month")-1,n("day"))/86400000;
}
export function flightDayShift(departure:string|null|undefined,arrival:string|null|undefined,departureZone?:string|null,arrivalZone?:string|null,locale:Locale="pl"):string|null {
  const start=localDay(departure,departureZone),end=localDay(arrival,arrivalZone);
  if(start===null || end===null || start===end)return null;
  const days=end-start;
  const category=new Intl.PluralRules(intlLocales[locale]).select(Math.abs(days));
  const units={pl:{one:"dzień",few:"dni",other:"dni"},en:{one:"day",few:"days",other:"days"},ru:{one:"день",few:"дня",other:"дней"},uk:{one:"день",few:"дні",other:"днів"}};
  return `${days>0 ? "+" : ""}${days} ${units[locale][category==="one" ? "one" : category==="few" ? "few" : "other"]}`;
}

export function stopsLabel(stops:number|null|undefined,locale:Locale="pl"):string {
  if (stops == null) return catalogText(locale,"Przesiadki do sprawdzenia u partnera");
  return stops===0 ? catalogText(locale,"Bez przesiadek") : `${catalogText(locale,"Liczba przesiadek:")} ${stops}`;
}

export function destinationInterval(minutes:number|null|undefined,locale:Locale="pl"):string|null {
  if (minutes == null || !Number.isFinite(minutes) || minutes<0) return null;
  return `${Math.floor(minutes/60)} ${{pl:"godz.",en:"h",ru:"ч",uk:"год"}[locale]} ${minutes%60} ${{pl:"min",en:"min",ru:"мин",uk:"хв"}[locale]}`;
}
