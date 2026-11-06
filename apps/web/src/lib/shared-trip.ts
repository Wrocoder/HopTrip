import {readBudgetDraft,budgetDateCounts,type BudgetDraft} from "./budget-draft.ts";
import {calculateBudget,moneyInGrosz} from "./trip-budget.ts";
import {invalidProfiles} from './budget-estimates.ts';

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
 if(!draft || invalidProfiles(draft.estimates).length || !calculateBudget(draft.input,draft.events).valid ||
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
// A fragment is not included in the HTTP request or referrer. The payload is
// still readable by anyone holding the link; it is not encrypted.
export const tripPath=(token:string)=>`/trip#plan=${token}`;
export function readSavedTrips(raw:string|null):string[] {
 return readSavedTripsState(raw).tokens;
}

export function readSavedTripsState(raw:string|null):{tokens:string[];corrupt:boolean}{
 if(raw===null)return {tokens:[],corrupt:false};
 if(raw.length>140000)return {tokens:[],corrupt:true};
 try{
  const values:unknown=JSON.parse(raw);
  if(!Array.isArray(values))return {tokens:[],corrupt:true};
  const tokens:string[]=[];
  let corrupt=values.length>20;
  for(const value of values.slice(0,20)){
   if(typeof value!=='string'||!decodeTrip(value)){corrupt=true;continue;}
   if(!tokens.includes(value))tokens.push(value);
  }
  return {tokens,corrupt};
 }catch{return {tokens:[],corrupt:true};}
}

export function changeSavedTrips(raw:string|null,token:string,action:'save'|'remove'):{tokens:string[];status:'saved'|'already'|'full'|'corrupt'|'invalid'|'removed'|'absent'}{
 const {tokens,corrupt}=readSavedTripsState(raw);
 if(corrupt)return {tokens,status:'corrupt'};
 if(!decodeTrip(token))return {tokens,status:'invalid'};
 if(action==='remove')return {tokens:tokens.filter(item=>item!==token),status:tokens.includes(token)?'removed':'absent'};
 if(tokens.includes(token))return {tokens,status:'already'};
 if(tokens.length>=20)return {tokens,status:'full'};
 return {tokens:[token,...tokens],status:'saved'};
}
