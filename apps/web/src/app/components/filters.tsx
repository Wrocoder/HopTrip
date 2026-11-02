"use client";
import {useLocale} from "./locale-provider";
import {filterText} from "../../lib/i18n/filter-copy";
import {localizedHref} from "../../lib/i18n/routing";
import {scenarioFilters,searchUrl} from "../../lib/search-policy";

import Link from "next/link";
import {useId,useState,useTransition} from "react";
import {Airport,Destination,Filters} from "../../lib/api";
import {matchingAirports,airportLabel} from "../../lib/airports";
import {date,money} from "../../lib/pl";
import {analyticsFilters} from "../../lib/analytics-context";
import {track} from "../../lib/session";
import {matchingDestinations,destinationLabel} from "../../lib/destinations";
import {presetActive,presetValues,togglePreset,tripPresets,type TripPreset} from "../../lib/trip-filters";
import {DestinationSelect} from "./destination-select";
import {AirportSelect} from "./airport-select";
import {searchWithOrigin} from "../actions/origin-preference";
import type {OriginSelection} from "../../lib/origin-preference";
import {stateText} from '../../lib/i18n/state-copy';
type FilterKey="origin"|"destination"|"budget"|"departure_from"|"departure_to"|"duration_min"|"duration_max"|"weekend";
const filterKeys:FilterKey[]=["origin","destination","budget","departure_from","departure_to","duration_min","duration_max","weekend"];
const advancedKeys=["departure_from","departure_to","duration_min","duration_max"] as const;
const sortOptions=[
  {value:'score',label:'Wynik pomocniczy ↓',rule:'Malejąco według zapisanego wyniku złożonego, nie samej różnicy od mediany ani jakości podróży. Remis: wcześniejsza data wylotu, potem stała kolejność.'},
  {value:'price',label:'Cena/os. (PLN) ↑',rule:'Rosnąco według ceny lotu na osobę w PLN, bez przybliżenia w EUR. Remis: wcześniejsza data wylotu, potem stała kolejność.'},
  {value:'departure',label:'Data wylotu ↑',rule:'Rosnąco według daty wylotu z karty; godzina nie rozstrzyga. Remis: niższa cena lotu na osobę w PLN, potem stała kolejność.'},
] as const;
const presetState=(data:FormData|URLSearchParams):Filters=>Object.fromEntries(['weekend','budget','duration_min','duration_max'].map(key=>[key,String(data.get(key)??'')]));

