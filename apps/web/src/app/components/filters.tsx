"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState,type FormEvent} from "react";
import {Airport,Filters} from "../../lib/api";
import {matchingAirports} from "../../lib/airports";
import {pl} from "../../lib/pl";
import {track} from "../../lib/session";
import {AirportSelect} from "./airport-select";
const filterLabels={origin:pl.from,destination:pl.to,budget:pl.budget,
 departure_from:pl.departure_from,departure_to:pl.departure_to,
 duration_min:pl.duration_min,duration_max:pl.duration_max};
type FilterKey=keyof typeof filterLabels;
const filterKeys=Object.keys(filterLabels) as FilterKey[];
const advancedKeys=["departure_from","departure_to","duration_min","duration_max"] as const;

export function FilterForm({filters,airports=[],hero=false}:{filters:Filters;airports?:Airport[];hero?:boolean}) {
  const router=useRouter();
  const [validation,setValidation]=useState("");
  const active=filterKeys.filter(key=>!!filters[key]);
  const advancedCount=advancedKeys.filter(key=>!!filters[key]).length;
  function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
    const query=new URLSearchParams();
    for(const key of filterKeys) {
      const value=String(data.get(key) ?? "").trim();
      if(value) query.set(key,value);
    }
    function invalid(name:string,message:string) {
      setValidation(message);
      const field=form.elements.namedItem(name) as HTMLInputElement;
      const details=field.closest("details");if(details)details.open=true;
      field.focus();
    }
    const origin=query.get("origin");
    if(origin && airports.length) {
      const matches=matchingAirports(airports,origin);
      if(matches.length!==1) {
        invalid("origin",matches.length ? "To miasto ma kilka lotnisk. Wybierz konkretne lotnisko z listy." :
          "Nie znaleziono lotniska. Sprawdź nazwę miasta lub kod IATA.");
        return;
      }
      query.set("origin",matches[0].iata_code);
    }
    const from=query.get("departure_from"),to=query.get("departure_to");
    if(from && to && from>to) {invalid("departure_to","Koniec zakresu dat nie może być wcześniejszy niż początek.");return;}
    const min=query.get("duration_min"),max=query.get("duration_max");
    if(min && max && Number(min)>Number(max)) {invalid("duration_max","Maksymalny pobyt nie może być krótszy niż minimalny.");return;}
    setValidation("");track("FILTER_USE");
    router.push(query.size ? `/deals?${query}` : "/deals");
  }
  function withoutFilter(removed:FilterKey) {
    const query=new URLSearchParams();
    for(const key of active) if(key!==removed) query.set(key,filters[key]!);
    return query.size ? `/deals?${query}` : "/deals";
  }
  const dateFields=(["departure_from","departure_to"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="date" defaultValue={filters[k]}/></label>);
  return <section className={`filter-panel${hero ? " hero-search" : ""}`} aria-label="Wybór ofert">
   <form className="filters" action="/deals" method="get" aria-label="Filtry ofert" onSubmit={submit}
    onChange={()=>setValidation("")}
    onInvalidCapture={event=>{const details=(event.target as HTMLInputElement).closest("details");if(details)details.open=true;}}>
    <div className="filter-primary">
    <AirportSelect airports={airports} value={filters.origin}/>
    {!hero && <label>{pl.to}<input name="destination" defaultValue={filters.destination} placeholder="barcelona"/></label>}
    <label>{pl.budget}<input name="budget" type="number" min="0" max="1000000" step="0.01" defaultValue={filters.budget}/></label>
    {hero && dateFields}
    <button type="submit">{hero ? "Szukaj lotów" : pl.filter}</button>
    </div>
    <details className="advanced-filters" open={advancedCount>0}>
     <summary>{hero ? "Długość pobytu" : "Daty i długość pobytu"}{advancedCount>0 && <span className="badge">Aktywne: {advancedCount}</span>}</summary>
     <div className="filter-secondary">
    {!hero && dateFields}
    {(["duration_min","duration_max"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="number" min="0" max="365" defaultValue={filters[k]}/></label>)}
     </div>
    </details>
    {validation && <p className="notice" role="alert">{validation}</p>}
    {hero && <p className="field-hint">Budżet dotyczy lotu na osobę. Daty są opcjonalne.</p>}
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
