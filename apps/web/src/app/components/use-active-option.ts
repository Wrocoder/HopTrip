"use client";
import {useEffect} from 'react';

// Keep aria-activedescendant visible without moving focus off the text input.
export function useActiveOption(id:string,expanded:boolean,active:number) {
 useEffect(()=>{
  if(expanded&&active>=0)document.getElementById(`${id}-option-${active}`)?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
 },[id,expanded,active]);
}
