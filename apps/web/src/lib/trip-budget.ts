export const costFields = [
 {key:"flight",label:"Loty",hint:"Na osobę, za wszystkie planowane odcinki",basis:"person"},
 {key:"baggage",label:"Bagaż i dodatki do lotu",hint:"Na osobę, łącznie za całą podróż",basis:"person"},
 {key:"hotel",label:"Nocleg",hint:"Za jedną noc dla całej grupy (wszystkie pokoje)",basis:"night"},
 {key:"transfers",label:"Dojazdy i transport",hint:"Łącznie dla grupy: oba lotniska, powrót i transport na miejscu",basis:"group"},
 {key:"food",label:"Jedzenie i wydatki dzienne",hint:"Na osobę dziennie",basis:"day"},
 {key:"activities",label:"Atrakcje i bilety wstępu",hint:"Na osobę za cały pobyt",basis:"person"},
 {key:"other",label:"Inne koszty i rezerwa",hint:"Łącznie dla całej grupy",basis:"group"},
] as const;
export type CostKey = typeof costFields[number]["key"];
export type BudgetInput = Record<CostKey | "people" | "nights" | "days",string>;
export const emptyBudget:BudgetInput = {
 people:"2",nights:"2",days:"3",flight:"",baggage:"",hotel:"",transfers:"",food:"",activities:"",other:"",
};

// Integer grosz avoid floating-point addition of currency values.
export function moneyInGrosz(raw:string):number | null | undefined {
 const value=raw.trim().replace(",",".");
 if(!value) return null;
 if(!/^\d{1,7}(?:\.\d{1,2})?$/.test(value)) return undefined;
 const [whole,fraction=""]=value.split(".");
 return Number(whole)*100+Number(fraction.padEnd(2,"0"));
}

export function calculateBudget(input:BudgetInput) {
 const errors:Partial<Record<keyof BudgetInput,string>>={};
 const counts={people:0,nights:0,days:0};
 for(const key of ["people","nights","days"] as const) {
  const min=key==="nights" ? 0 : 1;
  const max=key==="people" ? 50 : 365;
  const value=input[key].trim();
  if(!/^\d+$/.test(value) || Number(value)<min || Number(value)>max)
   errors[key]=`Wpisz liczbę całkowitą od ${min} do ${max}.`;
  else counts[key]=Number(value);
 }
 const lines=costFields.map(field=>{
  const amount=moneyInGrosz(input[field.key]);
  if(amount===undefined) errors[field.key]="Wpisz kwotę od 0 do 9 999 999,99 PLN, maksymalnie dwa miejsca po przecinku.";
  const multiplier=field.basis==="person" ? counts.people : field.basis==="night" ? counts.nights :
   field.basis==="day" ? counts.people*counts.days : 1;
  return {...field,total:amount==null ? null : amount*multiplier};
 });
 const missing=lines.filter(line=>line.total===null).map(line=>line.label);
 const total=lines.reduce((sum,line)=>sum+(line.total ?? 0),0);
 const valid=Object.keys(errors).length===0;
 return {errors,lines,missing,valid,total:valid ? total : null,
  perPerson:valid ? Math.round(total/counts.people) : null};
}
