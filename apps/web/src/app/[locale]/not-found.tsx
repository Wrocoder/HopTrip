import Link from "next/link";
import {requestLocale} from "../../lib/i18n/server";
import {getMessages} from "../../lib/i18n/messages";
import {localizedHref} from "../../lib/i18n/routing";
export const metadata={robots:{index:false,follow:true},alternates:{canonical:null},openGraph:null,twitter:null};
export default async function LocalizedNotFound() {
 const locale=await requestLocale(),text=getMessages(locale);
 return <main className="page-shell"><div className="state-panel"><p className="eyebrow">HopTrip · 404</p>
  <h1>{text.notFound}</h1><Link className="button" href={localizedHref("/deals",locale)}>{text.deals}</Link>
 </div></main>;
}
