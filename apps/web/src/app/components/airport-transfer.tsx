import Link from "next/link";
import {transferForGuide} from "../../lib/airport-transfers";
import styles from "./destination-activities.module.css";

export function AirportTransfer({slug}:{slug:string}) {
 const transfer=transferForGuide(slug);
 if(!transfer) return null;
 return <aside className={styles.card} aria-label="Transfer z lotniska">
  <h2>Transfer z lotniska — {transfer.city}</h2>
  <p>Porównaj transport publiczny opisany w poradniku z przejazdem pod adres noclegu.
   W Welcome Pickups sprawdź cenę dla całej grupy, bagaż, miejsce odbioru i zasady anulowania.</p>
  <p><a className="button button-secondary" href={transfer.affiliateHref} target="_blank"
   rel="sponsored noopener noreferrer">Sprawdź transfer w Welcome Pickups (nowa karta)</a></p>
  <p className="muted">Link afiliacyjny — możemy otrzymać prowizję za rezerwację.
   Cenę i dostępność na datę podróży potwierdza partner.</p>
  <Link href="/info/trip-budget#calculator">Uwzględnij dojazd w budżecie podróży</Link>
 </aside>;
}
