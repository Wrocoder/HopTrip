import type {Deal} from "./api";

export function flightPriceBasis(deal:Pick<Deal,"trip_type">):string {
  return deal.trip_type==="ROUND_TRIP" ? "za osobę · w obie strony" : "za osobę · w jedną stronę";
}

// Show a single explicitly labelled zone, never the viewer's browser zone.
// Provider offsets are applied by Date when converting the original instant.
export function flightTime(value:string|null|undefined):string|null {
  if (!value) return null;
  const instant=new Date(value);
  if (!Number.isFinite(instant.getTime())) return null;
  return new Intl.DateTimeFormat("pl-PL",{
    day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC",
  }).format(instant)+" UTC";
}

export function stopsLabel(stops:number|null|undefined):string {
  if (stops == null) return "Przesiadki do sprawdzenia u partnera";
  return stops===0 ? "Bez przesiadek" : `Liczba przesiadek: ${stops}`;
}

export function destinationInterval(minutes:number|null|undefined):string|null {
  if (minutes == null) return null;
  return `${Math.floor(minutes/60)} godz. ${minutes%60} min`;
}
