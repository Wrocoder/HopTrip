// A full navigation unloads marketing scripts before collecting email.
import {alertsEnabled,type Filters} from "../../lib/api";

export async function AlertInvite({filters={}}:{filters?:Filters}) {
  if(!await alertsEnabled())return null;
  const query=new URLSearchParams();
  for(const key of ["origin","budget","destination","duration_min","duration_max","departure_from","departure_to"] as const)
    if(filters[key])query.set(key,filters[key]);
  return <aside className="travel-note"><div><h2>Nie przegap lotu w swoim budżecie</h2>
    <p>Wybierz lotnisko, cenę i długość pobytu. Nowe pasujące oferty na email — najwyżej raz na dobę.</p></div>
    <a className="button button-secondary" href={`/alerts${query.size?`?${query}`:""}`}>Powiadom mnie o lotach</a></aside>;
}
