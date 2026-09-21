"use client";
import Link from "next/link";
import {Filters} from "../../lib/api";
import {pl} from "../../lib/pl";
import {track} from "../../lib/session";
const filterLabels={origin:pl.from,destination:pl.to,budget:pl.budget,
 departure_from:pl.departure_from,departure_to:pl.departure_to,
 duration_min:pl.duration_min,duration_max:pl.duration_max};
type FilterKey=keyof typeof filterLabels;
const filterKeys=Object.keys(filterLabels) as FilterKey[];
const advancedKeys=["departure_from","departure_to","duration_min","duration_max"] as const;

export function FilterForm({filters}:{filters:Filters}) {
  const active=filterKeys.filter(key=>!!filters[key]);
  const advancedCount=advancedKeys.filter(key=>!!filters[key]).length;
  function withoutFilter(removed:FilterKey) {
    const query=new URLSearchParams();
    for(const key of active) if(key!==removed) query.set(key,filters[key]!);
    return query.size ? `/deals?${query}` : "/deals";
  }
  return <section className="filter-panel" aria-label="Wybór ofert">
   <form className="filters" action="/deals" method="get" aria-label="Filtry ofert" onSubmit={()=>track("FILTER_USE")}
    onInvalidCapture={event=>{const details=(event.target as HTMLInputElement).closest("details");if(details)details.open=true;}}>
    <div className="filter-primary">
    <label>{pl.from}<input name="origin" defaultValue={filters.origin} maxLength={3} placeholder="WRO"/></label>
    <label>{pl.to}<input name="destination" defaultValue={filters.destination} placeholder="barcelona"/></label>
    <label>{pl.budget}<input name="budget" type="number" min="0" max="1000000" step="0.01" defaultValue={filters.budget}/></label>
    <button type="submit">{pl.filter}</button>
    </div>
    <details className="advanced-filters" open={advancedCount>0}>
     <summary>Daty i długość pobytu{advancedCount>0 && <span className="badge">Aktywne: {advancedCount}</span>}</summary>
     <div className="filter-secondary">
    {(["departure_from","departure_to"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="date" defaultValue={filters[k]}/></label>)}
    {(["duration_min","duration_max"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="number" min="0" max="365" defaultValue={filters[k]}/></label>)}
     </div>
    </details>
   </form>
   {active.length>0 && <div className="active-filters"><p>Zastosowane filtry</p>
    <nav className="filter-chips" aria-label="Zastosowane filtry">{active.map(key=>
     <Link className="filter-chip" key={key} href={withoutFilter(key)} aria-label={`Usuń filtr: ${filterLabels[key]}: ${filters[key]}`} onClick={()=>track("FILTER_USE")}>
      <span>{filterLabels[key]}: <strong>{filters[key]}</strong></span><span aria-hidden="true">×</span>
     </Link>
    )}</nav><Link className="filter-reset" href="/deals" onClick={()=>track("FILTER_USE")}>Wyczyść wszystkie filtry</Link>
   </div>}
  </section>;
}
