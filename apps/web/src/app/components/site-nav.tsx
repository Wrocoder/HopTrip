"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useSyncExternalStore} from 'react';
import {useLocale} from "./locale-provider";
import {navigation,activeNavigation} from "../../lib/i18n/navigation";
import {localizedHref,availableHref,pageLocales} from "../../lib/i18n/routing";
import {shell} from "../../lib/i18n/shell";

function subscribeHash(change:()=>void){
 window.addEventListener('hashchange',change);window.addEventListener('popstate',change);
 return ()=>{window.removeEventListener('hashchange',change);window.removeEventListener('popstate',change);};
}
const hashSnapshot=()=>window.location.hash;
const serverHash=()=>'';

export function SiteNav() {
 const pathname=usePathname();
 const {locale}=useLocale();
 const hash=useSyncExternalStore(subscribeHash,hashSnapshot,serverHash);
 const labels=navigation[locale];
 const NavLink=locale==="pl" ? Link : "a";
 const currentPath=localizedHref(pathname,"pl");
 const active=activeNavigation(currentPath,hash);
 const links=[
  {href:"/deals",label:labels.flights},
  {href:"/tanie-loty-na-weekend",label:labels.weekend},
  {href:"/destinations",label:labels.destinations},
  {href:"/saved",label:labels.saved},
  {href:"/info/trip-budget",label:labels.budget},
 ];
 return <nav className="site-nav" aria-label={labels.main}>{links.map(link=>{
  // Native anchor navigation emits hashchange, including same-page jumps.
  const Item=link.href.includes('#') ? 'a' : NavLink;
  return <Item key={link.href} href={availableHref(link.href,locale)} aria-current={active===link.href ? currentPath===link.href ? 'page' : 'location' : undefined}>{link.label}{!pageLocales(link.href).includes(locale) && ` (${shell[locale].polish})`}</Item>;
 })}</nav>;
}
