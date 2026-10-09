"use client";

import {useId,useRef,useState} from "react";
import type {Airport} from "../../lib/api";
import {airportLabel,airportSuggestions,matchingAirports} from "../../lib/airports";
import {pl} from "../../lib/pl";

export function AirportSelect({airports,value=""}:{airports:Airport[];value?:string}) {
  const id=useId();
  const input=useRef<HTMLInputElement>(null);
  const [text,setText]=useState(()=>{
    const matches=matchingAirports(airports,value);
    return matches.length===1 ? airportLabel(matches[0]) : value;
  });
  const [open,setOpen]=useState(false);
  const [active,setActive]=useState(-1);
  const suggestions=airportSuggestions(airports,text);
  const expanded=open && suggestions.length>0;
  function choose(airport:Airport) {
    setText(airportLabel(airport));setOpen(false);setActive(-1);
    input.current?.setCustomValidity("");
  }
  return <div className="airport-select">
    <label htmlFor={id}>{pl.from}</label>
    <input ref={input} id={id} name="origin" value={text} maxLength={240}
      placeholder="Wrocław lub WRO" autoComplete="off" role="combobox"
      aria-autocomplete="list" aria-expanded={expanded} aria-controls={`${id}-options`}
      aria-activedescendant={expanded && active>=0 ? `${id}-option-${active}` : undefined}
      aria-describedby={`${id}-hint`}
      onFocus={()=>{setOpen(true);setActive(-1);}}
      onBlur={()=>setOpen(false)}
      onChange={event=>{setText(event.target.value);setOpen(true);setActive(-1);event.target.setCustomValidity("");}}
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
    <ul id={`${id}-options`} role="listbox" aria-label="Lotniska wylotu" hidden={!expanded}>
      {suggestions.map((airport,index)=><li id={`${id}-option-${index}`} key={airport.id}
        role="option" aria-selected={active===index}
        onMouseDown={event=>event.preventDefault()} onClick={()=>choose(airport)}>
        {airportLabel(airport)}
      </li>)}
    </ul>
    <span id={`${id}-hint`} className="field-hint">{!airports.length
      ? "Podpowiedzi są niedostępne. Wpisz kod lotniska, np. WRO."
      : "Miasto lub kod IATA. Puste pole: dowolne."}</span>
  </div>;
}
