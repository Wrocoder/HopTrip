export type PlannedEvent={id:string;name:string;venue:string;date:string;time:string|null;timezone:string;
 url:string;quantity:string;unitPricePln:string};
export const maxPlannedEvents=8;
const ticketHosts=new Set(['com','at','be','ch','cy','cz','de','dk','es','fi','fr','co.uk','gr','ie','it','nl','no','pl','se','com.tr']
 .flatMap(suffix=>['','www.','shop.'].map(prefix=>`${prefix}ticketmaster.${suffix}`)));
const text=(value:unknown,max:number):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=max&&!/[\u0000-\u001f\u007f]/.test(value);
function ticketUrl(value:unknown):value is string{
 if(!text(value,2048)||value.includes('\\'))return false;
 try{
  const url=new URL(value);
  const safe=(u:URL)=>u.protocol==='https:'&&!u.username&&!u.password&&(!u.port||u.port==='443')&&
   ![...u.searchParams.keys()].some(key=>['apikey','api_key','url','redirect','redirect_url'].includes(key.toLowerCase()));
  if(!safe(url)||url.hostname!=='ticketmaster.evyy.net'||!/^\/c\/\d+\/\d+\/\d+$/.test(url.pathname))return false;
  const targets=url.searchParams.getAll('u');if(targets.length!==1||targets[0].includes('\\')||/[\u0000-\u001f\u007f]/.test(targets[0]))return false;
  const target=new URL(targets[0]);return safe(target)&&ticketHosts.has(target.hostname);
 }catch{return false;}
}
export function cleanPlannedEvent(value:unknown):PlannedEvent|null{
 if(!value||typeof value!=='object')return null;
 const v=value as PlannedEvent;
 if(!text(v.id,200)||!text(v.name,240)||!text(v.venue,200)||!text(v.timezone,64)||!ticketUrl(v.url)||
  typeof v.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.date)||!Number.isFinite(Date.parse(v.date))||new Date(v.date).toISOString().slice(0,10)!==v.date||
  !(v.time===null||(typeof v.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(v.time)))||
  typeof v.quantity!=='string'||v.quantity.length>3||typeof v.unitPricePln!=='string'||v.unitPricePln.length>32)return null;
 try{new Intl.DateTimeFormat('pl',{timeZone:v.timezone});}catch{return null;}
 // Explicit allowlist also strips notes and arbitrary fields from shared links.
 return {id:v.id,name:v.name,venue:v.venue,date:v.date,time:v.time,timezone:v.timezone,url:v.url,
  quantity:v.quantity,unitPricePln:v.unitPricePln};
}
export function readPlannedEvents(value:unknown):PlannedEvent[]|null{
 if(!Array.isArray(value)||value.length>maxPlannedEvents)return null;
 const result:PlannedEvent[]=[];
 for(const raw of value){
  const event=cleanPlannedEvent(raw);if(!event)return null;
  // Keep the first snapshot and its manual costs if the same ticket is repeated.
  if(!result.some(item=>item.id===event.id))result.push(event);
 }
 return result;
}
export function addPlannedEvent(events:PlannedEvent[],event:PlannedEvent):PlannedEvent[]{
 if(events.some(item=>item.id===event.id)||events.length>=maxPlannedEvents)return events;
 const clean=cleanPlannedEvent(event);return clean?[...events,clean]:events;
}
