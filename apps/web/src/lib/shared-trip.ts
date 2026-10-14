import {readBudgetDraft,budgetDateCounts,type BudgetDraft} from "./budget-draft.ts";
import {calculateBudget,moneyInGrosz} from "./trip-budget.ts";

export type TripOffer={slug:string;origin:string;destination:string;start:string;end:string;price:string;observedAt:string};
export type SharedTrip={version:1;offer:TripOffer;draft:BudgetDraft};
export const savedTripsKey="hoptrip.saved-trips.v1";
const date=(v:unknown)=>typeof v==="string" && (v==="" || budgetDateCounts(v,v)!==null);
export function cleanSharedTrip(value:unknown):SharedTrip|null {
 if(!value || typeof value!=="object")return null;
 const v=value as SharedTrip;
 const o=v.offer;
 if(v.version!==1 || !o || typeof o.slug!=="string" || !/^[a-zA-Z0-9_-]{1,180}$/.test(o.slug) ||
  ![o.origin,o.destination].every(s=>typeof s==="string" && s.length>0 && s.length<=100 && !/[<>\r\n]/.test(s)) ||
  !date(o.start) || !date(o.end) || typeof o.price!=="string" || moneyInGrosz(o.price)===undefined ||
  typeof o.observedAt!=="string" || o.observedAt.length>40 || (o.observedAt!=="" && !Number.isFinite(Date.parse(o.observedAt))))return null;
 const draft=readBudgetDraft(JSON.stringify(v.draft));
 if(!draft || !calculateBudget(draft.input).valid ||
  (draft.end && !budgetDateCounts(draft.start,draft.end)))return null;
 for(const [key,amount] of Object.entries(draft.input)) {
  if(!["hotel_basis","people","nights","days"].includes(key) && moneyInGrosz(amount)===undefined)return null;
 }
 // Reconstruct the allowlist. Never serialize private context, arbitrary extra fields or notes.
 return {version:1,offer:{slug:o.slug,origin:o.origin,destination:o.destination,start:o.start,end:o.end,price:o.price,observedAt:o.observedAt},
  draft:{...draft,context:"",review:true}};
}
export function encodeTrip(value:SharedTrip):string|null {
 const trip=cleanSharedTrip(value);
 if(!trip)return null;
 const bytes=new TextEncoder().encode(JSON.stringify(trip));
 const encoded=btoa(String.fromCharCode(...bytes)).replaceAll("+","-").replaceAll("/","_").replace(/=+$/g,"");
 return encoded.length<=6000 ? encoded : null;
}
export function decodeTrip(token:unknown):SharedTrip|null {
 if(typeof token!=="string" || token.length>6000 || !/^[A-Za-z0-9_-]+$/.test(token))return null;
 try {return cleanSharedTrip(JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(Uint8Array.from(atob(token.replaceAll("-","+").replaceAll("_","/")),c=>c.charCodeAt(0)))));}catch{return null;}
}
export const tripPath=(token:string)=>`/trip?plan=${token}`;
export function readSavedTrips(raw:string|null):string[] {
 try {const v=JSON.parse(raw??"[]");return Array.isArray(v) ? v.slice(0,20).filter((s):s is string=>typeof s==="string" && decodeTrip(s)!==null) : [];}catch{return [];}
}
