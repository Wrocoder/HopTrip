"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useId,useState} from "react";
import {Airport,Destination,Filters} from "../../lib/api";
import {matchingAirports,airportLabel} from "../../lib/airports";
import {pl,date,money} from "../../lib/pl";
import {analyticsFilters} from "../../lib/analytics-context";
import {track} from "../../lib/session";
import {matchingDestinations,destinationLabel} from "../../lib/destinations";
import {presetActive,togglePreset,tripPresets,type TripPreset} from "../../lib/trip-filters";
import {DestinationSelect} from "./destination-select";
import {AirportSelect} from "./airport-select";
const filterLabels={origin:pl.from,destination:pl.to,budget:pl.budget,
 departure_from:pl.departure_from,departure_to:pl.departure_to,
 duration_min:pl.duration_min,duration_max:pl.duration_max,weekend:"Na weekend"};
type FilterKey=keyof typeof filterLabels;
const filterKeys=Object.keys(filterLabels) as FilterKey[];
const advancedKeys=["departure_from","departure_to","duration_min","duration_max"] as const;

export function FilterForm({filters,airports=[],destinations=[],hero=false}:{filters:Filters;airports?:Airport[];destinations?:Destination[];hero?:boolean}) {
  const router=useRouter();
  const [validation,setValidation]=useState("");
  const [invalidField,setInvalidField]=useState("");
  const errorId=useId();
  const fieldError=(name:string)=>validation && invalidField===name ? errorId : undefined;
  const active=filterKeys.filter(key=>key==="weekend" ? presetActive(filters,"weekend") : !!filters[key]);
  const advancedCount=advancedKeys.filter(key=>!!filters[key]).length;
  function submit(form:HTMLFormElement,preset?:TripPreset) {
    const data=new FormData(form);
    const query=new URLSearchParams();
    for(const key of filterKeys) {
      const value=String(data.get(key) ?? "").trim();
      if(value) query.set(key,value);
    }
    const sort=String(data.get("sort") ?? filters.sort ?? "score");
    if(sort!=="score" || filters.sort)query.set("sort",sort);
    function invalid(name:string,message:string) {
      setValidation(message);
      setInvalidField(name);
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
    const destination=query.get("destination");
    if(destination && destinations.length) {
      const field=form.elements.namedItem("destination") as HTMLInputElement;
      const selected=field.dataset.destinationSlug;
      const matches=matchingDestinations(destinations,selected || destination);
      if(matches.length!==1) {
        invalid("destination",matches.length ? "Ta nazwa wskazuje kilka kierunków. Wybierz miasto z listy." :
          "Nie znaleziono kierunku. Wybierz miasto z podpowiedzi lub zostaw pole puste.");
        return;
      }
      query.set("destination",matches[0].slug);
    }
    if(preset) togglePreset(query,preset);
    const from=query.get("departure_from"),to=query.get("departure_to");
    if(from && to && from>to) {invalid("departure_to","Koniec zakresu dat nie może być wcześniejszy niż początek.");return;}
    const min=query.get("duration_min"),max=query.get("duration_max");
    if(min && max && Number(min)>Number(max)) {invalid("duration_max","Maksymalny pobyt nie może być krótszy niż minimalny.");return;}
    setValidation("");track("FILTER_USE");
    track("SEARCH",undefined,undefined,{search:{filters:analyticsFilters(Object.fromEntries(query),airports,destinations)}});
    router.push(query.size ? `/deals?${query}` : "/deals");
  }
  function filterValue(key:FilterKey):string {
    const value=filters[key]??"";
    if(key==="weekend")return "pt./sob. → niedz.";
    if(key==="budget")return money(value);
    if(key==="departure_from"||key==="departure_to")return date(value);
    if(key==="origin") {const matches=matchingAirports(airports,value);if(matches.length===1)return airportLabel(matches[0]);}
    if(key==="destination") {const matches=matchingDestinations(destinations,value);if(matches.length===1)return destinationLabel(matches[0]);}
    return value;
  }
  function withoutFilter(removed:FilterKey) {
    const query=new URLSearchParams();
    if(filters.sort)query.set("sort",filters.sort);
    for(const key of active) if(key!==removed) query.set(key,filters[key]!);
    return query.size ? `/deals?${query}` : "/deals";
  }
  const dateFields=(["departure_from","departure_to"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="date" defaultValue={filters[k]} aria-invalid={Boolean(fieldError(k))} aria-describedby={fieldError(k)}/></label>);
  return <section className={`filter-panel${hero ? " hero-search" : ""}`} aria-label="Wybór ofert">
   <form className="filters" action="/deals" method="get" aria-label="Filtry ofert" onSubmit={event=>{event.preventDefault();submit(event.currentTarget);}}
    onChange={()=>setValidation("")}
    onInvalidCapture={event=>{const details=(event.target as HTMLInputElement).closest("details");if(details)details.open=true;}}>
    <input type="hidden" name="weekend" value={presetActive(filters,"weekend") ? "true" : ""}/>
    <div className="filter-primary">
    <AirportSelect airports={airports} value={filters.origin} errorId={fieldError("origin")}/>
    <DestinationSelect destinations={destinations} value={filters.destination} errorId={fieldError("destination")}/>
    <label>{pl.budget}<input name="budget" type="number" min="0" max="1000000" step="0.01" defaultValue={filters.budget}/></label>

    <button type="submit">{hero ? "Szukaj lotów" : pl.filter}</button>
    </div>
    {!hero && <p className="field-hint">Daty wyznaczają zakres możliwego wylotu (obie granice włącznie), nie termin powrotu. Puste pole oznacza brak granicy. Długość pobytu podaj osobno w nocach.</p>}
    <div className="trip-presets" role="group" aria-label="Szybkie filtry">
      {tripPresets.map(preset=><div key={preset.id}>
        <button type="button" aria-pressed={presetActive(filters,preset.id)} aria-describedby={`preset-${preset.id}`}
          onClick={event=>{const form=event.currentTarget.form!;if(form.reportValidity())submit(form,preset.id);}}>{preset.label}</button>
        {!hero && <p id={`preset-${preset.id}`} className="field-hint">{preset.rule}</p>}
      </div>)}
    </div>
    {hero ? <details className="preset-rules"><summary>Zasady szybkich filtrów</summary>{tripPresets.map(preset=><p id={`preset-${preset.id}`} className="field-hint" key={preset.id}><strong>{preset.label}: </strong>{preset.rule}</p>)}<p className="field-hint">Szybkie filtry łączą się z pozostałymi warunkami i wybranymi datami. Ponowne kliknięcie usuwa ich warunki, bez przywracania wcześniejszych wartości.</p></details> : <p className="field-hint">Szybkie filtry łączą się z pozostałymi warunkami i wybranymi datami. Ponowne kliknięcie usuwa ich warunki, bez przywracania wcześniejszych wartości.</p>}
    <details className="advanced-filters" open={advancedCount>0}>
     <summary>Daty i długość pobytu{advancedCount>0 && <span className="badge">Aktywne: {advancedCount}</span>}</summary>
     {hero && <p className="field-hint">Daty wyznaczają zakres możliwego wylotu (obie granice włącznie), nie termin powrotu. Puste pole oznacza brak granicy. Długość pobytu podaj osobno w nocach.</p>}
     <div className="filter-secondary">
    {dateFields}
    {(["duration_min","duration_max"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="number" min="0" max="365" defaultValue={filters[k]} aria-invalid={Boolean(fieldError(k))} aria-describedby={fieldError(k)}/></label>)}
     </div>
    </details>
    {!hero && <label className="sort-control">Sortuj oferty
      <select name="sort" defaultValue={filters.sort ?? "score"} onChange={event=>{
        event.stopPropagation();
        const form=event.currentTarget.form!;if(form.reportValidity())submit(form);
      }}>
        {filters.sort && !["score","price","departure"].includes(filters.sort) && <option value={filters.sort} disabled>Wybierz sortowanie</option>}
        <option value="score">Ocena oferty — najwyższa</option>
        <option value="price">Cena — najniższa</option>
        <option value="departure">Wylot — najbliższy</option>
      </select>
    </label>}
    {validation && <p id={errorId} className="notice" role="alert">{validation}</p>}

   </form>
   {!hero && active.length>0 && <div className="active-filters"><p>Zastosowane filtry</p>
    <nav className="filter-chips" aria-label="Zastosowane filtry">{active.map(key=>
     <Link className="filter-chip" key={key} href={withoutFilter(key)} aria-label={`Usuń filtr: ${filterLabels[key]}: ${filterValue(key)}`} onClick={()=>track("FILTER_USE")}>
      <span>{filterLabels[key]}: <strong>{filterValue(key)}</strong></span><span aria-hidden="true">×</span>
     </Link>
    )}</nav><Link className="filter-reset" href={filters.sort ? `/deals?sort=${encodeURIComponent(filters.sort)}` : "/deals"} onClick={()=>track("FILTER_USE")}>Wyczyść wszystkie filtry</Link>
   </div>}
  </section>;
}
