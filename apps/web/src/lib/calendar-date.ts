// Shared calendar contract for editable dates: YYYY-MM-DD, years 0001–9999.
// Duration and booking/search limits belong to their respective consumers.
export function validCalendarDate(value:string):boolean {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-'))return false;
 const instant=Date.parse(`${value}T12:00:00Z`);
 return Number.isFinite(instant) && new Date(instant).toISOString().slice(0,10)===value;
}

export function calendarNights(start:string,end:string):number|null {
 if(!validCalendarDate(start)||!validCalendarDate(end))return null;
 const nights=(Date.parse(end)-Date.parse(start))/86400000;
 return nights>=0?nights:null;
}

export function formatCalendarDate(value:string,locale:string,options:Intl.DateTimeFormatOptions={dateStyle:'medium'}):string|null {
 if(!validCalendarDate(value))return null;
 return new Intl.DateTimeFormat(locale,{...options,timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));
}
