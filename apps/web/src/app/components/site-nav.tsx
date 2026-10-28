"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useLocale} from "./locale-provider";
import {navigation} from "../../lib/i18n/navigation";
import {localizedHref,availableHref,pageLocales} from "../../lib/i18n/routing";
import {shell} from "../../lib/i18n/shell";

export function SiteNav() {
 const pathname=usePathname();
 const {locale,messages}=useLocale();
 const labels=navigation[locale];
 const NavLink=locale==="pl" ? Link : "a";
 const currentPath=localizedHref(pathname,"pl");
 const links=[
  {href:"/deals",label:messages.deals,active:["/deals","/from","/destinations"].some(path=>currentPath===path || currentPath.startsWith(path+"/"))},
  {href:"/saved",label:labels.saved,active:currentPath==="/saved"},
  {href:"/info/trip-budget",label:labels.budget,active:currentPath==="/info/trip-budget"},
  {href:"/info",label:labels.howItWorks,active:(currentPath==="/info" || currentPath.startsWith("/info/")) && currentPath!=="/info/trip-budget"},
 ];
 return <nav className="site-nav" aria-label={labels.main}>{links.map(link=>
  <NavLink key={link.href} href={availableHref(link.href,locale)} aria-current={currentPath===link.href ? "page" : link.active ? "location" : undefined}>{link.label}{!pageLocales(link.href).includes(locale) && ` (${shell[locale].polish})`}</NavLink>
 )}</nav>;
}
