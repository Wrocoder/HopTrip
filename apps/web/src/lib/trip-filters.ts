import type {Filters} from "./api";

export const tripPresets = [
  {id:"weekend", label:"Na weekend", rule:"Wylot w piątek lub sobotę, powrót w najbliższą niedzielę. Tylko loty z powrotem; bez godzin nie gwarantujemy wyjazdu bez urlopu."},
  {id:"nights", label:"2–3 noce", rule:"Pobyt od 2 do 3 nocy włącznie. Zastępuje oba pola długości pobytu."},
  {id:"budget", label:"Loty do 300 zł", rule:"Cena lotu do 300 zł na osobę włącznie. Zastępuje limit ceny; nie obejmuje noclegu ani innych kosztów."},
] as const;
export type TripPreset = typeof tripPresets[number]["id"];
export function presetActive(filters:Filters, preset:TripPreset):boolean {
  if(preset==="weekend") return ["true","1","on","yes"].includes((filters.weekend??"").toLowerCase());
  if(preset==="nights") return filters.duration_min==="2" && filters.duration_max==="3";
  return !!filters.budget && Number(filters.budget)===300;
}
export function togglePreset(query:URLSearchParams, preset:TripPreset):void {
  const remove=presetActive(Object.fromEntries(query),preset);
  const values=preset==="weekend" ? {weekend:"true"} :
    preset==="nights" ? {duration_min:"2",duration_max:"3"} : {budget:"300"};
  for(const [key,value] of Object.entries(values)) {
    if(remove) query.delete(key);
    else query.set(key,value);
  }
  query.delete("offset");
}
