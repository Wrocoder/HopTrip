import {cityLabel} from "./cities.ts";
import type {Destination} from "./api";

export function normalizeDestination(value:string):string {
 return value.trim().toLowerCase().replace(/ł/g,"l").normalize("NFKD")
  .replace(/\p{M}/gu,"").replace(/\s+/g," ");
}
export const destinationLabel=(destination:Destination)=>cityLabel(destination.display_name || destination.city,destination.slug);
const terms=(d:Destination)=>[d.slug,d.city,destinationLabel(d),...(d.aliases??[]),...(d.iata_codes??[])].map(normalizeDestination);
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
