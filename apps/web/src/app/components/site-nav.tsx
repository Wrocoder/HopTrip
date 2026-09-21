"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {pl} from "../../lib/pl";

export function SiteNav() {
 const pathname=usePathname();
 const links=[
  {href:"/deals",label:pl.deals,active:["/deals","/from","/destinations"].some(path=>pathname===path || pathname.startsWith(path+"/"))},
  {href:"/info",label:"Jak działa HopTrip",active:pathname==="/info" || pathname.startsWith("/info/")},
 ];
 return <nav className="site-nav" aria-label="Nawigacja główna">{links.map(link=>
  <Link key={link.href} href={link.href} aria-current={pathname===link.href ? "page" : link.active ? "location" : undefined}>{link.label}</Link>
 )}</nav>;
}
