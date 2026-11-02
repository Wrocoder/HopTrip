"use client";
import {useLocale} from "./locale-provider";
import {filterText} from "../../lib/i18n/filter-copy";

import {useId,useRef,useState} from "react";
import type {Destination} from "../../lib/api";
import {destinationLabel,destinationSuggestions,matchingDestinations} from "../../lib/destinations";
import {ComboboxOptions,useCombobox} from './combobox';


export function DestinationSelect({destinations,value="",errorId,anywhere=false}:{destinations:Destination[];value?:string;errorId?:string;anywhere?:boolean}) {
  const {locale,messages:pl}=useLocale();
  const t=(source:string)=>filterText(locale,source);
  const id=useId();
  const input=useRef<HTMLInputElement>(null);
  const [text,setText]=useState(()=>{
    const matches=matchingDestinations(destinations,value);
    return matches.length===1 ? destinationLabel(matches[0],locale) : value;
  });
  const [selectedSlug,setSelectedSlug]=useState(()=>{const matches=matchingDestinations(destinations,value);return matches.length===1 ? matches[0].slug : "";});
  const suggestions=destinationSuggestions(destinations,text);
  const options:(Destination|null)[]=anywhere ? [null,...suggestions] : suggestions;
  function choose(destination:Destination|null) {
    setSelectedSlug(destination?.slug ?? "");setText(destination ? destinationLabel(destination,locale) : "");
    input.current?.setCustomValidity("");
  }
  const combobox=useCombobox(id,options,choose);
  return <div className="airport-select">
    <label htmlFor={id}>{pl.to}</label>
    <input ref={input} id={id} name="destination" data-destination-slug={selectedSlug} value={text} maxLength={240}
      placeholder={anywhere ? t("Dokądkolwiek") : t("Mediolan lub MIL")} {...combobox.inputProps}
      aria-invalid={Boolean(errorId)}
      aria-describedby={`${id}-hint${errorId ? ` ${errorId}` : ""}`}
      onBlur={()=>{if(selectedSlug){combobox.close();return;}const matches=matchingDestinations(destinations,text);if(matches.length===1)combobox.choose(matches[0]);else combobox.close();}}
      onChange={event=>{setSelectedSlug("");setText(event.target.value);combobox.change(event.target.value);event.target.setCustomValidity("");}}/>
    <ComboboxOptions id={id} label={t("Kierunki podróży")} options={options}
      active={combobox.active} expanded={combobox.expanded} onChoose={combobox.choose}
      optionKey={destination=>destination?.id ?? "anywhere"}
      optionLabel={destination=>destination ? <>{destinationLabel(destination,locale)} ({destination.country_code})</> : t("Dokądkolwiek")}/>
    <span id={`${id}-hint`} className="field-hint">{!destinations.length
      ? t("Podpowiedzi są niedostępne. Wpisz nazwę lub identyfikator kierunku, np. milan.")
      : t("Miasto lub kod IATA. Puste pole: dowolne.")}</span>
  </div>;
}
