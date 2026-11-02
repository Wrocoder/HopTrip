import type {Locale} from "../../lib/i18n/config";
import {getMessages} from "../../lib/i18n/messages";
import Link from 'next/link';
import {OfferState} from './offer-state';
import {stateText} from '../../lib/i18n/state-copy';
import {localizedHref} from '../../lib/i18n/routing';
export default function LoadingDeals({locale="pl"}:{locale?:Locale}) {
  return <main className="page-shell"><OfferState kind="loading" heading="h1" title={getMessages(locale).loading} actions={<Link prefetch={false} href={localizedHref('/',locale)}>{getMessages(locale).home}</Link>}><p>{stateText(locale,'Pobieramy oferty. Warunki wyszukiwania pozostają w adresie strony.')}</p></OfferState></main>;
}
