import {activitiesForDestination} from "../../lib/destination-activities";
import styles from "./destination-activities.module.css";
import {ActivityLink} from "./activity-link";

export function DestinationActivities({slug}:{slug:string}) {
  const selection=activitiesForDestination(slug);
  if(!selection) return null;
  return <section className={styles.section} aria-labelledby="destination-activities-title">
    <p className="eyebrow">Pomysły na pobyt · {selection.city}</p>
    <h2 id="destination-activities-title">Muzea i atrakcje</h2>
    <p>Bilety kupujesz osobno. Dostępność na daty Twojej podróży sprawdzisz u sprzedawcy lub na oficjalnej stronie obiektu.</p>
    <ul className={styles.grid}>
      {selection.items.map(item=><li key={item.id} className={styles.card}>
        <span className="badge">{item.category}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <p className={styles.note}>{item.beforeBooking}</p>
        <div className={styles.booking}>
          <p className="muted">{item.kind==="visit" ? "Oficjalna strona — bilety i godziny zwiedzania" : "Cena do sprawdzenia w Tiqets"}</p>
          {item.affiliateHref && <p className="muted">Link afiliacyjny — możemy otrzymać prowizję za zakup.</p>}
          <ActivityLink city={slug} activityId={item.id} affiliate={Boolean(item.affiliateHref)}
            className="button button-secondary" href={item.affiliateHref ?? item.href} target="_blank"
            rel={item.affiliateHref ? "sponsored noopener noreferrer" : "noopener noreferrer"}
            aria-label={`${item.kind==="visit" ? "Sprawdź zasady wizyty" : "Sprawdź daty i cenę w Tiqets"}: ${item.title} (nowa karta)`}>
            {item.kind==="visit" ? "Sprawdź zasady wizyty" : "Sprawdź daty i cenę"}
          </ActivityLink>
        </div>
      </li>)}
    </ul>
    <p className="muted">Koszt atrakcji nie jest wliczony w cenę lotu. Przed zakupem sprawdź zakres biletu,
      ulgi i zasady anulowania. W dni podróży uwzględnij czas lotu i dojazdu.</p>
  </section>;
}
