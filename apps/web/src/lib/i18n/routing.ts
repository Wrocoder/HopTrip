import {defaultLocale,isLocale,publishedLocales,locales,type Locale} from "./config.ts";

export const translatedPaths=["/info/trip-budget"] as const;
export function pageLocales(path:string):readonly Locale[] {
 return (translatedPaths as readonly string[]).includes(localizedHref(path,"pl").split(/[?#]/)[0]) ? locales : publishedLocales;
}
export function availableHref(href:string,locale:Locale):string {
 return localizedHref(href,pageLocales(href).includes(locale) ? locale : "pl");
}
export function pathLocale(path:string):Locale {
 const prefix=path.split("/")[1];
 return isLocale(prefix) && pageLocales(path).includes(prefix) ? prefix : "pl";
}

// Pure URL preparation; no rewrites or redirects are enabled before page translation.
export function localizedHref(href:string,locale:Locale):string {
 if(!href.startsWith("/") || href.startsWith("//") || /[\\\u0000-\u0020]/.test(href))throw new Error("Expected a local URL");
 const match=href.match(/^([^?#]*)(.*)$/)!;
 let path=match[1];
 const prefix=path.split("/")[1];
 if(isLocale(prefix))path=path.slice(prefix.length+1) || "/";
 return (locale===defaultLocale ? path : `/${locale}${path==="/" ? "" : path}`)+match[2];
}

export function languageAlternates(path:string,available:readonly Locale[]=publishedLocales):Record<string,string> {
 const result:Record<string,string>={};
 for(const locale of available) result[locale]=localizedHref(path,locale);
 if(available.includes(defaultLocale))result["x-default"]=localizedHref(path,defaultLocale);
 return result;
}
