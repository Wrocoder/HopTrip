export type EventSaleState='onsale'|'rescheduled'|'offsale'|'unknown';

export function eventSaleState(status:unknown):EventSaleState{
 return status==='onsale'||status==='rescheduled'||status==='offsale'?status:'unknown';
}

export function eventTicketsAllowed(status:unknown,optionStatus?:unknown):boolean{
 const offered=(value:unknown)=>value==='onsale'||value==='rescheduled';
 return offered(status)&&(optionStatus===undefined||offered(optionStatus));
}

export function eventTimeZone(value:unknown):string|null{
 if(typeof value!=='string'||!value.trim())return null;
 try{new Intl.DateTimeFormat('en',{timeZone:value});return value;}catch{return null;}
}

// A naive timestamp is not evidence of a check in the viewer's local timezone.
export function eventCheckedAt(value:unknown):Date|null{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)||!validCalendarDate(value.slice(0,10)))return null;
 const stamp=new Date(value);
 return Number.isFinite(stamp.getTime())?stamp:null;
}
import {validCalendarDate} from './calendar-date.ts';

