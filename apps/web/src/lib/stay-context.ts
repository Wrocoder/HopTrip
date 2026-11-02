import type {Deal} from './api.ts';
import {flightLegs,flightLocalCalendarDate} from './flight-facts.ts';
import {changeStayDate,type BudgetDraft} from './budget-draft.ts';

export type StaySuggestion={checkin:string|null;checkout:string|null;estimated:boolean};
export function staySuggestion(deal:Pick<Deal,'trip_type'|'flight_facts'|'flight_quality'>):StaySuggestion {
 const quality=deal.flight_quality;
 if(quality?.version!=='flight-quality-v1'||!['COMPLETE','PARTIAL'].includes(quality.status))return {checkin:null,checkout:null,estimated:false};
 const {outbound,inbound}=flightLegs(deal.flight_facts);
 const checkin=flightLocalCalendarDate(outbound.arrival,outbound.destinationZone);
 const checkout=deal.trip_type==='ROUND_TRIP'?flightLocalCalendarDate(inbound.departure,inbound.originZone):null;
 return {checkin,checkout,estimated:Boolean(checkin&&outbound.calculated)};
}

/** Explicit user action; preserve entered costs, people and any unsuggested date. */
export function applyStaySuggestion(draft:BudgetDraft,suggestion:StaySuggestion):BudgetDraft {
 let next=draft;
 if(suggestion.checkin)next=changeStayDate(next,'start',suggestion.checkin);
 if(suggestion.checkout)next=changeStayDate(next,'end',suggestion.checkout);
 return next;
}
