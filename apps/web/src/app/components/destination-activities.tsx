import {activitiesForDestination} from "../../lib/destination-activities";
import styles from "./destination-activities.module.css";
import {ActivityLink} from "./activity-link";
import {ActivityBudgetLink} from "./activity-budget-link";
import {date} from "../../lib/pl";

export function DestinationActivities({slug,inTrip=false}:{slug:string;inTrip?:boolean}) {
  const selection=activitiesForDestination(slug);
  if(!selection) return null;
  return <section id="destination-activities" tabIndex={-1} className={styles.section} aria-labelledby="destination-activities-title">
    <p className="eyebrow">Pomysły na pobyt · {selection.city}</p>
    <h2 id="destination-activities-title">{selection.heading ?? "Muzea i atrakcje"}</h2>
    <p>Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.</p>
    <ul className={styles.grid}>
      {selection.items.map(item=><li key={item.id} className={styles.card}>
        <span className="badge">{item.category}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.audience && <p><strong>Dla kogo:</strong> {item.audience}</p>}
        {item.duration && <p><strong>Czas wizyty:</strong> {item.duration}</p>}
        <p className={styles.note}>{item.beforeBooking}</p>
        {item.checkedAt && <p className="muted">Opis sprawdzono {date(item.checkedAt)}. Termin i dostępność potwierdź u organizatora.</p>}
        <div className={styles.booking}>
          <p className="muted">{item.freeEntry ? "Samodzielna wizyta: bezpłatny wstęp według oficjalnej strony." : item.kind==="visit" ? "Oficjalna strona — bilety i godziny zwiedzania" : "Cena do sprawdzenia w Tiqets"}</p>
          {item.affiliateHref && <p className="muted">Link afiliacyjny — możemy otrzymać prowizję za zakup.</p>}
          <ActivityLink city={slug} activityId={item.id} affiliate={Boolean(item.affiliateHref)}
            className="button button-secondary" href={item.affiliateHref ?? item.href} target="_blank"
            rel={item.affiliateHref ? "sponsored noopener noreferrer" : "noopener noreferrer"}
            aria-label={`${item.kind==="visit" ? "Sprawdź zasady wizyty" : "Sprawdź daty i cenę w Tiqets"}: ${item.title} (nowa karta)`}>
            {item.kind==="visit" ? "Sprawdź zasady wizyty" : "Sprawdź daty i cenę"}
          </ActivityLink>
          {item.durationSource && <p><ActivityLink city={slug} activityId={item.id} affiliate={false}
            href={item.durationSource} target="_blank" rel="noopener noreferrer">Źródło informacji o czasie wizyty (nowa karta)</ActivityLink></p>}
        </div>
      </li>)}
    </ul>
    <p className="muted">Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu,
      ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.</p>
    {(slug==="barcelona" || selection.heading) && <>
      {slug==="barcelona" && <p className="muted">Opisy i zasady sprawdzono {date(selection.checkedAt)}. To przegląd źródeł, nie potwierdzenie dostępności biletów na daty podróży.</p>}
      <p>W kalkulatorze wpisz łączny koszt wybranych atrakcji w PLN na osobę za cały pobyt. Przy różnych cenach biletów użyj średniej na osobę. Sam bezpłatny wstęp nie oznacza zerowych kosztów dojazdu.</p>
      <ActivityBudgetLink inTrip={inTrip}/>
    </>}
  </section>;
}
