import {defaultLocale,intlLocales,type Locale} from "./config.ts";
export function money(value: string | null, locale:Locale=defaultLocale): string {
  if (value === null || !/^-?\d+(\.\d+)?$/.test(value)) return "—";
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat(intlLocales[locale], {style:"currency",currency:"PLN"}).format(number) : "—";
}
export function date(value: string, locale:Locale=defaultLocale): string {
  if(value.length===10 && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10)!==value))return "—";
  const parsed = new Date(value.length === 10 ? value + "T12:00:00Z" : value);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat(intlLocales[locale], {timeZone:"Europe/Warsaw",weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(parsed);
}
export function tripNights(trip:{trip_type:string;trip_start:string;trip_end:string}, locale:Locale=defaultLocale):string {
 if(trip.trip_type!=="ROUND_TRIP")return "";
 const valid=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
 if(!valid(trip.trip_start)||!valid(trip.trip_end))return "";
 const count=(Date.parse(trip.trip_end)-Date.parse(trip.trip_start))/86400000;
 if(count<0)return "";
 const category=new Intl.PluralRules(intlLocales[locale]).select(count);
 const words={pl:{one:"noc",few:"noce",other:"nocy"},ru:{one:"ночь",few:"ночи",other:"ночей"},en:{one:"night",few:"nights",other:"nights"},uk:{one:"ніч",few:"ночі",other:"ночей"}};
 return `${count} ${words[locale][category==="one" ? "one" : category==="few" ? "few" : "other"]}`;
}
export function dateTime(value:string, locale:Locale=defaultLocale):string {
 const parsed=new Date(value);
 return Number.isNaN(parsed.getTime()) ? "—" : `${date(value,locale)}, ${new Intl.DateTimeFormat(intlLocales[locale],{timeZone:"Europe/Warsaw",hour:"2-digit",minute:"2-digit"}).format(parsed)}`;
}
