import {TripNavigation} from "../components/trip-navigation";
import {TripDraftProvider} from "../components/trip-draft";
import {TripAccommodation} from "../components/trip-accommodation";
import {TripEvents} from "../components/trip-events";
import {activitiesForDestination} from "../../lib/destination-activities";
import type {Metadata} from "next";
import Link from "next/link";
import {decodeTrip,tripPath} from "../../lib/shared-trip";
import {getDeal} from "../../lib/api";
import {date,money,dateTime} from "../../lib/pl";
import {TripBudgetCalculator} from "../components/trip-budget-calculator";
import {FlightSchedule} from "../components/flight-schedule";
type Props={searchParams:Promise<{plan?:string|string[]}>};
export async function generateMetadata({searchParams}:Props):Promise<Metadata> {
 const {plan}=await searchParams;
 const trip=decodeTrip(plan);
 const title=trip ? `${trip.offer.origin} → ${trip.offer.destination} — zapisany plan | HopTrip` : "Nieprawidłowy plan | HopTrip";
 const description=trip ? `Plan pobytu: ${trip.draft.start ? date(trip.draft.start) : "daty nieustalone"}${trip.draft.end ? ` – ${date(trip.draft.end)}` : ""}. Kopia planu podróży; ceny i dostępność wymagają ponownej weryfikacji.` : "Poproś nadawcę o nowy link do planu.";
 return {title,description,robots:{index:false,follow:false},referrer:"no-referrer",alternates:{canonical:"/trip"},
  openGraph:{title,description,type:"website",url:trip ? tripPath(plan as string) : "/trip",images:[]},
  twitter:{card:"summary",title,description,images:[]}};
}
export default async function SharedTripPage({searchParams}:Props) {
 const {plan}=await searchParams;
 const trip=decodeTrip(plan);
 if(!trip)return <main className="page-shell"><h1>Nie można odczytać planu</h1><p>Link jest niepełny, uszkodzony lub pochodzi z nieobsługiwanej wersji. Poproś nadawcę o nowy link.</p><Link href="/saved">Zapisane wyjazdy</Link></main>;
 const {offer,draft}=trip;
 let current=null;
 let failed=false;
 try{current=await getDeal(offer.slug);}catch{failed=true;}
 const expired=Boolean(offer.start && offer.start<new Date().toISOString().slice(0,10));
 return <main className="page-shell"><h1>{offer.origin} → {offer.destination}</h1>
  <TripNavigation hasAccommodation={Boolean(current && !expired)} hasEvents={Boolean(current && !expired && current.events_supported)}/>
  <section id="trip-flight" tabIndex={-1} aria-label="Lot zapisany w planie">
  <p>Kopia zapisanego planu. Twoje zmiany nie zmieniają planu autora ani treści otrzymanego linku.</p>
  <p>Plan zapisany w otrzymanym linku: {draft.start ? date(draft.start) : "daty nieustalone"}{draft.end && ` – ${date(draft.end)}`}. Liczba osób w linku: {draft.input.people}. Swoje zmiany wprowadź w kalkulatorze poniżej.</p>
  <p>Zapisana cena lotu na osobę: {offer.price ? money(offer.price) : "nieznana"}. Daty zapisanej oferty: {offer.start ? date(offer.start) : "nieznane"}{offer.end && ` – ${date(offer.end)}`}.</p>
  <details><summary>Pochodzenie zapisanej ceny</summary><p>Obserwacja ceny: {offer.observedAt ? dateTime(offer.observedAt) : "czas nieznany"}. Dane w linku pochodzą z planu nadawcy; nie potwierdzają aktualnej ceny ani dostępności.</p></details>
  <p role="status">{expired ? "Termin zapisanej oferty już minął. Zachowaliśmy plan i budżet; wybierz nowe daty i sprawdź ceny ponownie." : failed ? "Nie udało się sprawdzić oferty. Plan pozostaje dostępny; spróbuj sprawdzić ofertę później." : !current ? "Ta oferta nie jest już dostępna w katalogu. Zapisany plan i budżet pozostają dostępne." : "Oferta jest w katalogu, ale zapisane ceny i daty mogą się różnić. Sprawdź aktualne warunki u partnera."}</p>
  {current && !expired && <Link href={`/deals/${offer.slug}`}>Sprawdź ofertę w katalogu</Link>}
  {current && !expired ? <section aria-label="Rozkład aktualnej oferty"><h2>Rozkład aktualnej oferty</h2><p>To rozkład oferty w katalogu, nie potwierdzenie dat zmienionych w twoim planie pobytu. Nie zmienia noclegów ani zapisanych kwot.</p><FlightSchedule deal={current} compact/><details><summary>Pełny rozkład i strefy czasowe</summary><FlightSchedule deal={current}/></details></section> : <p>Brak aktualnego rozkładu. Daty planu pobytu nie potwierdzają daty powrotu do domu.</p>}
  </section>
  <TripDraftProvider key={plan as string} tripId={`copy:${plan}`} initialInput={draft.input} initialEvents={draft.events} start={draft.start} end={draft.end} adultsOnly={draft.adultsOnly===true} forceReview>
  {current && !expired && <TripAccommodation deal={current}/>}
  <TripBudgetCalculator key={plan as string} tripId={`copy:${plan}`} initialInput={draft.input} start={draft.start} end={draft.end} shareOffer={offer} forceReview/>
  {current && !expired && <TripEvents key={`events-copy-${offer.slug}`} deal={current} activitiesHref={activitiesForDestination(current.destination_slug)?`/deals/${current.slug}#destination-activities`:undefined}/>}
  </TripDraftProvider>
  <Link href="/saved">Zapisane wyjazdy</Link>
 </main>;
}
