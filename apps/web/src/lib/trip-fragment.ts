import {decodeTrip,tripPath,type SharedTrip} from './shared-trip.ts';
import {isPlanId} from './saved-plans.ts';
export type TripFragment={token:string;trip:SharedTrip;section:string|null};
const sectionId=/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/;
export function readTripFragment(hash:string):TripFragment|null{
 if(!hash.startsWith('#')||hash.length>6200)return null;
 const params=new URLSearchParams(hash.slice(1));
 if(params.getAll('plan').length!==1||params.getAll('section').length>1||[...params.keys()].some(key=>key!=='plan'&&key!=='section'))return null;
 const token=params.get('plan')!,section=params.get('section');
 if(section!==null&&!sectionId.test(section))return null;
 const trip=decodeTrip(token);
 return trip?{token,trip,section}:null;
}
export function tripSectionHash(token:string,section:string):string{
 return tripPath(token).slice('/trip'.length)+(sectionId.test(section)?'&section='+section:'');
}
export function readLocalPlanFragment(hash:string):{id:string;section:string|null}|null{
 if(!hash.startsWith('#')||hash.length>200)return null;
 const params=new URLSearchParams(hash.slice(1)),id=params.get('local'),section=params.get('section');
 if(!isPlanId(id)||params.getAll('local').length!==1||params.getAll('section').length>1||[...params.keys()].some(key=>key!=='local'&&key!=='section')||section!==null&&!sectionId.test(section))return null;
 return {id,section};
}
