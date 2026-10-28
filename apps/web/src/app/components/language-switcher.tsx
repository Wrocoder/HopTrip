"use client";
import {usePathname,useSearchParams} from "next/navigation";
import {useLocale} from "./locale-provider";
import {localizedHref,pageLocales} from "../../lib/i18n/routing";
import {localeNames} from "../../lib/i18n/config";
import {shell} from "../../lib/i18n/shell";

export function LanguageSwitcher() {
 const pathname=usePathname(),query=useSearchParams();
 const {locale}=useLocale();
 const available=pageLocales(pathname);
 if(available.length<2)return null;
 return <nav className="language-switcher" aria-label={shell[locale].language}>
  {available.map(language=><a key={language} lang={language} hrefLang={language}
   href={localizedHref(pathname+(query.size ? `?${query}` : ""),language)}
   aria-current={language===locale ? "page" : undefined}
   onClick={event=>{const url=new URL(event.currentTarget.href);url.hash=location.hash;event.currentTarget.href=url.href;}}>{localeNames[language]}</a>)}
 </nav>;
}
