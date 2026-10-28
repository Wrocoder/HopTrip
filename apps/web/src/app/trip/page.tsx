import {openGraphLocales,type Locale} from "../../lib/i18n/config";
import {localizedHref} from "../../lib/i18n/routing";
import {tripText,type TripKey} from "../../lib/i18n/trip-copy";
import {TripNavigation} from "../components/trip-navigation";
import {TripDraftProvider} from "../components/trip-draft";
import {TripAccommodation} from "../components/trip-accommodation";
import {TripEvents} from "../components/trip-events";
import {activitiesForDestination} from "../../lib/destination-activities";
import type {Metadata} from "next";
import Link from "next/link";
import {decodeTrip,tripPath} from "../../lib/shared-trip";
import {getDeal} from "../../lib/api";
import {date,money,dateTime} from "../../lib/i18n/format";
import {cityLabel} from "../../lib/cities";
import {TripBudgetCalculator} from "../components/trip-budget-calculator";
import {FlightSchedule} from "../components/flight-schedule";
type Props={searchParams:Promise<{plan?:string|string[]}>;locale?:Locale};
export async function generateMetadata({searchParams,locale="pl"}:Props):Promise<Metadata> {
 const t=(source:TripKey)=>tripText(locale,source);
 const {plan}=await searchParams;
 const trip=decodeTrip(plan);
 const title=trip ? `${cityLabel(trip.offer.origin,undefined,locale)} → ${cityLabel(trip.offer.destination,undefined,locale)} — ${t("zapisany plan")} | HopTrip` : `${t("Nieprawidłowy plan")} | HopTrip`;
 const description=trip ? `${t("Plan pobytu:")} ${trip.draft.start ? date(trip.draft.start,locale) : t("daty nieustalone")}${trip.draft.end ? ` – ${date(trip.draft.end,locale)}` : ""}. ${t("Kopia planu podróży; ceny i dostępność wymagają ponownej weryfikacji.")}` : t("Poproś nadawcę o nowy link do planu.");
 return {title,description,robots:{index:false,follow:false},referrer:"no-referrer",alternates:{canonical:localizedHref("/trip",locale)},
  openGraph:{title,description,type:"website",locale:openGraphLocales[locale],url:trip ? localizedHref(tripPath(plan as string),locale) : localizedHref("/trip",locale),images:[]},
  twitter:{card:"summary",title,description,images:[]}};
}
export default async function SharedTripPage({searchParams,locale="pl"}:Props) {
 const t=(source:TripKey)=>tripText(locale,source);
 const {plan}=await searchParams;
 const trip=decodeTrip(plan);
 if(!trip)return <main className="page-shell"><h1>{t("Nie można odczytać planu")}</h1><p>{t("Link jest niepełny, uszkodzony lub pochodzi z nieobsługiwanej wersji. Poproś nadawcę o nowy link.")}</p><Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link></main>;
 const {offer,draft}=trip;
 let current=null;
 let failed=false;
 try{current=await getDeal(offer.slug);}catch{failed=true;}
 const expired=Boolean(offer.start && offer.start<new Date().toISOString().slice(0,10));
 return <main className="page-shell"><h1>{cityLabel(offer.origin,undefined,locale)} → {cityLabel(offer.destination,undefined,locale)}</h1>
  <TripNavigation hasAccommodation={Boolean(current && !expired)} hasEvents={Boolean(current && !expired && current.events_supported)} locale={locale}/>
  <section id="trip-flight" tabIndex={-1} aria-label={t("Lot zapisany w planie")}>
  <p>{t("Kopia zapisanego planu. Twoje zmiany nie zmieniają planu autora ani treści otrzymanego linku.")}</p>
  <p>{t("Plan zapisany w otrzymanym linku:")} {draft.start ? date(draft.start,locale) : t("daty nieustalone")}{draft.end && ` – ${date(draft.end,locale)}`}. {t("Liczba osób w linku:")} {draft.input.people}. {t("Swoje zmiany wprowadź w kalkulatorze poniżej.")}</p>
  <p>{t("Zapisana cena lotu na osobę:")} {offer.price ? money(offer.price,locale) : t("nieznana")}. {t("Daty zapisanej oferty:")} {offer.start ? date(offer.start,locale) : t("nieznane")}{offer.end && ` – ${date(offer.end,locale)}`}.</p>
  <details><summary>{t("Pochodzenie zapisanej ceny")}</summary><p>{t("Obserwacja ceny:")} {offer.observedAt ? dateTime(offer.observedAt,locale) : t("czas nieznany")}. {t("Dane w linku pochodzą z planu nadawcy; nie potwierdzają aktualnej ceny ani dostępności.")}</p></details>
  <p role="status">{expired ? t("Termin zapisanej oferty już minął. Zachowaliśmy plan i budżet; wybierz nowe daty i sprawdź ceny ponownie.") : failed ? t("Nie udało się sprawdzić oferty. Plan pozostaje dostępny; spróbuj sprawdzić ofertę później.") : !current ? t("Ta oferta nie jest już dostępna w katalogu. Zapisany plan i budżet pozostają dostępne.") : t("Oferta jest w katalogu, ale zapisane ceny i daty mogą się różnić. Sprawdź aktualne warunki u partnera.")}</p>
  {current && !expired && <Link href={localizedHref(`/deals/${offer.slug}`,locale)}>{t("Sprawdź ofertę w katalogu")}</Link>}
  {current && !expired ? <section aria-label={t("Rozkład aktualnej oferty")}><h2>{t("Rozkład aktualnej oferty")}</h2><p>{t("To rozkład oferty w katalogu, nie potwierdzenie dat zmienionych w twoim planie pobytu. Nie zmienia noclegów ani zapisanych kwot.")}</p><FlightSchedule deal={current} compact locale={locale}/><details><summary>{t("Pełny rozkład i strefy czasowe")}</summary><FlightSchedule deal={current} locale={locale}/></details></section> : <p>{t("Brak aktualnego rozkładu. Daty planu pobytu nie potwierdzają daty powrotu do domu.")}</p>}
  </section>
  <TripDraftProvider key={plan as string} tripId={`copy:${plan}`} initialInput={draft.input} initialEvents={draft.events} start={draft.start} end={draft.end} adultsOnly={draft.adultsOnly===true} forceReview>
  {current && !expired && <TripAccommodation deal={current}/>}
  <TripBudgetCalculator key={plan as string} tripId={`copy:${plan}`} initialInput={draft.input} start={draft.start} end={draft.end} shareOffer={offer} forceReview/>
  {current && !expired && <TripEvents key={`events-copy-${offer.slug}`} deal={current} locale={locale} activitiesHref={activitiesForDestination(current.destination_slug)?localizedHref(`/deals/${current.slug}#destination-activities`,locale):undefined}/>}
  </TripDraftProvider>
  <Link href={localizedHref("/saved",locale)}>{t("Zapisane wyjazdy")}</Link>
 </main>;
}
