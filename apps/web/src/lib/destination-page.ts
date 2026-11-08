import {getDestinations,getDeals,type Destination,type Deal} from './api';

type Source={getDestinations:()=>Promise<Destination[]>;getDeals:typeof getDeals};
export type DestinationPageData=
 | {status:'UNAVAILABLE'|'NOT_FOUND'}
 | {status:'READY';record:Destination;destinations:Destination[];deals:Deal[];offersUnavailable:boolean};

// A price-feed failure must not erase the independently available city guide.
export async function loadDestinationPage(slug:string,source:Source={getDestinations,getDeals}):Promise<DestinationPageData>{
 let destinations:Destination[];
 try{destinations=await source.getDestinations();}catch{return {status:'UNAVAILABLE'};}
 const record=destinations.find(destination=>destination.slug===slug);
 if(!record)return {status:'NOT_FOUND'};
 try{return {status:'READY',record,destinations,deals:await source.getDeals({destination:slug}),offersUnavailable:false};}
 catch{return {status:'READY',record,destinations,deals:[],offersUnavailable:true};}
}
