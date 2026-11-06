import type {Deal} from '../../lib/api';
import type {Locale} from '../../lib/i18n/config';
import {destinationTimeView} from '../../lib/destination-time';
export function DestinationTimeSummary({deal,locale}:{deal:Deal;locale:Locale}){
 return deal.trip_type==='ROUND_TRIP'?<p className="deal-note destination-time">{destinationTimeView(deal,locale)}</p>:null;
}
