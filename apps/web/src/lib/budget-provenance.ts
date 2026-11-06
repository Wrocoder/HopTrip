import {costFields,emptyBudget,moneyInGrosz,type BudgetInput,type CostKey} from './trip-budget.ts';
import {referenceCosts,type ReferenceCost} from './reference-costs.ts';
import type {EurRate} from './exchange-rate.ts';
import {validCalendarDate} from './calendar-date.ts';

export type BudgetMoneyKey=CostKey|'hotel_total';
export const budgetMoneyKeys:readonly BudgetMoneyKey[]=[...costFields.map(field=>field.key),'hotel_total'];
export type OfferBudgetOrigin={kind:'OFFER';amount:string;offerSlug:string;observedAt:string};
export type ReferenceBudgetOrigin={kind:'REFERENCE';amount:string;referenceId:string;euroCents:number;checkedAt:string;quantity:number;rate:EurRate};
export type BudgetOrigin=OfferBudgetOrigin|ReferenceBudgetOrigin;
export type BudgetProvenance={version:'budget-provenance-v1';fields:Partial<Record<BudgetMoneyKey,BudgetOrigin>>};
export type BudgetOriginKind='UNKNOWN'|'INVALID'|'MANUAL'|'OFFER'|'REFERENCE';
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const amount=(value:unknown):value is string=>typeof value==='string'&&value.length<=32&&moneyInGrosz(value)!=null;

// Optional annotations never replace amounts or make a shared snapshot authentic.
// Invalid/mismatched metadata is discarded; the user's budget remains readable.
export function cleanBudgetProvenance(value:unknown,input:BudgetInput):BudgetProvenance|undefined{
 if(!object(value)||value.version!=='budget-provenance-v1'||!object(value.fields))return;
 const fields:BudgetProvenance['fields']={};
 for(const key of budgetMoneyKeys){
  if(!Object.hasOwn(value.fields,key))continue;
  const entry=value.fields[key];
  if(!object(entry)||!amount(entry.amount)||moneyInGrosz(entry.amount)!==moneyInGrosz(input[key]))continue;
  if(entry.kind==='OFFER'&&key==='flight'&&typeof entry.offerSlug==='string'&&/^[a-zA-Z0-9_-]{1,180}$/.test(entry.offerSlug)&&
   typeof entry.observedAt==='string'&&entry.observedAt.length<=40&&(entry.observedAt===''||Number.isFinite(Date.parse(entry.observedAt)))){
   fields[key]={kind:'OFFER',amount:entry.amount,offerSlug:entry.offerSlug,observedAt:entry.observedAt};
  }else if(entry.kind==='REFERENCE'&&key==='local_transport'){
   const cost=referenceCosts.find(cost=>cost.id===entry.referenceId),rate=entry.rate;
   if(!cost||entry.euroCents!==cost.euroCents||entry.checkedAt!==cost.checkedAt||
    typeof entry.quantity!=='number'||!Number.isInteger(entry.quantity)||entry.quantity<1||entry.quantity>365||
    !object(rate)||typeof rate.plnPerEuro!=='number'||!Number.isFinite(rate.plnPerEuro)||rate.plnPerEuro<=0||rate.plnPerEuro>1000000||
    typeof rate.date!=='string'||!validCalendarDate(rate.date))continue;
   const expected=Math.round(cost.euroCents*entry.quantity*Math.round(rate.plnPerEuro*10000)/10000);
   if(!Number.isSafeInteger(expected)||expected!==moneyInGrosz(entry.amount))continue;
   fields[key]={kind:'REFERENCE',amount:entry.amount,referenceId:cost.id,euroCents:cost.euroCents,checkedAt:cost.checkedAt,
    quantity:entry.quantity,rate:{plnPerEuro:rate.plnPerEuro,date:rate.date}};
  }
 }
 return Object.keys(fields).length?{version:'budget-provenance-v1',fields}:undefined;
}

export function budgetOriginKind(input:BudgetInput,key:BudgetMoneyKey,provenance?:BudgetProvenance):BudgetOriginKind{
 const value=moneyInGrosz(input[key]);
 if(value===null)return 'UNKNOWN';if(value===undefined)return 'INVALID';
 return cleanBudgetProvenance(provenance,input)?.fields[key]?.kind??'MANUAL';
}
export function withoutBudgetOrigin(provenance:BudgetProvenance|undefined,key:keyof BudgetInput):BudgetProvenance|undefined{
 if(!provenance)return;
 const fields={...provenance.fields};delete fields[key as BudgetMoneyKey];
 return Object.keys(fields).length?{version:'budget-provenance-v1',fields}:undefined;
}
export function offerBudgetProvenance(offer:{slug:string;flight_price_pln:string|null;last_verified_at:string}):BudgetProvenance|undefined{
 const value=moneyInGrosz(offer.flight_price_pln??'');if(value==null)return;
 const entry:OfferBudgetOrigin={kind:'OFFER',amount:(value/100).toFixed(2),offerSlug:offer.slug,observedAt:offer.last_verified_at};
 const fields={flight:entry};
 // Reuse the same validator as restoration; no inference for legacy drafts.
 return cleanBudgetProvenance({version:'budget-provenance-v1',fields},{...emptyBudget,flight:entry.amount});
}
export function referenceBudgetOrigin(cost:ReferenceCost,quantity:number,rate:EurRate,amount:string):ReferenceBudgetOrigin{
 return {kind:'REFERENCE',amount,referenceId:cost.id,euroCents:cost.euroCents,checkedAt:cost.checkedAt,quantity,rate:{...rate}};
}