export function FilterForm({filters,airports=[],destinations=[],hero=false,path="/deals",originSelection}:{filters:Filters;airports?:Airport[];destinations?:Destination[];hero?:boolean;path?:string;originSelection?:OriginSelection}) {
  const [pending,startTransition]=useTransition();
  const [presetDraft,setPresetDraft]=useState<Filters|null>(null);
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
  const [error,setError]=useState<{message:string;field:string;selection?:OriginSelection}|null>(null);
  // A new committed origin invalidates an error for an earlier airport draft.
  const validation=error && (error.field!=="origin" || error.selection===originSelection) ? error.message : "";
  const invalidField=error?.field ?? "";
  const errorId=useId();
  const sortRuleId=useId();
  const appliedSort=sortOptions.find(option=>option.value===(filters.sort??'score'));
  const fieldError=(name:string)=>validation && invalidField===name ? errorId : undefined;
  const active=filterKeys.filter(key=>key==="weekend" ? presetActive(filters,"weekend") : !!filters[key]);
  const advancedCount=advancedKeys.filter(key=>(!hero || !key.startsWith("departure_")) && !!filters[key] && !locked[key]).length;
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
      setError({message,field:name,selection:originSelection});
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
    const sameSelection=filterKeys.every(key=>(filters[key]??'')===(query.get(key)??'')) && (filters.sort??'score')===(query.get('sort')??'score');
    if(preset && sameSelection){
      // A preset can resolve to the current URL. Project its owned values into
      // uncontrolled fields too, so a same-URL response cannot leave old drafts.
      for(const key of Object.keys(presetValues[preset])){
        const field=form.elements.namedItem(key) as HTMLInputElement|null;
        if(field)field.value=query.get(key)??'';
      }
      setPresetDraft(presetState(query));
    }
    // A validated full search owns navigation; an earlier origin save must not
    // push/refresh the home route after this search action redirects.
    originSelection?.onSearch?.();
    setError(null);track("FILTER_USE",undefined,undefined,{filter:{action:"apply"}});
    track("SEARCH",undefined,undefined,{search:{filters:analyticsFilters(Object.fromEntries(query),airports,destinations)}});
    const href=url(basePath,Object.fromEntries(query));
    startTransition(()=>searchWithOrigin(query.get("origin") ?? "",href));
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
    await searchWithOrigin("",href);
  }
  const dateFields=(["departure_from","departure_to"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="date" defaultValue={filters[k]} disabled={pending} aria-invalid={Boolean(fieldError(k))} aria-describedby={fieldError(k)}/></label>);
  return <section id={hero?'home-search':'search-filters'} tabIndex={-1} className={`filter-panel${hero ? " hero-search" : ""}`} aria-label={t("Wybór ofert")}>
   <form className="filters" action={localizedHref(basePath,locale)} method="get" aria-label={t("Filtry ofert")} aria-busy={pending} onSubmit={event=>{event.preventDefault();submit(event.currentTarget);}}
    onChange={event=>{setError(null);setPresetDraft(presetState(new FormData(event.currentTarget)));}}
    onInvalidCapture={event=>{const details=(event.target as HTMLInputElement).closest("details");if(details)details.open=true;}}>
    <input type="hidden" name="weekend" value={presetActive(filters,"weekend") ? "true" : ""}/>
    <fieldset className="filter-primary" disabled={pending}>
    {locked.origin ? <label>{t("Lotnisko wylotu")}<input name="origin" value={locked.origin} readOnly/></label> : warsaw ? <label className="origin-group">{t("Lotnisko wylotu")}<select name="origin" defaultValue={filters.origin ?? "WAW,WMI"}><option value="WAW,WMI">{t("Warszawa — WAW i WMI")}</option><option value="WAW">{t("Warszawa Chopin — WAW")}</option><option value="WMI">{t("Warszawa Modlin — WMI")}</option></select></label> : <AirportSelect airports={airports} value={originSelection?.value ?? filters.origin} errorId={fieldError("origin")} inputId={originSelection ? "home-origin" : undefined} onSelect={originSelection ? origin=>{setError(null);originSelection.select(origin);} : undefined}/>}
    {locked.destination ? <label>{t("Kierunek")}<input name="destination" value={locked.destination} readOnly/></label> : <DestinationSelect destinations={destinations} value={filters.destination} errorId={fieldError("destination")} anywhere={hero}/>}
    {hero && <fieldset className="hero-dates"><legend>{t("Elastyczne daty wylotu")}</legend><div className="filter-secondary">{dateFields}</div><p className="field-hint">{t("Wybierz przedział możliwego wylotu. Zostaw daty puste, aby szukać bez ograniczeń.")}</p></fieldset>}
    <label>{hero ? t("Budżet na lot / osobę (PLN, opcjonalnie)") : pl.budget}<input name="budget" type="number" min="0" max="1000000" step="0.01" defaultValue={filters.budget}/></label>

    <button type="submit" disabled={pending}>{hero ? t("Znajdź tani lot") : pl.filter}</button>
    </fieldset>
    <details className="advanced-filters" open={!hero || advancedCount>0}>
     <summary>{hero ? t("Więcej opcji: długość pobytu") : t("Daty i długość pobytu")}{advancedCount>0 && <span className="badge">{t("Aktywne:")}{" "}{advancedCount}</span>}</summary>
     <p className="field-hint">{t("Zakres dat wylotu, nie powrotu. Długość pobytu w nocach.")}{" "}{locked.duration_min ? t("To zestawienie obejmuje 2–4 noce. Aby wybrać inną długość, przejdź do pełnego katalogu.") : t("Puste pole: bez ograniczenia.")}</p>
     <div className="filter-secondary">
    {!hero && dateFields}
    {(["duration_min","duration_max"] as const).map(k=><label key={k}>{pl[k]}<input name={k} type="number" min="0" max="365" defaultValue={filters[k]} disabled={pending} readOnly={Boolean(locked[k])} aria-invalid={Boolean(fieldError(k))} aria-describedby={fieldError(k)}/></label>)}
     </div>
    </details>
    {!hero && <label className="sort-control">{t("Sortuj oferty")}{" "}<select name="sort" aria-describedby={sortRuleId} disabled={pending} defaultValue={filters.sort ?? "score"} onChange={event=>{
        event.stopPropagation();
        const form=event.currentTarget.form!;if(form.reportValidity())submit(form);
      }}>
        {filters.sort && !appliedSort && <option value={filters.sort} disabled>{t("Wybierz sortowanie")}</option>}
        {sortOptions.map(option=><option key={option.value} value={option.value}>{t(option.label)}</option>)}
      </select>
      <span className="field-hint">{t('Zmiana sortowania stosuje też wpisane filtry.')}</span>
    </label>}
    {!hero && <p className="sort-explanation field-hint" id={sortRuleId}>
      {appliedSort ? <>{t('Zastosowane sortowanie:')} <strong>{t(appliedSort.label)}</strong>. {t(appliedSort.rule)}{' '}
        {appliedSort.value==='score' && <Link prefetch={false} href={localizedHref('/info/price-comparison',locale)}>{t('Jak działa wynik pomocniczy?')}</Link>}
      </> : t('Wybierz poprawne sortowanie, aby uporządkować wyniki.')}
    </p>}
    {!hero && <div className="trip-presets" role="group" aria-label={t("Szybkie filtry")}>
      {tripPresets.filter(preset=>!(preset.id==="weekend" && locked.weekend) && !(preset.id==="nights" && locked.duration_min)).map(preset=><div key={preset.id}>
        <button type="button" disabled={pending} aria-pressed={presetActive(presetDraft??filters,preset.id)} aria-describedby={`preset-${preset.id}`}
          onClick={event=>{const form=event.currentTarget.form!;if(form.reportValidity())submit(form,preset.id);}}>{t(preset.label)}</button>
      </div>)}
    </div>}
    {!hero && <p className="field-hint">{t('Skróty zastępują własne pola i od razu stosują formularz. Ponowne kliknięcie usuwa te warunki.')}</p>}
    {!hero && <details className="preset-rules"><summary>{t("Jak działają filtry")}</summary>{tripPresets.map(preset=><p id={`preset-${preset.id}`} className="field-hint" key={preset.id}><strong>{t(preset.label)}: </strong>{t(preset.rule)}</p>)}<p className="field-hint">{t("Szybkie filtry łączą się z pozostałymi warunkami i wybranymi datami. Ponowne kliknięcie usuwa ich warunki, bez przywracania wcześniejszych wartości.")}</p><p className="field-hint">{t("Daty wyznaczają zakres możliwego wylotu (obie granice włącznie), nie termin powrotu. Puste pole oznacza brak granicy.")}</p></details>}
    {validation && <p id={errorId} className="notice" role="alert">{validation}</p>}
    {pending && <p className="filter-pending" role="status">{stateText(locale,'Stosujemy wybrane filtry…')}</p>}

   </form>
   {!hero && <div className="active-filters"><p>{t("Zastosowane filtry")} ({active.length})</p>
    {active.length===0 && <p className="field-hint">{t('Brak dodatkowych filtrów.')}</p>}
    {active.length>0 && <nav className="filter-chips" aria-label={t("Zastosowane filtry")}>{active.map(key=>
     <Link className="filter-chip" key={key} href={withoutFilter(key)} aria-label={`${t("Usuń filtr:")} ${filterLabels[key]}: ${filterValue(key)}`} onClick={()=>track("FILTER_USE",undefined,undefined,{filter:{action:"remove"}})} onNavigate={event=>{if(key==="origin"){event.preventDefault();startTransition(()=>clearOriginAndNavigate(withoutFilter(key)));}}}>
      <span>{filterLabels[key]}: <strong>{filterValue(key)}</strong></span><span aria-hidden="true">×</span>
     </Link>
    )}</nav>}{active.length>0 && <><Link className="filter-reset" href={resetUrl} onClick={()=>track("FILTER_USE",undefined,undefined,{filter:{action:"reset"}})} onNavigate={event=>{event.preventDefault();startTransition(()=>clearOriginAndNavigate(resetUrl));}}>{t("Wyczyść wszystkie filtry")}</Link><span className="field-hint">{t('Reset usuwa filtry. Wybrane sortowanie pozostaje bez zmian.')}</span></>}
   </div>}
  </section>;
}
