"use client";
import {useState,type KeyboardEvent,type Key,type ReactNode} from 'react';
import {useActiveOption} from './use-active-option';

// Shared interaction for the airport and destination fields. Matching, draft
// persistence and blur-to-commit rules stay with their respective fields.
export function useCombobox<T>(id:string,options:readonly T[],onChoose:(option:T)=>void){
 const [open,setOpen]=useState(false),[active,setActive]=useState(-1);
 const expanded=open&&options.length>0;
 useActiveOption(id,expanded,active);
 const choose=(option:T)=>{setOpen(false);setActive(-1);onChoose(option);};
 const onKeyDown=(event:KeyboardEvent<HTMLInputElement>)=>{
  if(event.key==='Escape'){setOpen(false);setActive(-1);}
  if((event.key==='ArrowDown'||event.key==='ArrowUp')&&options.length){
   event.preventDefault();setOpen(true);
   setActive(previous=>event.key==='ArrowDown'?(previous+1)%options.length:
    (previous<0?options.length-1:(previous-1+options.length)%options.length));
  }
  if(event.key==='Enter'&&expanded&&active>=0){event.preventDefault();choose(options[active]);}
 };
 return {active,expanded,choose,close:()=>setOpen(false),
  change:(value:string)=>{setOpen(Boolean(value.trim()));setActive(-1);},
  inputProps:{autoComplete:'off' as const,role:'combobox' as const,'aria-autocomplete':'list' as const,
   'aria-expanded':expanded,'aria-controls':`${id}-options`,
   'aria-activedescendant':expanded&&active>=0?`${id}-option-${active}`:undefined,
   onFocus:()=>{setOpen(true);setActive(-1);},onKeyDown},
 };
}

export function ComboboxOptions<T>({id,label,options,active,expanded,onChoose,optionKey,optionLabel}:{
 id:string;label:string;options:readonly T[];active:number;expanded:boolean;
 onChoose:(option:T)=>void;optionKey:(option:T)=>Key;optionLabel:(option:T)=>ReactNode;
}){
 return <ul id={`${id}-options`} role="listbox" aria-label={label} hidden={!expanded}>
  {options.map((option,index)=><li id={`${id}-option-${index}`} key={optionKey(option)}
   role="option" aria-selected={active===index}
   onMouseDown={event=>event.preventDefault()} onClick={()=>onChoose(option)}>
   {optionLabel(option)}
  </li>)}
 </ul>;
}
