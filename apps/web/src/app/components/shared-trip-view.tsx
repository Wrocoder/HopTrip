'use client';
import {type Locale} from "../../lib/i18n/config";
import {localizedHref} from "../../lib/i18n/routing";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {TripNavigation} from "./trip-navigation";
import {TripDraftProvider} from "./trip-draft";
import {TripAccommodation} from "./trip-accommodation";
import {TripEvents} from "./trip-events";
import {activitiesForDestination} from "../../lib/destination-activities";
import Link from "next/link";
import type {SharedTrip} from "../../lib/shared-trip";
import type {Deal} from "../../lib/api";
import {date,money,dateTime} from "../../lib/i18n/format";
import {cityLabel} from "../../lib/cities";
import {TripBudgetCalculator} from "./trip-budget-calculator";
import {FlightSchedule} from "./flight-schedule";
import {sharePrivacyCopy} from "../../lib/i18n/share-privacy-copy";
import {savedOfferChanged,type PlanBase} from '../../lib/plan-editor';
import {planEditorCopy} from '../../lib/i18n/plan-editor-copy';
import {offerDeadline} from '../../lib/offer-expiry';
import {savedTripCopy} from '../../lib/i18n/saved-trip-copy';
import {useOfferExpired} from './use-offer-expired';
export function InvalidSharedTrip({locale}:{locale:Locale}){const t=(source:TripKey)=>tripText(locale,source);return <main className="page-shell"><h1>{t("Nie można odczytać planu")}</h1><p>{t("Link jest niepełny, uszkodzony lub pochodzi z nieobsługiwanej wersji. Poproś nadawcę o nowy link.")}</p><Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link></main>;}
export function SharedTripView({trip,token,current,failed,checking=false,locale,localPlan}:{trip:SharedTrip;token:string;current:Deal|null;failed:boolean;checking?:boolean;locale:Locale;localPlan?:PlanBase}){
 const t=(source:TripKey)=>tripText(locale,source),loading=sharePrivacyCopy[locale].checking;
 const {offer,draft}=trip;
 const deadline=current&&offerDeadline(current);
 const currentExpired=useOfferExpired(deadline);
 const expired=Boolean(offer.start&&offer.start<new Date().toISOString().slice(0,10)||currentExpired);
 const changed=savedOfferChanged(offer,current),editor=planEditorCopy[locale];
 return <main className="page-shell"><h1>{cityLabel(offer.origin,undefined,locale)} → {cityLabel(offer.destination,undefined,locale)}</h1>
  <TripNavigation hasAccommodation={Boolean(current && !expired)} hasEvents={Boolean(current && !expired && current.events_supported)} locale={locale}/>
  <section id="trip-flight" tabIndex={-1} aria-label={t("Lot zapisany w planie")}>
  <p>{localPlan?editor.intro:t("Kopia zapisanego planu. Twoje zmiany nie zmieniają planu autora ani treści otrzymanego linku.")}</p>
  <p>{localPlan?editor.summary:t("Plan zapisany w otrzymanym linku:")} {draft.start ? date(draft.start,locale) : t("daty nieustalone")}{draft.end && ` – ${date(draft.end,locale)}`}. {localPlan?savedTripCopy[locale].people:t("Liczba osób w linku:")} {draft.input.people}. {t("Swoje zmiany wprowadź w kalkulatorze poniżej.")}</p>
  <p>{t("Zapisana cena lotu na osobę:")} {offer.price ? money(offer.price,locale) : t("nieznana")}. {t("Daty zapisanej oferty:")} {offer.start ? date(offer.start,locale) : t("nieznane")}{offer.end && ` – ${date(offer.end,locale)}`}.</p>
  <details><summary>{t("Pochodzenie zapisanej ceny")}</summary><p>{t("Obserwacja ceny:")} {offer.observedAt ? dateTime(offer.observedAt,locale) : t("czas nieznany")}. {t("Dane w linku pochodzą z planu nadawcy; nie potwierdzają aktualnej ceny ani dostępności.")}</p></details>
  <p role="status">{expired ? t("Termin zapisanej oferty już minął. Zachowaliśmy plan i budżet; wybierz nowe daty i sprawdź ceny ponownie.") : checking ? loading : failed ? t("Nie udało się sprawdzić oferty. Plan pozostaje dostępny; spróbuj sprawdzić ofertę później.") : !current ? t("Ta oferta nie jest już dostępna w katalogu. Zapisany plan i budżet pozostają dostępne.") : t("Oferta jest w katalogu, ale zapisane ceny i daty mogą się różnić. Sprawdź aktualne warunki u partnera.")}</p>
  {current && !expired && <Link href={localizedHref(`/deals/${offer.slug}`,locale)}>{t("Sprawdź ofertę w katalogu")}</Link>}
  {current && !expired ? <section aria-label={t("Rozkład aktualnej oferty")}><h2>{t("Rozkład aktualnej oferty")}</h2><p>{t("To rozkład oferty w katalogu, nie potwierdzenie dat zmienionych w twoim planie pobytu. Nie zmienia noclegów ani zapisanych kwot.")}</p><FlightSchedule deal={current} compact locale={locale}/><details><summary>{t("Pełny rozkład i strefy czasowe")}</summary><FlightSchedule deal={current} locale={locale}/></details></section> : !checking&&<p>{t("Brak aktualnego rozkładu. Daty planu pobytu nie potwierdzają daty powrotu do domu.")}</p>}
  </section>
  {changed&&!expired&&!checking&&<p role="status" data-testid="saved-offer-changed">{editor.changed}</p>}
  <TripDraftProvider key={localPlan?.id??token} tripId={`copy:${token}`} localPlan={localPlan} legacyCopyToken={localPlan?token:undefined} initialInput={draft.input} initialEvents={draft.events} initialProvenance={draft.provenance} initialEstimates={draft.estimates} start={draft.start} end={draft.end} adultsOnly={draft.adultsOnly===true} forceReview>
  {current && !expired && <TripAccommodation deal={current}/>}
  <TripBudgetCalculator key={token} tripId={`copy:${token}`} initialInput={draft.input} start={draft.start} end={draft.end} shareOffer={offer} forceReview/>
  {current && !expired && <TripEvents key={`events-copy-${offer.slug}`} deal={current} locale={locale} activitiesHref={activitiesForDestination(current.destination_slug)?localizedHref(`/deals/${current.slug}#destination-activities`,locale):undefined}/>}
  </TripDraftProvider>
  <Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link>
 </main>;
}
