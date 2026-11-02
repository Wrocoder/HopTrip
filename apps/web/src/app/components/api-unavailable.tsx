import Link from 'next/link';
import type {Locale} from '../../lib/i18n/config';
import {localizedHref} from '../../lib/i18n/routing';
import {getMessages} from '../../lib/i18n/messages';
import {stateText} from '../../lib/i18n/state-copy';
import {OfferState} from './offer-state';

export function ApiUnavailable({locale,path}:{locale:Locale;path:string}){
 return <main className="page-shell"><OfferState kind="error" heading="h1" title={stateText(locale,'Nie udało się wczytać strony')}
  actions={<><a href={localizedHref(path,locale)}>{getMessages(locale).retry}</a><Link prefetch={false} href={localizedHref('/deals',locale)}>{stateText(locale,'Wróć do katalogu lotów')}</Link></>}>
  <p>{stateText(locale,'Spróbuj ponownie lub przejdź do katalogu.')}</p>
 </OfferState></main>;
}
