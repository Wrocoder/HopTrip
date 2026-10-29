import {calendarNights} from "./calendar-date.ts";

// The event catalogue supports an inclusive window of at most 31 calendar days.
// A longer saved stay remains intact; it never silently becomes a shorter trip.
export function validEventDates(start:string,end:string):boolean {
 const nights=calendarNights(start,end);
 return nights!==null && nights<=30;
}

export function eventSearchDays(start:string,end:string):string[] {
 if(!validEventDates(start,end))return [];
 const days:string[]=[];
 for(let instant=Date.parse(`${start}T12:00:00Z`);instant<=Date.parse(`${end}T12:00:00Z`);instant+=86400000){
  days.push(new Date(instant).toISOString().slice(0,10));
 }
 return days;
}
