import {originLabel,cityLabel} from "./cities.ts";
import {locales,type Locale} from "./i18n/config.ts";
import type {Airport} from "./api";

export function normalizeAirport(value:string):string {
  return value.trim().toLowerCase().replace(/ł/g,"l").normalize("NFKD")
    .replace(/\p{M}/gu,"").replace(/\s+/g," ");
}

export function airportLabel(airport:Airport,locale:Locale="pl"):string {
  return `${originLabel(airport.city,airport.iata_code,locale)} — ${airport.iata_code}`;
}

function terms(airport:Airport):string[] {
  return [airport.iata_code,airport.city,airport.name,...locales.flatMap(locale=>[airportLabel(airport,locale),originLabel(airport.city,airport.iata_code,locale),cityLabel(airport.city,undefined,locale)]),...(airport.aliases ?? [])]
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
  const suggestions:Airport[]=[];
  for(const airport of airports){
    if(airport.is_active&&(!normalized||terms(airport).some(term=>term.includes(normalized)))){
      suggestions.push(airport);
      if(suggestions.length===12)break;
    }
  }
  return suggestions;
}
