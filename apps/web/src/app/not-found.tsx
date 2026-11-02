import Link from "next/link";
import {pl} from "../lib/pl";
import {OfferState} from './components/offer-state';
import {stateText} from '../lib/i18n/state-copy';
export const metadata={title:pl.notFound,robots:{index:false,follow:true},
  alternates:{canonical:null},openGraph:null,twitter:null};
export default function NotFound() {return <main className="page-shell"><OfferState kind="unavailable" heading="h1" title={pl.notFound} actions={<><Link prefetch={false} href="/deals">{stateText('pl','Wróć do katalogu lotów')}</Link><Link prefetch={false} href="/">{pl.home}</Link></>}><p>{stateText('pl','Ta strona lub oferta nie jest dostępna. Sprawdź aktualny katalog.')}</p></OfferState></main>;}
