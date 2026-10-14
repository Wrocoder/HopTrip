import type {Deal} from "./api";

export function flightPriceBasis(deal:Pick<Deal,"trip_type">):string {
  return deal.trip_type==="ROUND_TRIP" ? "za osobę · w obie strony" : "za osobę · w jedną stronę";
}

// Only instants with explicit offsets are clocks. Date-only/naive values stay unknown.
function instantDate(value:string|null|undefined):Date|null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const instant=new Date(value);
  return Number.isFinite(instant.getTime()) ? instant : null;
}
export function validFlightZone(zone:string|null|undefined):zone is string {
  if(!zone)return false;
  try {new Intl.DateTimeFormat("pl-PL",{timeZone:zone});return true;}catch{return false;}
}
export function flightTime(value:string|null|undefined,zone?:string|null):string|null {
  const instant=instantDate(value);
  if(!instant)return null;
  const known=validFlightZone(zone);
  return new Intl.DateTimeFormat("pl-PL",{
    day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",
    timeZone:known ? zone : "UTC",...(known ? {timeZoneName:"shortOffset" as const} : {}),
  }).format(instant)+(known ? ` (${zone})` : " UTC · brak strefy lotniska");
}
function localDay(value:string|null|undefined,zone:string|null|undefined):number|null {
  const instant=instantDate(value);
  if(!instant || !validFlightZone(zone))return null;
  const parts=new Intl.DateTimeFormat("en-US",{timeZone:zone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(instant);
  const n=(type:string)=>Number(parts.find(part=>part.type===type)?.value);
  return Date.UTC(n("year"),n("month")-1,n("day"))/86400000;
}
export function flightDayShift(departure:string|null|undefined,arrival:string|null|undefined,departureZone?:string|null,arrivalZone?:string|null):string|null {
  const start=localDay(departure,departureZone),end=localDay(arrival,arrivalZone);
  if(start===null || end===null || start===end)return null;
  const days=end-start;
  return `${days>0 ? "+" : ""}${days} ${Math.abs(days)===1 ? "dzień" : "dni"}`;
}

export function stopsLabel(stops:number|null|undefined):string {
  if (stops == null) return "Przesiadki do sprawdzenia u partnera";
  return stops===0 ? "Bez przesiadek" : `Liczba przesiadek: ${stops}`;
}

export function destinationInterval(minutes:number|null|undefined):string|null {
  if (minutes == null) return null;
  return `${Math.floor(minutes/60)} godz. ${minutes%60} min`;
}
