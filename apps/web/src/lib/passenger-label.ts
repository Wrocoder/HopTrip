import {intlLocales,type Locale} from "./i18n/config.ts";
import {tripText} from "./i18n/trip-copy.ts";
/** Accusative phrase for the instruction “U partnera ustaw …”. */
export function passengerInstruction(people:string,adultsOnly:boolean,locale:Locale="pl") {
 if(!/^[1-9]\d*$/.test(people) || Number(people)>50)return tripText(locale,"U partnera ustaw skład grupy.");
 const n=Number(people);
 if(locale!=="pl"){
  const category=new Intl.PluralRules(intlLocales[locale]).select(n);
  const one=category==="one",few=category==="few";
  if(locale==="en")return `Set ${n} ${adultsOnly ? one ? "adult" : "adults" : one ? "person" : "people"} with the partner.${adultsOnly ? "" : " Check adults and children."}`;
  if(locale==="ru")return `Укажите у партнёра ${n} ${adultsOnly ? one ? "взрослого" : "взрослых" : one || few ? "человека" : "человек"}.${adultsOnly ? "" : " Проверьте взрослых и детей."}`;
  return `Вкажіть у партнера ${n} ${adultsOnly ? one ? "дорослого" : "дорослих" : one ? "людину" : few ? "людини" : "людей"}.${adultsOnly ? "" : " Перевірте дорослих і дітей."}`;
 }
 const label=adultsOnly ? (n===1 ? "dorosłego" : "dorosłych")
  : n===1 ? "osobę" : n%10>=2 && n%10<=4 && !(n%100>=12 && n%100<=14) ? "osoby" : "osób";
 return `U partnera ustaw ${n} ${label}.${adultsOnly ? "" : " Sprawdź dorosłych i dzieci."}`;
}
