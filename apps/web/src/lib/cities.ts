import type {Locale} from "./i18n/config.ts";
import {translatedCity} from "./i18n/city-names.ts";
// Presentation only: route slugs and provider parameters keep their original values.
const names:Record<string,string> = {
 rome:"Rzym",lisbon:"Lizbona",athens:"Ateny",milan:"Mediolan",paris:"Paryż",london:"Londyn",
 brussels:"Bruksela",chisinau:"Kiszyniów",basel:"Bazylea",gdansk:"Gdańsk",budapest:"Budapeszt",
 venice:"Wenecja",nice:"Nicea",warsaw:"Warszawa",valencia:"Walencja",stockholm:"Sztokholm",
 pisa:"Piza",bologna:"Bolonia",bratislava:"Bratysława",vilnius:"Wilno",prague:"Praga",vienna:"Wiedeń",
 dubrovnik:"Dubrownik",bucharest:"Bukareszt",bourgas:"Burgas",copenhagen:"Kopenhaga",krakow:"Kraków",
 riga:"Ryga",wroclaw:"Wrocław",madrid:"Madryt",brasov:"Braszów",catania:"Katania",naples:"Neapol",
 larnaca:"Larnaka",paphos:"Pafos",poznan:"Poznań",aalesund:"Ålesund",tromso:"Tromsø",
 lodz:"Łódź",rzeszow:"Rzeszów",szczecin:"Szczecin",bydgoszcz:"Bydgoszcz",katowice:"Katowice",
 "zielona gora":"Zielona Góra",olsztyn:"Olsztyn",
 turin:"Turyn",genoa:"Genua",thessaloniki:"Saloniki",
};
const normalize=(value:string)=>value.trim().toLowerCase().replace(/ł/g,"l").normalize("NFKD").replace(/\p{M}/gu,"");
const eventAliases:Record<string,string>={roma:"rome",milano:"milan",napoli:"naples",venezia:"venice",torino:"turin",genova:"genoa",praha:"prague",wien:"vienna",bruxelles:"brussels",brussel:"brussels",københavn:"copenhagen",kobenhavn:"copenhagen",athina:"athens","αθηνα":"athens","θεσσαλονικη":"thessaloniki"};
export function eventCityLabel(city:string,locale:Locale="pl"):string {
 return cityLabel(city,eventAliases[normalize(city)],locale);
}
export function cityLabel(city:string,slug?:string,locale:Locale="pl"):string {
 if(locale!=="pl"){
  // Old saved plans contain display names, not destination IDs. Resolve known
  // Polish names for display only; keep unknown snapshot labels verbatim.
  const polishSlug=Object.keys(names).find(key=>normalize(names[key])===normalize(city));
  return translatedCity(city,slug??polishSlug,locale) ?? city;
 }
 return names[normalize(slug??city)] ?? names[normalize(city)] ?? city;
}
export function originLabel(city:string,code:string,locale:Locale="pl"):string {
 if(locale!=="pl") {
  if(code==="WAW")return `${cityLabel("Warsaw",undefined,locale)} Chopin`;
  if(code==="WMI")return `${cityLabel("Warsaw",undefined,locale)} Modlin`;
  return cityLabel(city,undefined,locale);
 }
 if(code==="WAW")return "Warszawa-Chopin";
 if(code==="WMI")return "Warszawa-Modlin";
 return cityLabel(city);
}
export function departureHeading(city:string,code:string):string {
 const genitive:Record<string,string>={WRO:"Wrocławia",WAW:"Warszawy-Chopina",WMI:"Warszawy-Modlina",POZ:"Poznania",KRK:"Krakowa",GDN:"Gdańska",KTW:"Katowic",LCJ:"Łodzi",RZE:"Rzeszowa",SZZ:"Szczecina",BZG:"Bydgoszczy",LUZ:"Lublina",IEG:"Zielonej Góry",SZY:"Olsztyna"};
 return genitive[code] ? `Loty z ${genitive[code]} (${code})` : `Loty — ${originLabel(city,code)} (${code})`;
}
