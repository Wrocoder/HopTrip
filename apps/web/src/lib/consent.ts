export const CONSENT_KEY = "hoptrip.consent.v1";
export const CONSENT_EVENT = "hoptrip:consent";
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export type Consent = {version:1;analytics:boolean;marketing:boolean;at:number};
let fallback = "";
export function consentSnapshot():string {
  if(typeof window === "undefined") return "";
  try { return localStorage.getItem(CONSENT_KEY) ?? ""; } catch { return fallback; }
}
export function readConsent():Consent|null {
  try {
    const c=JSON.parse(consentSnapshot());
    if(c?.version===1 && typeof c.analytics==="boolean" && typeof c.marketing==="boolean"
      && typeof c.at==="number" && c.at<=Date.now() && Date.now()-c.at<MAX_AGE) return c;
  } catch {}
  return null;
}
export function analyticsAllowed():boolean {return readConsent()?.analytics===true;}
export function saveConsent(analytics:boolean,marketing:boolean) {
  fallback=JSON.stringify({version:1,analytics,marketing,at:Date.now()});
  try {localStorage.setItem(CONSENT_KEY,fallback);} catch {}
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
export function subscribeConsent(callback:()=>void) {
  window.addEventListener(CONSENT_EVENT,callback);
  window.addEventListener("storage",callback);
  const timer=window.setInterval(callback,60000);
  return ()=>{window.removeEventListener(CONSENT_EVENT,callback);window.removeEventListener("storage",callback);clearInterval(timer);};
}
