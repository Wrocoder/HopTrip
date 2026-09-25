"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from "react";
import Link from "next/link";
import {consentSnapshot,readConsent,saveConsent,subscribeConsent} from "../../lib/consent";
import {clearSession,track} from "../../lib/session";

export function ConsentControls({driveEnabled}:{driveEnabled:boolean}) {
  // The expiry flag changes even when the stored value itself has not changed.
  const snapshot=useSyncExternalStore(subscribeConsent,()=>readConsent()?consentSnapshot():"",()=>"");
  const consent=snapshot ? JSON.parse(snapshot) : null;
  const analytics=consent?.analytics===true,marketing=consent?.marketing===true;
  const [editing,setEditing]=useState(false);
  const [selectedAnalytics,setAnalytics]=useState(false);
  const [selectedMarketing,setMarketing]=useState(false);
  const panel=useRef<HTMLElement>(null);
  const settings=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    if(!analytics) clearSession();
    else track("PAGE_VIEW");
  },[analytics]);
  useEffect(()=>{
    const previous=document.getElementById("travelpayouts-drive");
    if(!marketing && previous) {window.location.reload();return;}
    if(!driveEnabled || !marketing || previous) return;
    const script=document.createElement("script");
    script.id="travelpayouts-drive";
    script.async=true;
    script.src="https://emrld.ltd/NTc3NTY5.js?t=577569";
    script.setAttribute("data-cmp-ab","2");
    document.head.appendChild(script);
    // A loaded third-party script cannot be undone by removing its element.
    // Withdrawal reloads the document with the saved opt-out instead.
  },[marketing,driveEnabled]);
  function choose(a:boolean,m:boolean) {
    saveConsent(a,m);setEditing(false);settings.current?.focus();
  }
  const open=!consent || editing;
  return <div className="consent-controls">
    <button ref={settings} type="button" className="privacy-settings" onClick={()=>{
      setAnalytics(analytics);setMarketing(marketing);setEditing(true);
      requestAnimationFrame(()=>panel.current?.focus());
    }}>Ustawienia prywatności</button>
    {open && <section ref={panel} tabIndex={-1} className="consent-panel" aria-labelledby="consent-title">
      <h2 id="consent-title">Twój wybór prywatności</h2>
      <p>Możesz korzystać z ofert bez opcjonalnej analityki i skryptów marketingowych.
        Zapamiętamy Twój wybór przez 180 dni. Możesz go zmienić lub wycofać w ustawieniach prywatności.</p>
      <label><input type="checkbox" checked={selectedAnalytics} onChange={e=>setAnalytics(e.target.checked)}/>
        Analityka HopTrip — statystyki odsłon i korzystania z ofert, identyfikator sesji w przeglądarce.</label>
      <label><input type="checkbox" checked={selectedMarketing} onChange={e=>setMarketing(e.target.checked)}/>
        Travelpayouts Drive — zewnętrzny skrypt marketingowy z emrld.ltd, który odczytuje stronę i zmienia linki na partnerskie.</label>
      <p>Wycofanie zgody na Drive odświeży stronę. Przejścia do partnerów odbywają się na ich zasadach.
        {" "}<Link href="/info/privacy">Prywatność</Link>{" · "}
        <a href="https://support.travelpayouts.com/hc/en-us/articles/360004121052-Privacy-Policy" rel="noopener noreferrer" target="_blank">Zasady Travelpayouts</a></p>
      <div className="consent-actions">
        <button type="button" onClick={()=>choose(false,false)}>Odrzuć opcjonalne</button>
        <button type="button" onClick={()=>choose(true,true)}>Akceptuj wszystkie</button>
        <button type="button" onClick={()=>choose(selectedAnalytics,selectedMarketing)}>Zapisz wybór</button>
      </div>
    </section>}
  </div>;
}
