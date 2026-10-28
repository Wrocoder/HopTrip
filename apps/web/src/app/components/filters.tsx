"use client";
import {useLocale} from "./locale-provider";
import {filterText} from "../../lib/i18n/filter-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {scenarioFilters,searchUrl} from "../../lib/search-policy";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useId,useState} from "react";
import {Airport,Destination,Filters} from "../../lib/api";
import {matchingAirports,airportLabel} from "../../lib/airports";
import {date,money} from "../../lib/pl";
import {analyticsFilters} from "../../lib/analytics-context";
import {track} from "../../lib/session";
import {matchingDestinations,destinationLabel} from "../../lib/destinations";
import {presetActive,togglePreset,tripPresets,type TripPreset} from "../../lib/trip-filters";
import {DestinationSelect} from "./destination-select";
import {AirportSelect} from "./airport-select";
import {rememberOrigin} from "../actions/origin-preference";
type FilterKey="origin"|"destination"|"budget"|"departure_from"|"departure_to"|"duration_min"|"duration_max"|"weekend";
const filterKeys:FilterKey[]=["origin","destination","budget","departure_from","departure_to","duration_min","duration_max","weekend"];
const advancedKeys=["departure_from","departure_to","duration_min","duration_max"] as const;

export function FilterForm({filters,airports=[],destinations=[],hero=false,path="/deals"}:{filters:Filters;airports?:Airport[];destinations?:Destination[];hero?:boolean;path?:string}) {
  const router=useRouter();
  const {locale,messages:pl}=useLocale();
  const t=(source:string)=>filterText(locale,source);
  const filterLabels={origin:pl.from,destination:pl.to,budget:pl.budget,
 departure_from:pl.departure_from,departure_to:pl.departure_to,
 duration_min:pl.duration_min,duration_max:pl.duration_max,weekend:t("Na weekend")};

  const basePath=localizedHref(path,"pl");
  const url=(route:string,values:Filters)=>localizedHref(searchUrl(route,values),locale);
  const resetUrl=url("/deals",filters.sort ? {sort:filters.sort} : {});
  const locked=scenarioFilters(basePath);
  const warsaw=basePath==="/from/warszawa" || filters.origin==="WAW,WMI";
  const [validation,setValidation]=useState("");
  const [invalidField,setInvalidField]=useState("");
  const errorId=useId();
  const fieldError=(name:string)=>validation && invalidField===name ? errorId : undefined;
  const active=filterKeys.filter(key=>key==="weekend" ? presetActive(filters,"weekend") : !!filters[key]);
  const advancedCount=advancedKeys.filter(key=>!!filters[key] && !locked[key]).length;
  async function submit(form:HTMLFormElement,preset?:TripPreset) {
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
    if(origin && origin!=="WAW,WMI" && airports.length) {
      const matches=matchingAirports(airports,origin);
      if(matches.length!==1) {
        invalid("origin",matches.length ? t("To miasto ma kilka lotnisk. Wybierz konkretne lotnisko z listy.") :
          t("Nie znaleziono lotniska. Sprawdź nazwę miasta lub kod IATA."));
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
        invalid("destination",matches.length ? t("Ta nazwa wskazuje kilka kierunków. Wybierz miasto z listy.") :
          t("Nie znaleziono kierunku. Wybierz miasto z podpowiedzi lub zostaw pole puste."));
        return;
      }
      query.set("destination",matches[0].slug);
    }
    if(preset) togglePreset(query,preset);
    for(const [key,value] of Object.entries(locked))query.set(key,value);
    const from=query.get("departure_from"),to=query.get("departure_to");
    if(from && to && from>to) {invalid("departure_to",t("Koniec zakresu dat nie może być wcześniejszy niż początek."));return;}
    const min=query.get("duration_min"),max=query.get("duration_max");
    if(min && max && Number(min)>Number(max)) {invalid("duration_max",t("Maksymalny pobyt nie może być krótszy niż minimalny."));return;}
    setValidation("");track("FILTER_USE");
    track("SEARCH",undefined,undefined,{search:{filters:analyticsFilters(Object.fromEntries(query),airports,destinations)}});
    // A failed preference save must not prevent the actual search.
    try {await rememberOrigin(query.get("origin") ?? "");}catch {}
    router.push(url(basePath,Object.fromEntries(query)));
  }
  function filterValue(key:FilterKey):string {
    const value=filters[key]??"";
    if(key==="weekend")return t("pt./sob. → niedz.");
    if(key==="budget")return money(value,locale);
    if(key==="departure_from"||key==="departure_to")return date(value,locale);
    if(key==="origin" && value==="WAW,WMI")return t("Warszawa — WAW i WMI");
    if(key==="origin") {const matches=matchingAirports(airports,value);if(matches.length===1)return airportLabel(matches[0],locale);}
    if(key==="destination") {const matches=matchingDestinations(destinations,value);if(matches.length===1)return destinationLabel(matches[0],locale);}
    return value;
  }
  function withoutFilter(removed:FilterKey) {
    const query=new URLSearchParams();
    if(filters.sort)query.set("sort",filters.sort);
    for(const key of active) if(key!==removed) query.set(key,filters[key]!);
    return url(locked[removed] || (basePath==="/from/warszawa" && removed==="origin") ? "/deals" : basePath,Object.fromEntries(query));
  }
  async function clearOriginAndNavigate(href:string) {
    try {await rememberOrigin("");}catch {}
    router.push(href);
  }
  const dateFields=(["departure_from","departure_to"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="date" defaultValue={filters[k]} aria-invalid={Boolean(fieldError(k))} aria-describedby={fieldError(k)}/></label>);
  return <section className={`filter-panel${hero ? " hero-search" : ""}`} aria-label={t("Wybór ofert")}>
   <form className="filters" action={localizedHref(basePath,locale)} method="get" aria-label={t("Filtry ofert")} onSubmit={event=>{event.preventDefault();submit(event.currentTarget);}}
    onChange={()=>setValidation("")}
    onInvalidCapture={event=>{const details=(event.target as HTMLInputElement).closest("details");if(details)details.open=true;}}>
    <input type="hidden" name="weekend" value={presetActive(filters,"weekend") ? "true" : ""}/>
    <div className="filter-primary">
    {locked.origin ? <label>{t("Lotnisko wylotu")}<input name="origin" value={locked.origin} readOnly/></label> : warsaw ? <label className="origin-group">{t("Lotnisko wylotu")}<select name="origin" defaultValue={filters.origin ?? "WAW,WMI"}><option value="WAW,WMI">{t("Warszawa — WAW i WMI")}</option><option value="WAW">{t("Warszawa Chopin — WAW")}</option><option value="WMI">{t("Warszawa Modlin — WMI")}</option></select></label> : <AirportSelect airports={airports} value={filters.origin} errorId={fieldError("origin")}/>}
    {locked.destination ? <label>{t("Kierunek")}<input name="destination" value={locked.destination} readOnly/></label> : <DestinationSelect destinations={destinations} value={filters.destination} errorId={fieldError("destination")}/>}
    <label>{pl.budget}<input name="budget" type="number" min="0" max="1000000" step="0.01" defaultValue={filters.budget}/></label>

    <button type="submit">{hero ? t("Szukaj lotów") : pl.filter}</button>
    </div>
    <div className="trip-presets" role="group" aria-label={t("Szybkie filtry")}>
      {tripPresets.filter(preset=>!(preset.id==="weekend" && locked.weekend) && !(preset.id==="nights" && locked.duration_min)).map(preset=><div key={preset.id}>
        <button type="button" aria-pressed={presetActive(filters,preset.id)} aria-describedby={`preset-${preset.id}`}
          onClick={event=>{const form=event.currentTarget.form!;if(form.reportValidity())submit(form,preset.id);}}>{t(preset.label)}</button>
      </div>)}
    </div>
    <details className="preset-rules"><summary>{hero ? t("Zasady szybkich filtrów") : t("Jak działają filtry")}</summary>{tripPresets.map(preset=><p id={`preset-${preset.id}`} className="field-hint" key={preset.id}><strong>{t(preset.label)}: </strong>{t(preset.rule)}</p>)}<p className="field-hint">{t("Szybkie filtry łączą się z pozostałymi warunkami i wybranymi datami. Ponowne kliknięcie usuwa ich warunki, bez przywracania wcześniejszych wartości.")}</p><p className="field-hint">{t("Daty wyznaczają zakres możliwego wylotu (obie granice włącznie), nie termin powrotu. Puste pole oznacza brak granicy.")}</p></details>
    <details className="advanced-filters" open={advancedCount>0}>
     <summary>{t("Daty i długość pobytu")}{advancedCount>0 && <span className="badge">{t("Aktywne:")}{" "}{advancedCount}</span>}</summary>
     <p className="field-hint">{t("Zakres dat wylotu, nie powrotu. Długość pobytu w nocach.")}{" "}{locked.duration_min ? t("To zestawienie obejmuje 2–4 noce. Aby wybrać inną długość, przejdź do pełnego katalogu.") : t("Puste pole: bez ograniczenia.")}</p>
     <div className="filter-secondary">
    {dateFields}
    {(["duration_min","duration_max"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="number" min="0" max="365" defaultValue={filters[k]} readOnly={Boolean(locked[k])} aria-invalid={Boolean(fieldError(k))} aria-describedby={fieldError(k)}/></label>)}
     </div>
    </details>
    {!hero && <label className="sort-control">{t("Sortuj oferty")}{" "}<select name="sort" defaultValue={filters.sort ?? "score"} onChange={event=>{
        event.stopPropagation();
        const form=event.currentTarget.form!;if(form.reportValidity())submit(form);
      }}>
        {filters.sort && !["score","price","departure"].includes(filters.sort) && <option value={filters.sort} disabled>{t("Wybierz sortowanie")}</option>}
        <option value="score">{t("Ocena oferty — najwyższa")}</option>
        <option value="price">{t("Cena — najniższa")}</option>
        <option value="departure">{t("Wylot — najbliższy")}</option>
      </select>
    </label>}
    {validation && <p id={errorId} className="notice" role="alert">{validation}</p>}

   </form>
   {!hero && active.length>0 && <div className="active-filters"><p>{t("Zastosowane filtry")}</p>
    <nav className="filter-chips" aria-label={t("Zastosowane filtry")}>{active.map(key=>
     <Link className="filter-chip" key={key} href={withoutFilter(key)} aria-label={`${t("Usuń filtr:")} ${filterLabels[key]}: ${filterValue(key)}`} onClick={()=>track("FILTER_USE")} onNavigate={event=>{if(key==="origin"){event.preventDefault();void clearOriginAndNavigate(withoutFilter(key));}}}>
      <span>{filterLabels[key]}: <strong>{filterValue(key)}</strong></span><span aria-hidden="true">×</span>
     </Link>
    )}</nav><Link className="filter-reset" href={resetUrl} onClick={()=>track("FILTER_USE")} onNavigate={event=>{event.preventDefault();void clearOriginAndNavigate(resetUrl);}}>{t("Wyczyść wszystkie filtry")}</Link>
   </div>}
  </section>;
}
