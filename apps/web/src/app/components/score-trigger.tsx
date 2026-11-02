"use client";

import {useEffect, useId, useRef, useState, type ReactNode} from "react";
import type {Locale} from '../../lib/i18n/config';
import {scoreText} from '../../lib/i18n/score-copy';

export function ScoreTrigger({slug,href,destination,locale='pl',children}:{
  slug:string; href?:string; destination:string; locale?:Locale; children:ReactNode;
}) {
  const t=(key:Parameters<typeof scoreText>[1])=>scoreText(locale,key,{destination});
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
    <a ref={trigger} className="score-badge score-trigger" href={href ?? `/deals/${slug}#score`}
      aria-haspopup="dialog" aria-label={t('triggerLabel')}
      title={t('trigger')}
      onClick={event=>{if(!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey){event.preventDefault();setOpen(true);}}}>
      <span>{t('trigger')} <span aria-hidden="true">ⓘ</span></span>
    </a>
    <dialog ref={dialog} className="score-dialog" aria-labelledby={titleId}
      onClose={()=>setOpen(false)} onClick={event=>{
        if(event.target !== event.currentTarget) return;
        const box=event.currentTarget.getBoundingClientRect();
        if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) setOpen(false);
      }}>
      <div className="score-dialog-header"><div><p className="eyebrow">{destination} · {t('price')}</p>
        <h2 id={titleId}>{t('price')}</h2></div>
        <button type="button" className="score-close" onClick={()=>setOpen(false)} autoFocus aria-label={t('close')}>✕</button>
      </div>
      {children}
    </dialog>
  </>;
}
