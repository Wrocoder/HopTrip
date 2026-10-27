export const eventFitReasons=[
 'BEFORE_ARRIVAL','AFTER_RETURN','ENDS_AFTER_RETURN','ARRIVAL_BUFFER','RETURN_BUFFER',
 'UNKNOWN_EVENT_TIME','INVALID_EVENT_TIME','AMBIGUOUS_EVENT_TIME','UNKNOWN_DURATION',
 'UNKNOWN_ARRIVAL','UNKNOWN_RETURN','ONE_WAY','UNKNOWN_AIRPORT','UNKNOWN_TIMEZONE','OUTSIDE_FLIGHT_DATES',
] as const;
export type EventFitReason=typeof eventFitReasons[number];
export type EventFlightFit={
 status:'CONFLICT'|'TIGHT'|'CHECK'|'NO_KNOWN_CONFLICT';reasons:EventFitReason[];buffer_minutes:number;
 arrival_gap_minutes:number|null;return_gap_minutes:number|null;return_start_gap_minutes:number|null;
 duration_minutes:number|null;arrival_airport:string|null;return_airport:string|null;arrival_estimated:boolean;
};

// Conflicts and tight transfers must take precedence over missing ancillary data.
export function primaryFitReason(fit:EventFlightFit|undefined):EventFitReason|undefined{
 const priority:EventFitReason[]=['BEFORE_ARRIVAL','AFTER_RETURN','ENDS_AFTER_RETURN','OUTSIDE_FLIGHT_DATES',
  'ARRIVAL_BUFFER','RETURN_BUFFER','INVALID_EVENT_TIME','AMBIGUOUS_EVENT_TIME','UNKNOWN_EVENT_TIME',
  'UNKNOWN_TIMEZONE','UNKNOWN_ARRIVAL','UNKNOWN_RETURN','ONE_WAY','UNKNOWN_AIRPORT'];
 return priority.find(reason=>fit?.reasons.includes(reason));
}
