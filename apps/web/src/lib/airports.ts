import type {Airport} from "./api";

export function normalizeAirport(value:string):string {
  return value.trim().toLowerCase().replace(/ł/g,"l").normalize("NFKD")
    .replace(/\p{M}/gu,"").replace(/\s+/g," ");
}

export function airportLabel(airport:Airport):string {
  // The API's first Polish airport alias is the reviewed Polish city name.
  const city=airport.country_code==="PL" ? airport.aliases?.[0] ?? airport.city : airport.city;
  return `${city} — ${airport.iata_code}`;
}

function terms(airport:Airport):string[] {
  return [airport.iata_code,airport.city,airport.name,airportLabel(airport),...(airport.aliases ?? [])]
    .map(normalizeAirport);
}

export function matchingAirports(airports:Airport[],value:string):Airport[] {
  const normalized=normalizeAirport(value);
  if (!normalized) return [];
  const active=airports.filter(a=>a.is_active);
  const codes=active.filter(a=>normalizeAirport(a.iata_code)===normalized);
  return codes.length ? codes : active.filter(a=>terms(a).includes(normalized));
}

export function airportSuggestions(airports:Airport[],value:string):Airport[] {
  const normalized=normalizeAirport(value);
  return airports.filter(a=>a.is_active && terms(a).some(term=>term.includes(normalized))).slice(0,12);
}
