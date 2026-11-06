import {openGraphLocales,type Locale} from "../../lib/i18n/config";
import {localizedHref} from "../../lib/i18n/routing";
import type {Metadata} from "next";
import {decodeTrip} from "../../lib/shared-trip";
import {getDeal} from "../../lib/api";
import {SharedTripView,InvalidSharedTrip} from "../components/shared-trip-view";
import {FragmentTrip} from "../components/fragment-trip";
import {sharePrivacyCopy} from "../../lib/i18n/share-privacy-copy";
type Props={searchParams:Promise<{plan?:string|string[]}>;locale?:Locale};
export async function generateMetadata({locale="pl"}:Props):Promise<Metadata>{
 const copy=sharePrivacyCopy[locale],title=copy.title+' | HopTrip',description=copy.description,url=localizedHref('/trip',locale);
 return {title,description,robots:{index:false,follow:false},referrer:'no-referrer',alternates:{canonical:url},
  openGraph:{title,description,type:'website',locale:openGraphLocales[locale],url,images:[]},twitter:{card:'summary',title,description,images:[]}};
}
export default async function SharedTripPage({searchParams,locale="pl"}:Props){
 const {plan}=await searchParams;
 if(plan===undefined)return <FragmentTrip locale={locale}/>;
 // Legacy query links remain readable, including without client-side decoding.
 const trip=decodeTrip(plan);
 if(!trip)return <InvalidSharedTrip locale={locale}/>;
 let current=null,failed=false;
 try{current=await getDeal(trip.offer.slug);}catch{failed=true;}
 return <SharedTripView trip={trip} token={plan as string} current={current} failed={failed} locale={locale}/>;
}
