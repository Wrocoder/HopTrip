import {ApiError,getDeals,type Deal,type Filters} from './api';
import {recommendationEligible} from './flight-quality.ts';
import {normalizedOrigin} from './origin-preference.ts';
import {offerDeadline} from './offer-expiry.ts';
import {searchUrl} from './search-policy.ts';
import {shortTripSelection} from './short-trip-selection.ts';
import {moneyInGrosz} from './trip-budget.ts';

export const homeCollectionIds=['calendar-weekend','under-300','upcoming-short'] as const;
export type HomeCollectionId=typeof homeCollectionIds[number];
export const collectionCandidateLimit=100,collectionDisplayLimit=3;
export type HomeCollectionDefinition={id:HomeCollectionId;origin:string;filters:Filters;href:string};
export type HomeCollection=HomeCollectionDefinition&{
 status:'READY'|'EMPTY'|'ERROR';offers:Deal[];
 // These are preview bounds, never total market inventory or an exact count.
 candidate_limit:100;display_limit:3;more_in_preview:boolean;
 error:'QUERY_TOO_BROAD'|'UNAVAILABLE'|null;
};

export function homeCollectionDefinitions(origin:string):HomeCollectionDefinition[]{
 const code=normalizedOrigin(origin);
 if(origin!==''&&!code)throw new RangeError('Homepage collections require one airport or an empty origin');
 const common:Filters={origin:code,round_trip:'true'};
 const definitions:Omit<HomeCollectionDefinition,'href'>[]=[
  {id:'calendar-weekend',origin:code,filters:{...common,weekend_mode:'calendar-v1',sort:'price'}},
  {id:'under-300',origin:code,filters:{...common,budget:'300',duration_min:'2',duration_max:'4',sort:'price'}},
  {id:'upcoming-short',origin:code,filters:{...common,duration_min:'2',duration_max:'4',sort:'departure'}},
 ];
 return definitions.map(d=>({...d,href:searchUrl('/deals',d.filters)}));
}

function preview(items:Deal[],definition:HomeCollectionDefinition,now:number):Deal[]{
 const ids=new Set<number>(),slugs=new Set<string>();
 return items.slice(0,collectionCandidateLimit).filter(deal=>{
  if(!recommendationEligible(deal)||definition.origin&&deal.origin_code!==definition.origin||deal.trip_type!=='ROUND_TRIP')return false;
  const deadline=offerDeadline(deal);
  const departure=Date.parse(deal.flight_facts?.outbound_departure??`${deal.trip_start}T00:00:00Z`);
  if(!deadline||Date.parse(deadline)<=now||!Number.isFinite(departure)||departure<=now)return false;
  if(definition.id==='calendar-weekend'){
   if(deal.weekend_assessment?.calendar!=='ELIGIBLE')return false;
  }else if(!shortTripSelection([deal],definition.origin).length)return false;
  if(definition.id==='under-300'){
   const grosz=moneyInGrosz(deal.price_per_person_pln);
   if(grosz==null||grosz>30000)return false;
  }
  if(ids.has(deal.id)||slugs.has(deal.slug))return false;
  ids.add(deal.id);slugs.add(deal.slug);return true;
 });
}

export async function loadHomeCollections(origin:string,now=Date.now()):Promise<HomeCollection[]>{
 if(!Number.isFinite(now))throw new RangeError('Invalid collection snapshot time');
 const definitions=homeCollectionDefinitions(origin);
 // Independent errors/empty states; no registry lookup, cache or second feed.
 return Promise.all(definitions.map(async definition=>{
  const base={...definition,candidate_limit:collectionCandidateLimit,display_limit:collectionDisplayLimit} as const;
  try{
   const candidates=await getDeals({...definition.filters,limit:String(collectionCandidateLimit)});
   const selected=preview(candidates,definition,now);
   return {...base,status:selected.length?'READY' as const:'EMPTY' as const,
    offers:selected.slice(0,collectionDisplayLimit),more_in_preview:selected.length>collectionDisplayLimit,error:null};
  }catch(error){
   return {...base,status:'ERROR' as const,offers:[],more_in_preview:false,
    error:error instanceof ApiError&&error.code==='WEEKEND_QUERY_TOO_BROAD'?'QUERY_TOO_BROAD' as const:'UNAVAILABLE' as const};
  }
 }));
}

// The future optimistic UI must hide an entire old snapshot, not relabel its offers.
export function collectionsMatchOrigin(collections:readonly HomeCollection[],origin:string):boolean{
 const code=normalizedOrigin(origin);
 return (origin===''||code!=='')&&collections.length===homeCollectionIds.length&&
  new Set(collections.map(c=>c.id)).size===homeCollectionIds.length&&
  collections.every(c=>homeCollectionIds.includes(c.id)&&c.origin===code);
}
