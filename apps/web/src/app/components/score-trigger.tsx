"use client";

import {useEffect, useId, useRef, useState, type ReactNode} from "react";

export function ScoreTrigger({score,slug,destination,provisional,children}:{
  score:number; slug:string; destination:string; provisional:boolean; children:ReactNode;
}) {
  const [open,setOpen]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const trigger=useRef<HTMLAnchorElement>(null);
  const titleId=useId();
  useEffect(()=>{
    if(!open) return;
    const element=dialog.current;
    const opener=trigger.current;
    if(!element) return;
    element.showModal();
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return ()=>{
      element.close();
      document.body.style.overflow=previous;
      opener?.focus({preventScroll:true});
    };
  },[open]);
  return <>
    <a ref={trigger} className="score-badge score-trigger" href={`/deals/${slug}#score`}
      aria-haspopup="dialog" aria-label={`Wyjaśnij ocenę ${score}/100: ${destination}${provisional ? ", ocena wstępna" : ""}`}
      title="Sprawdź, skąd biorą się punkty"
      onClick={event=>{if(!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey){event.preventDefault();setOpen(true);}}}>
      <span>{provisional ? "Ocena wstępna" : "Ocena"}: {score}/100 <span aria-hidden="true">ⓘ</span></span>
    </a>
    <dialog ref={dialog} className="score-dialog" aria-labelledby={titleId}
      onClose={()=>setOpen(false)} onClick={event=>{
        if(event.target !== event.currentTarget) return;
        const box=event.currentTarget.getBoundingClientRect();
        if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) setOpen(false);
      }}>
      <div className="score-dialog-header"><div><p className="eyebrow">{destination} · ocena oferty</p>
        <h2 id={titleId}>Skąd {score}/100?</h2></div>
        <button type="button" className="score-close" onClick={()=>setOpen(false)} autoFocus aria-label="Zamknij wyjaśnienie oceny">✕</button>
      </div>
      {children}
    </dialog>
  </>;
}
