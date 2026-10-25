'use client';
import {useEffect,useState} from 'react';

export function useOfferExpired(deadline?:string|null){
 const [state,setState]=useState<{deadline?:string|null;expired:boolean}>({expired:false});
 useEffect(()=>{
  const end=deadline ? Date.parse(deadline) : NaN;
  if(!Number.isFinite(end))return;
  let timer:ReturnType<typeof setTimeout>;
  const update=()=>{
   clearTimeout(timer);
   const remaining=end-Date.now();
   setState({deadline,expired:remaining<=0});
   if(remaining>0)timer=setTimeout(update,Math.min(remaining,2147483647));
  };
  window.addEventListener('focus',update);
  document.addEventListener('visibilitychange',update);
  timer=setTimeout(update,0);
  return ()=>{clearTimeout(timer);window.removeEventListener('focus',update);document.removeEventListener('visibilitychange',update);};
 },[deadline]);
 return state.deadline===deadline&&state.expired;
}
