"use client";
import {useCallback,useEffect,useState} from 'react';
import {changeSavedTrips,readSavedTripsState,savedTripsKey} from '../../lib/shared-trip';

const changed='hoptrip:saved-trips-changed';
export function useSavedTrips(){
 const [state,setState]=useState({tokens:[] as string[],ready:false,readError:false,corrupt:false});
 const reload=useCallback(()=>{
  try{setState({...readSavedTripsState(localStorage.getItem(savedTripsKey)),ready:true,readError:false});}
  catch{setState(previous=>({...previous,ready:true,readError:true}));}
 },[]);
 useEffect(()=>{
  // eslint-disable-next-line react-hooks/set-state-in-effect
  reload();
  const storage=(event:StorageEvent)=>{if(event.key===savedTripsKey||event.key===null)reload();};
  window.addEventListener('storage',storage);
  window.addEventListener('focus',reload);
  window.addEventListener('pageshow',reload);
  window.addEventListener(changed,reload);
  return()=>{
   window.removeEventListener('storage',storage);window.removeEventListener('focus',reload);
   window.removeEventListener('pageshow',reload);window.removeEventListener(changed,reload);
  };
 },[reload]);
 function mutate(token:string,action:'save'|'remove'){
  try{
   // Always read the current collection; a stale tab must not resurrect removed plans.
   const result=changeSavedTrips(localStorage.getItem(savedTripsKey),token,action);
   if(result.status==='saved'||result.status==='removed'){
    localStorage.setItem(savedTripsKey,JSON.stringify(result.tokens));
    window.dispatchEvent(new Event(changed));
   }else reload();
   return result.status;
  }catch{reload();return 'error' as const;}
 }
 return {...state,mutate};
}
