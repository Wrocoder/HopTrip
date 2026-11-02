"use client";
import {useLocale} from "./components/locale-provider";
import Link from 'next/link';
import {OfferState} from './components/offer-state';
import {stateText} from '../lib/i18n/state-copy';
import {localizedHref} from '../lib/i18n/routing';
export default function ErrorPage({reset}:{reset:()=>void}) {
  const {locale,messages:pl}=useLocale();
  return <main className="page-shell"><OfferState kind="error" heading="h1" title={stateText(locale,'Nie udało się wczytać strony')} actions={<><button type="button" onClick={reset}>{pl.retry}</button><Link prefetch={false} href={localizedHref('/deals',locale)}>{stateText(locale,'Wróć do katalogu lotów')}</Link></>}><p>{stateText(locale,'Spróbuj ponownie lub przejdź do katalogu.')}</p></OfferState></main>;
}
