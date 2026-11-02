import type {Deal} from './api.ts';

export function recommendationEligible(deal:Pick<Deal,'flight_quality'>):boolean {
 const quality=deal.flight_quality;
 return quality?.version==='flight-quality-v1' && quality.recommendation_eligible===true &&
  (quality.status==='COMPLETE'||quality.status==='PARTIAL');
}
export function qualityNotice(deal:Pick<Deal,'flight_quality'>) {
 const quality=deal.flight_quality;
 if(quality?.version==='flight-quality-v1' && quality.status==='COMPLETE')return null;
 if(quality?.version==='flight-quality-v1' && (quality.status==='PARTIAL'||quality.status==='CRITICAL_INCOMPLETE'))
  return {status:quality.status,reasons:Array.isArray(quality.reasons)&&quality.reasons.length ? quality.reasons : ['UNVERIFIED_SOURCE']};
 return {status:'CRITICAL_INCOMPLETE',reasons:['UNVERIFIED_SOURCE']};
}
