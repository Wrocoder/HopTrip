"use client";
import {useLocale} from "./locale-provider";
import {filterText} from "../../lib/i18n/filter-copy";

import {useId,useRef,useState} from "react";
import type {Airport} from "../../lib/api";
import {airportLabel,airportSuggestions,matchingAirports} from "../../lib/airports";
import {normalizedOrigin} from "../../lib/origin-preference";
import {ComboboxOptions,useCombobox} from './combobox';


export function AirportSelect({airports,value="",errorId,inputId,onSelect}:{airports:Airport[];value?:string;errorId?:string;inputId?:string;onSelect?:(origin:string)=>void}) {
  const {locale,messages:pl}=useLocale();
  const t=(source:string)=>filterText(locale,source);
  const generatedId=useId(),id=inputId ?? generatedId;
  const input=useRef<HTMLInputElement>(null);
  const label=(value:string)=>{
    const matches=matchingAirports(airports,value);
    return matches.length===1 ? airportLabel(matches[0],locale) : value;
  };
  const [draft,setDraft]=useState(()=>({value,text:label(value),dirty:false,locale}));
  const text=draft.value===value && draft.locale===locale ? draft.text : label(value);
  const suggestions=airportSuggestions(airports,text);
  function choose(airport:Airport) {
    setDraft({value:onSelect ? airport.iata_code : value,text:airportLabel(airport,locale),dirty:false,locale});
    input.current?.setCustomValidity("");
    onSelect?.(airport.iata_code);
  }
  const combobox=useCombobox(id,suggestions,choose);
  return <div className="airport-select">
    <label htmlFor={id}>{pl.from}</label>
    <input ref={input} id={id} name="origin" value={text} maxLength={240}
      placeholder={t("Dowolne lotnisko")} {...combobox.inputProps}
      aria-invalid={Boolean(errorId)}
      aria-describedby={`${id}-hint${errorId ? ` ${errorId}` : ""}`}
      onBlur={event=>{
        combobox.close();
        // The form submit saves and redirects atomically. A competing blur
        // navigation could otherwise overtake that search redirect.
        if(event.relatedTarget instanceof HTMLElement && event.relatedTarget.closest('button[type="submit"]'))return;
        if(!onSelect || draft.value!==value || draft.locale!==locale || !draft.dirty)return;
        const matches=matchingAirports(airports,text);
        if(!text.trim()){setDraft({value:"",text:"",dirty:false,locale});onSelect("");}
        else if(matches.length===1)combobox.choose(matches[0]);
        else if(!airports.length && normalizedOrigin(text)){
          const code=normalizedOrigin(text);setDraft({value:code,text:code,dirty:false,locale});onSelect(code);
        }
      }}
      onChange={event=>{setDraft({value,text:event.target.value,dirty:true,locale});combobox.change(event.target.value);event.target.setCustomValidity("");}}/>
    <ComboboxOptions id={id} label={t("Lotniska wylotu")} options={suggestions}
      active={combobox.active} expanded={combobox.expanded} onChoose={combobox.choose}
      optionKey={airport=>airport.id} optionLabel={airport=>airportLabel(airport,locale)}/>
    <span id={`${id}-hint`} className="field-hint">{!airports.length
      ? t("Podpowiedzi są niedostępne. Wpisz kod lotniska, np. WRO.")
      : t("Miasto lub kod IATA. Puste pole: dowolne.")}</span>
  </div>;
}
