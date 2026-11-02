import {cityLabel} from "./cities.ts";
import {locales,type Locale} from "./i18n/config.ts";
import type {Destination} from "./api";

export function normalizeDestination(value:string):string {
 return value.trim().toLowerCase().replace(/ł/g,"l").normalize("NFKD")
  .replace(/\p{M}/gu,"").replace(/\s+/g," ");
}
export const destinationLabel=(destination:Destination,locale:Locale="pl")=>cityLabel(locale==="pl" ? destination.display_name || destination.city : destination.city,destination.slug,locale);
const terms=(d:Destination)=>[d.slug,d.city,...locales.map(locale=>destinationLabel(d,locale)),...(d.aliases??[]),...(d.iata_codes??[])].map(normalizeDestination);
export function matchingDestinations(destinations:Destination[],value:string):Destination[] {
 const normalized=normalizeDestination(value);
 if(!normalized)return [];
 const active=destinations.filter(d=>d.is_active);
 const exact=active.filter(d=>d.slug===value.trim());
 return exact.length ? exact : active.filter(d=>terms(d).includes(normalized));
}
export function destinationSuggestions(destinations:Destination[],value:string):Destination[] {
 const normalized=normalizeDestination(value);
 return destinations.filter(d=>d.is_active && terms(d).some(term=>term.includes(normalized))).slice(0,12);
}
