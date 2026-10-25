import type {PlannedEvent} from './planned-events.ts';

export const costFields = [
 {key:"flight",label:"Loty",hint:"Na osobę, za wszystkie planowane odcinki",basis:"person"},
 {key:"baggage",label:"Bagaż i dodatki do lotu",hint:"Na osobę, łącznie za całą podróż",basis:"person"},
 {key:"hotel",label:"Nocleg",hint:"Za jedną noc dla całej grupy (wszystkie pokoje)",basis:"night"},
 {key:"transfers",label:"Dojazdy i transport",hint:"Łącznie dla grupy: oba lotniska, powrót i przejazdy niewpisane osobno",basis:"group"},
 {key:"local_transport",label:"Transport miejski",hint:"Na osobę za cały pobyt; nie powtarzaj kwoty w dojazdach",basis:"person"},
 {key:"food",label:"Jedzenie i wydatki dzienne",hint:"Na osobę dziennie",basis:"day"},
 {key:"activities",label:"Atrakcje i bilety wstępu",hint:"Na osobę za cały pobyt",basis:"person"},
 {key:"other",label:"Inne koszty i rezerwa",hint:"Łącznie dla całej grupy",basis:"group"},
] as const;
export type CostKey = typeof costFields[number]["key"];
export type BudgetInput = Record<CostKey | "people" | "nights" | "days" | "hotel_total",string> & {hotel_basis:"night"|"stay"};
export const emptyBudget:BudgetInput = {
 people:"2",nights:"2",days:"3",flight:"",baggage:"",hotel:"",transfers:"",local_transport:"",food:"",activities:"",other:"",
 hotel_basis:"night",hotel_total:"",
};

export function budgetForTrip(trip:{trip_type:string;trip_start:string;trip_end:string;flight_price_pln:string|null}):Partial<BudgetInput> {
 const flight=moneyInGrosz(trip.flight_price_pln ?? "");
 const initial:Partial<BudgetInput>={people:"1",flight:flight==null ? "" : (flight/100).toFixed(2)};
 // A one-way offer has no known stay length, even if its end equals its start.
 if(trip.trip_type==="ROUND_TRIP") {
  const nights=(Date.parse(trip.trip_end)-Date.parse(trip.trip_start))/86400000;
  if(Number.isInteger(nights) && nights>=0 && nights<365) {
   initial.nights=String(nights);
   initial.days=String(nights+1);
  }
 }
 return initial;
}

// Integer grosz avoid floating-point addition of currency values.
export function moneyInGrosz(raw:string):number | null | undefined {
 const value=raw.trim().replace(",",".");
 if(!value) return null;
 if(!/^\d{1,7}(?:\.\d{1,2})?$/.test(value)) return undefined;
 const [whole,fraction=""]=value.split(".");
 return Number(whole)*100+Number(fraction.padEnd(2,"0"));
}

export function plannedEventCost(event:PlannedEvent){
 const quantity=/^\d+$/.test(event.quantity)&&Number(event.quantity)>=1&&Number(event.quantity)<=50?Number(event.quantity):null;
 const price=moneyInGrosz(event.unitPricePln);
 return {valid:quantity!==null&&price!==undefined,total:quantity!==null&&price!=null?quantity*price:null};
}

export function calculateBudget(input:BudgetInput,events:PlannedEvent[]=[]) {
 const errors:Partial<Record<keyof BudgetInput|'events',string>>={};
 const counts={people:0,nights:0,days:0};
 for(const key of ["people","nights","days"] as const) {
  const min=key==="nights" ? 0 : 1;
  const max=key==="people" ? 50 : 365;
  const value=input[key].trim();
  if(!/^\d+$/.test(value) || Number(value)<min || Number(value)>max)
   errors[key]=`Wpisz liczbę całkowitą od ${min} do ${max}.`;
  else counts[key]=Number(value);
 }
 const lines:{key:string;label:string;total:number|null;incomplete?:boolean}[]=costFields.map(field=>{
  const wholeStay=field.key==="hotel" && input.hotel_basis==="stay";
  const key=wholeStay ? "hotel_total" : field.key;
  const amount=moneyInGrosz(input[key]);
  if(amount===undefined) errors[key]="Wpisz kwotę od 0 do 9 999 999,99 PLN, maksymalnie dwa miejsca po przecinku.";
  const multiplier=wholeStay ? 1 : field.basis==="person" ? counts.people : field.basis==="night" ? counts.nights :
   field.basis==="day" ? counts.people*counts.days : 1;
  return {...field,total:amount==null ? null : amount*multiplier};
 });
 if(events.length){
  const costs=events.filter((event,index)=>events.findIndex(item=>item.id===event.id)===index).map(plannedEventCost);
  if(costs.some(cost=>!cost.valid))errors.events='Popraw liczbę biletów i ceny wydarzeń.';
  const known=costs.filter(cost=>cost.total!==null);
  lines.push({key:'events',label:'Wydarzenia w planie',total:known.length?known.reduce((sum,cost)=>sum+cost.total!,0):null,
   incomplete:known.length<costs.length});
 }
 const missing=lines.filter(line=>line.total===null||line.incomplete).map(line=>line.label);
 const total=lines.reduce((sum,line)=>sum+(line.total ?? 0),0);
 const valid=Object.keys(errors).length===0;
 return {errors,lines,missing,valid,total:valid ? total : null,
  perPerson:valid ? Math.round(total/counts.people) : null};
}
