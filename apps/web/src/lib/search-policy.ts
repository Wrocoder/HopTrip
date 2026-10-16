import type {Filters} from "./api";

export type SearchRaw=Record<string,string|string[]|undefined>;
export const searchKeys=["origin","destination","departure_from","departure_to","budget","duration_min","duration_max","weekend","offset","sort"] as const;
export function scenarioFilters(path:string):Filters {
  if(path==="/routes/krakow-rome")return {origin:"KRK",destination:"rome"};
  if(path==="/city-break")return {duration_min:"2",duration_max:"4"};
  if(path==="/tanie-loty-na-weekend")return {weekend:"true"};
  return {};
}
export function searchFilters(raw:SearchRaw,path="/deals"):Filters {
  const result:Filters={};
  for(const key of searchKeys)if(typeof raw[key]==="string" && raw[key])result[key]=raw[key];
  if(result.origin && /^[a-z]{3}(,[a-z]{3})?$/i.test(result.origin))result.origin=result.origin.toUpperCase();
  if(result.origin==="WMI,WAW")result.origin="WAW,WMI";
  if(result.weekend && ["1","on","yes"].includes(result.weekend.toLowerCase()))result.weekend="true";
  Object.assign(result,scenarioFilters(path));
  if(path==="/from/warszawa" && !["WAW","WMI"].includes(result.origin??""))result.origin="WAW,WMI";
  return result;
}
export function searchUrl(path:string,filters:Filters):string {
  const query=new URLSearchParams();
  const defaults=scenarioFilters(path);
  if(path==="/from/warszawa")defaults.origin="WAW,WMI";
  for(const key of searchKeys)if(filters[key] && filters[key]!==defaults[key])query.set(key,filters[key]!);
  return path+(query.size ? `?${query}` : "");
}
export function searchSeo(raw:SearchRaw,path="/deals") {
  const filters=searchFilters(raw,path);
  // Sorting changes the subset on paginated pages, so keep it there.
  if(!filters.offset || filters.offset==="0") {
    delete filters.offset;

  }
  if(filters.sort==="score")delete filters.sort;
  if(filters.weekend && ["false","0","off","no"].includes(filters.weekend.toLowerCase()))delete filters.weekend;
  const canonical=searchUrl(path,filters);
  return {canonical,index:canonical===path};
}
