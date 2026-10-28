"use client";
import {useLocale} from "./locale-provider";
import {filterText} from "../../lib/i18n/filter-copy";

import {useId,useRef,useState} from "react";
import type {Destination} from "../../lib/api";
import {destinationLabel,destinationSuggestions,matchingDestinations} from "../../lib/destinations";


export function DestinationSelect({destinations,value="",errorId}:{destinations:Destination[];value?:string;errorId?:string}) {
  const {locale,messages:pl}=useLocale();
  const t=(source:string)=>filterText(locale,source);
  const id=useId();
  const input=useRef<HTMLInputElement>(null);
  const [text,setText]=useState(()=>{
    const matches=matchingDestinations(destinations,value);
    return matches.length===1 ? destinationLabel(matches[0],locale) : value;
  });
  const [selectedSlug,setSelectedSlug]=useState(()=>{const matches=matchingDestinations(destinations,value);return matches.length===1 ? matches[0].slug : "";});
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(-1);
  const suggestions=destinationSuggestions(destinations,text);
  const expanded=open && suggestions.length>0;
  function choose(destination:Destination) {
    setSelectedSlug(destination.slug);setText(destinationLabel(destination,locale));setOpen(false);setActive(-1);
    input.current?.setCustomValidity("");
  }
  return <div className="airport-select">
    <label htmlFor={id}>{pl.to}</label>
    <input ref={input} id={id} name="destination" data-destination-slug={selectedSlug} value={text} maxLength={240}
      placeholder={t("Mediolan lub MIL")} autoComplete="off" role="combobox"
      aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-options`}
      aria-activedescendant={expanded && active>=0 ? `${id}-option-${active}` : undefined}
      aria-invalid={Boolean(errorId)}
      aria-describedby={`${id}-hint${errorId ? ` ${errorId}` : ""}`}
      onFocus={()=>{setOpen(true);setActive(-1);}}
      onBlur={()=>{if(selectedSlug){setOpen(false);return;}const matches=matchingDestinations(destinations,text);if(matches.length===1)choose(matches[0]);else setOpen(false);}}
      onChange={event=>{setSelectedSlug("");setText(event.target.value);setOpen(Boolean(event.target.value.trim()));setActive(-1);event.target.setCustomValidity("");}}
      onKeyDown={event=>{
        if(event.key==="Escape") {setOpen(false);setActive(-1);}
        if((event.key==="ArrowDown" || event.key==="ArrowUp") && suggestions.length) {
          event.preventDefault();setOpen(true);
          setActive(previous=>event.key==="ArrowDown" ? (previous+1)%suggestions.length :
            (previous<0 ? suggestions.length-1 : (previous-1+suggestions.length)%suggestions.length));
        }
        if(event.key==="Enter" && expanded && active>=0) {
          event.preventDefault();choose(suggestions[active]);
        }
      }}/>
    <ul id={`${id}-options`} role="listbox" aria-label={t("Kierunki podróży")} hidden={!expanded}>
      {suggestions.map((destination,index)=><li id={`${id}-option-${index}`} key={destination.id}
        role="option" aria-selected={active===index}
        onMouseDown={event=>event.preventDefault()} onClick={()=>choose(destination)}>
        {destinationLabel(destination,locale)} ({destination.country_code})
      </li>)}
    </ul>
    <span id={`${id}-hint`} className="field-hint">{!destinations.length
      ? t("Podpowiedzi są niedostępne. Wpisz nazwę lub identyfikator kierunku, np. milan.")
      : t("Miasto lub kod IATA. Puste pole: dowolne.")}</span>
  </div>;
}
