/* eslint-disable @next/next/no-html-link-for-pages -- Cross-language navigation reloads the root html language and locale context. */
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {isLocale,locales,openGraphLocales} from "../../../../lib/i18n/config";
import {localizedHref,languageAlternates} from "../../../../lib/i18n/routing";
import {budgetText} from "../../../../lib/i18n/budget-copy";
import {shell} from "../../../../lib/i18n/shell";
import {TripBudgetCalculator} from "../../../components/trip-budget-calculator";
type Props={params:Promise<{locale:string}>};
async function language(params:Props["params"]) {
 const {locale}=await params;
 if(!isLocale(locale) || locale==="pl")notFound();
 return locale;
}
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const locale=await language(params);
 const title=budgetText(locale,"Kalkulator budżetu podróży")+" | HopTrip";
 const description=shell[locale].budgetIntro;
 const url=localizedHref("/info/trip-budget",locale);
 return {title,description,alternates:{canonical:url,languages:languageAlternates("/info/trip-budget",locales)},
  robots:{index:true,follow:true},openGraph:{title,description,url,locale:openGraphLocales[locale],type:"website"},
  twitter:{card:"summary",title,description}};
}
export default async function LocalizedBudgetPage({params}:Props) {
 const locale=await language(params),text=shell[locale];
 return <main className="page-shell"><header className="page-heading">
  <h1>{budgetText(locale,"Kalkulator budżetu podróży")}</h1><p>{text.budgetIntro}</p>
 </header><TripBudgetCalculator/>
 <p><a href="/info/trip-budget" hrefLang="pl">{text.polishGuide}</a></p>
 <p><a href={localizedHref("/deals",locale)}>{text.back}</a></p></main>;
}
