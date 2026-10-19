import type {Metadata} from "next";
import {Suspense} from "react";
import Link from "next/link";
import localFont from "next/font/local";
import {pl} from "../lib/pl";
import {openGraphLocales} from "../lib/i18n/config";
import {requestLocale} from "../lib/i18n/server";
import {shell} from "../lib/i18n/shell";
import {LanguageSwitcher} from "./components/language-switcher";
import {getMessages} from "../lib/i18n/messages";
import {LocaleProvider} from "./components/locale-provider";
import {PageTracker} from "./components/deal-view-tracker";
import {SiteNav} from "./components/site-nav";
import {ConsentControls} from "./components/consent-controls";
import "./globals.css";
const bodyFont=localFont({src:"./fonts/DMSans.woff2",variable:"--font-body",display:"swap",weight:"100 1000"});
const headingFont=localFont({src:"./fonts/Fraunces.woff2",variable:"--font-heading",display:"swap",weight:"100 900"});
// Public Drive code supplied by the owner for the hoptrip.pl Travelpayouts project.
const driveEnabled=process.env.NEXT_PUBLIC_SITE_URL==="https://hoptrip.pl";
const polishMetadata:Metadata = {
  metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title:pl.title,description:pl.description,
  openGraph:{title:pl.title,description:pl.description,url:"/",locale:"pl_PL",type:"website",images:[{url:"/preview/site/home",width:1200,height:630,alt:pl.title}]},
  twitter:{card:"summary_large_image",title:pl.title,description:pl.description,images:["/preview/site/home"]},
};
export async function generateMetadata():Promise<Metadata> {
 const locale=await requestLocale();
 if(locale==="pl")return polishMetadata;
 const text=getMessages(locale);
 return {metadataBase:polishMetadata.metadataBase,title:text.title,description:text.description,openGraph:{title:text.title,description:text.description,locale:openGraphLocales[locale],type:"website"},twitter:{card:"summary",title:text.title,description:text.description}};
}
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  const locale=await requestLocale(),text=getMessages(locale),labels=shell[locale];
  const suffix=locale==="pl" ? "" : ` (${labels.polish})`;
  const NavLink=locale==="pl" ? Link : "a";
  return <html lang={locale} data-scroll-behavior="smooth" className={`${bodyFont.variable} ${headingFont.variable}`}>
    <head>
      {/* Impact requires its supplied value attribute instead of standard meta content. */}
      <meta {...{name:"impact-site-verification",value:"a24efacb-dac8-4a2c-9372-ea05112f3b24"}} />
    </head>
    <body><LocaleProvider locale={locale} messages={getMessages(locale)}>
    <a className="skip-link" href="#content">{labels.skip}</a>
    <header className="page-shell site-header"><NavLink className="brand" href="/" aria-label={labels.home+suffix}><span className="brand-mark" aria-hidden="true">↗</span>HopTrip<span className="brand-dot" aria-hidden="true">.</span></NavLink>
    <SiteNav/><Suspense fallback={null}><LanguageSwitcher/></Suspense></header>
    <div id="privacy-panel" className="page-shell"/>
    <Suspense fallback={null}><PageTracker/></Suspense><div id="content" tabIndex={-1}>{children}</div>
    <footer className="page-shell site-footer"><div className="footer-intro"><span className="brand">HopTrip.</span><p>{text.disclosure}</p></div><nav className="footer-nav" aria-label={labels.info}>
      <NavLink href="/city-break">City break{suffix}</NavLink><NavLink href="/tanie-loty-na-weekend">{labels.weekend}{suffix}</NavLink><NavLink href="/from/warszawa">{labels.warsaw}{suffix}</NavLink>
      <NavLink href="/saved">{labels.saved}{suffix}</NavLink>
      <NavLink href="/alerts">{labels.alerts}{suffix}</NavLink>
      {(["about","contact","privacy","terms","partners"] as const).map(key=>
        ["contact","privacy","terms"].includes(key) ? <a key={key} href={`/info/${key}`}>{text[key]}{suffix}</a> :
        <NavLink key={key} href={`/info/${key}`}>{text[key]}{suffix}</NavLink>)}
    </nav><ConsentControls driveEnabled={driveEnabled}/></footer></LocaleProvider></body></html>;
}
