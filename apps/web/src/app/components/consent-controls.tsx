"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation unloads Drive before rendering personal operator details. */
import {useEffect,useRef,useState,useSyncExternalStore} from "react";
import {createPortal} from "react-dom";
import {useLocale} from "./locale-provider";
import {shell} from "../../lib/i18n/shell";
import {localizedHref} from "../../lib/i18n/routing";
import {driveAllowedOnPage} from "../../lib/drive-policy";
import {usePathname} from "next/navigation";
import {consentSnapshot,readConsent,saveConsent,subscribeConsent} from "../../lib/consent";
import {clearSession,track} from "../../lib/session";

// The portal host belongs to the persistent root layout; no DOM subscription is needed.
const subscribePanel=()=>()=>{};

export function ConsentControls({driveEnabled}:{driveEnabled:boolean}) {
  const pathname=localizedHref(usePathname(),"pl");
  const {locale,messages}=useLocale();
  const text=shell[locale];
  const panelHost=useSyncExternalStore(subscribePanel,()=>document.getElementById("privacy-panel"),()=>null);
  // Curated affiliate links must not be rewritten by an independent script.
  const managedLinks=!driveAllowedOnPage(pathname);
  const legal=/^\/info\/(contact|privacy|terms)\/?$/.test(pathname) || pathname.startsWith("/alerts");
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
    if((!marketing || legal || managedLinks) && previous) {window.location.reload();return;}
    if(!driveEnabled || !marketing || legal || managedLinks || previous) return;
    const script=document.createElement("script");
    script.id="travelpayouts-drive";
    script.async=true;
    script.src="https://emrld.ltd/NTc3NTY5.js?t=577569";
    script.setAttribute("data-cmp-ab","2");
    document.head.appendChild(script);
    // A loaded third-party script cannot be undone by removing its element.
    // Withdrawal reloads the document with the saved opt-out instead.
  },[marketing,driveEnabled,legal,managedLinks]);
  function choose(a:boolean,m:boolean) {
    saveConsent(a,m);setEditing(false);settings.current?.focus({preventScroll:true});
  }
  const open=!consent || editing;
  return <div className="consent-controls">
    <button ref={settings} type="button" className="privacy-settings" onClick={()=>{
      setAnalytics(analytics);setMarketing(marketing);setEditing(true);
      requestAnimationFrame(()=>panel.current?.focus());
    }}>{text.settings}</button>
    {open && panelHost && createPortal(<section ref={panel} tabIndex={-1} className="consent-panel" aria-labelledby="consent-title">
      <h2 id="consent-title">{text.consentTitle}</h2>
      <p>{text.consentIntro}</p>
      <label><input type="checkbox" checked={selectedAnalytics} onChange={e=>setAnalytics(e.target.checked)}/>
        {text.analytics}</label>
      <label><input type="checkbox" checked={selectedMarketing} onChange={e=>setMarketing(e.target.checked)}/>
        {text.marketing}</label>
      <details><summary>{text.consentHow}</summary>
        <p>{text.consentDetails}</p>
        <p><a href="/info/privacy">{messages.privacy}{locale!=="pl" && ` (${text.polish})`}</a>{" · "}
          <a href="https://support.travelpayouts.com/hc/en-us/articles/360004121052-Privacy-Policy" rel="noopener noreferrer" target="_blank">{text.partnerPolicy}</a></p>
      </details>
      <div className="consent-actions">
        <button type="button" onClick={()=>choose(false,false)}>{text.reject}</button>
        <button type="button" onClick={()=>choose(true,true)}>{text.accept}</button>
        <button type="button" onClick={()=>choose(selectedAnalytics,selectedMarketing)}>{text.save}</button>
      </div>
    </section>,panelHost)}
  </div>;
}
