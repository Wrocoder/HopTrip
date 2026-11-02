import Link from "next/link";
import {requestLocale} from "../../lib/i18n/server";
import {getMessages} from "../../lib/i18n/messages";
import {localizedHref} from "../../lib/i18n/routing";
import {OfferState} from '../components/offer-state';
import {stateText} from '../../lib/i18n/state-copy';
export const metadata={robots:{index:false,follow:true},alternates:{canonical:null},openGraph:null,twitter:null};
export default async function LocalizedNotFound() {
 const locale=await requestLocale(),text=getMessages(locale);
 return <main className="page-shell"><OfferState kind="unavailable" heading="h1" title={text.notFound} actions={<Link prefetch={false} href={localizedHref('/deals',locale)}>{stateText(locale,'Wróć do katalogu lotów')}</Link>}><p>{stateText(locale,'Ta strona lub oferta nie jest dostępna. Sprawdź aktualny katalog.')}</p></OfferState></main>;
}
