export const locales=["pl","ru","en","uk"] as const;
export type Locale=typeof locales[number];
export const defaultLocale:Locale="pl";
export const localeNames:Record<Locale,string>={pl:"Polski",ru:"Русский",en:"English",uk:"Українська"};
export const intlLocales:Record<Locale,string>={pl:"pl-PL",ru:"ru-RU",en:"en-GB",uk:"uk-UA"};
export const openGraphLocales:Record<Locale,string>={pl:"pl_PL",ru:"ru_RU",en:"en_GB",uk:"uk_UA"};
export function isLocale(value:unknown):value is Locale {
 return typeof value==="string" && (locales as readonly string[]).includes(value);
}
// Enable routes only when their entire journey, consent UI and metadata are translated.
export const publishedLocales:readonly Locale[]=["pl"];
