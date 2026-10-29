import type {Metadata} from "next";
import {catalogPage,type CatalogPage} from "../catalog-pages";
import {openGraphLocales,type Locale} from "./config";
import {availableHref,languageAlternates,localizedHref,pageLocales} from "./routing";
import {shell} from "./shell";
import {catalogText} from "./catalog-copy";
import translations from "./landing-copy.json";

export const landingPaths=Object.keys(translations);
export function landingPage(path:string,locale:Locale):CatalogPage|undefined {
 const original=catalogPage(path);
 if(locale==="pl" || !original)return original;
 if(!Object.hasOwn(translations,path))return undefined;
 const translated=translations[path as keyof typeof translations][locale];
 return {...original,...translated,links:original.links.map((link,index)=>({
  href:availableHref(link.href,locale),
  label:translated.labels[index]+(pageLocales(link.href).includes(locale) ? "" : ` (${shell[locale].polish})`),
 }))};
}

export function landingMetadata(metadata:Metadata,path:string,locale:Locale):Metadata {
 const page=landingPage(path,locale);
 if(!page)return metadata;
 const canonical=localizedHref(String(metadata.alternates?.canonical ?? path),locale);
 const title=locale==="pl" ? metadata.title : metadata.title==="Wyniki wyszukiwania lotów | HopTrip" ? catalogText(locale,"Wyniki wyszukiwania lotów | HopTrip") : page.title;
 const description=locale==="pl" ? metadata.description : page.description;
 return {...metadata,title,description,alternates:{canonical,languages:languageAlternates(canonical,pageLocales(path))},
  openGraph:{...metadata.openGraph,title:String(title),description:description??undefined,url:canonical,locale:openGraphLocales[locale],...(locale!=="pl" ? {images:[]} : {})},
  twitter:{...metadata.twitter,title:String(title),description:description??undefined,...(locale!=="pl" ? {card:"summary" as const,images:[]} : {})}};
}

const ui={
 "Zaplanuj podróż":["Plan your trip","Спланируйте поездку","Сплануйте подорож"],
 "Oferty lotów z Wrocławia":["Flight offers from Wrocław","Предложения перелётов из Вроцлава","Пропозиції перельотів із Вроцлава"],
 "Ceny pochodzą z zapisanych obserwacji. Sprawdź datę odświeżenia i zakres lotu; dostępność oraz końcową cenę potwierdzisz u sprzedawcy.":["Prices come from saved observations. Check when the price was refreshed and what the flight covers; confirm availability and the final price with the seller.","Цены взяты из сохранённых наблюдений. Проверьте дату обновления и состав перелёта; наличие и итоговую цену уточните у продавца.","Ціни взято зі збережених спостережень. Перевірте дату оновлення та склад перельоту; наявність і остаточну ціну уточніть у продавця."],
 "Wybierz długość pobytu":["Choose your stay length","Выберите длительность поездки","Виберіть тривалість подорожі"],
 "Loty na 2–4 noce":["Flights for 2–4 nights","Перелёты на 2–4 ночи","Перельоти на 2–4 ночі"],
 "Loty na weekend":["Weekend flights","Перелёты на выходные","Перельоти на вихідні"],
} as const;
export function landingText(locale:Locale,source:keyof typeof ui) {
 return locale==="pl" ? source : ui[source][({en:0,ru:1,uk:2} as const)[locale]];
}
