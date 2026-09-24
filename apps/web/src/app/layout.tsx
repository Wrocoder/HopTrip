import type {Metadata} from "next";
import {Suspense} from "react";
import Link from "next/link";
import localFont from "next/font/local";
import {pl} from "../lib/pl";
import {PageTracker} from "./components/deal-view-tracker";
import {SiteNav} from "./components/site-nav";
import "./globals.css";
const bodyFont=localFont({src:"./fonts/DMSans.woff2",variable:"--font-body",display:"swap",weight:"100 1000"});
const headingFont=localFont({src:"./fonts/Fraunces.woff2",variable:"--font-heading",display:"swap",weight:"100 900"});
export const metadata:Metadata = {
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title:pl.title,description:pl.description,alternates:{canonical:"/"},
  openGraph:{title:pl.title,description:pl.description,locale:"pl_PL",type:"website"},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="pl" data-scroll-behavior="smooth" className={`${bodyFont.variable} ${headingFont.variable}`}><body>
    <a className="skip-link" href="#content">Przejdź do treści</a>
    <header className="page-shell site-header"><Link className="brand" href="/" aria-label="HopTrip — strona główna"><span className="brand-mark" aria-hidden="true">↗</span>HopTrip<span className="brand-dot" aria-hidden="true">.</span></Link>
    <SiteNav/></header>
    <Suspense fallback={null}><PageTracker/></Suspense><div id="content" tabIndex={-1}>{children}</div>
    <footer className="page-shell site-footer"><div className="footer-intro"><span className="brand">HopTrip.</span><p>{pl.disclosure}</p></div><nav className="footer-nav" aria-label="Informacje o serwisie">
      {(["about","contact","privacy","terms","partners"] as const).map(key=><Link key={key} href={`/info/${key}`}>{pl[key]}</Link>)}
    </nav></footer></body></html>;
}
