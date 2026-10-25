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
