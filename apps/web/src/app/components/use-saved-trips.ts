"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import {savedTripsKey} from '../../lib/shared-trip';
import {commitPlanOperation,readPlanCollection,savedPlansKey,type PlanOperation,type PlanResult} from '../../lib/saved-plans';

const changed='hoptrip:saved-trips-changed';
export function useSavedTrips(){
 const [state,setState]=useState({...readPlanCollection(null,null),ready:false,readError:false,lockingAvailable:false});
 const [busy,setBusy]=useState(false),pending=useRef(false);
 const reload=useCallback(()=>{
  const lockingAvailable=!!navigator.locks;
  try{setState({...readPlanCollection(localStorage.getItem(savedPlansKey),localStorage.getItem(savedTripsKey)),ready:true,readError:false,lockingAvailable});}
  catch{setState(previous=>({...previous,ready:true,readError:true,lockingAvailable}));}
 },[]);
 useEffect(()=>{
  // eslint-disable-next-line react-hooks/set-state-in-effect
  reload();
  const storage=(event:StorageEvent)=>{if(event.key===savedTripsKey||event.key===savedPlansKey||event.key===null)reload();};
  window.addEventListener('storage',storage);
  window.addEventListener('focus',reload);
  window.addEventListener('pageshow',reload);
  window.addEventListener(changed,reload);
  return()=>{
   window.removeEventListener('storage',storage);window.removeEventListener('focus',reload);
   window.removeEventListener('pageshow',reload);window.removeEventListener(changed,reload);
  };
 },[reload]);
 async function mutate(operation:PlanOperation):Promise<PlanResult>{
  if(pending.current)return {status:'busy'};
  pending.current=true;setBusy(true);
  try{
   // The driver takes an exclusive cross-tab lock before reading either key.
   const result=await commitPlanOperation(localStorage,navigator.locks,operation,()=>crypto.randomUUID());
   if(result.next)window.dispatchEvent(new Event(changed));else reload();
   return result;
  }catch{reload();return {status:'error'};}
  finally{pending.current=false;setBusy(false);}
 }
 const items=state.format==='v2'?state.plans:state.legacyTokens.map(token=>({id:null,revision:0,token}));
 return {...state,busy,items,tokens:items.map(plan=>plan.token),requiresMigration:state.format==='legacy'&&!state.corrupt,mutate};
}
