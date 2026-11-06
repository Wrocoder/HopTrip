import {calculateBudget,moneyInGrosz,type BudgetInput} from './trip-budget.ts';
import type {PlannedEvent} from './planned-events.ts';

export const budgetProfileIds=['economy','standard','comfort'] as const;
export type BudgetProfileId=typeof budgetProfileIds[number];
export const estimateFields=['hotel','food','transfers'] as const;
export type EstimateKey=typeof estimateFields[number];
export type EstimateRange={min:string;max:string};
export type BudgetProfile={hotel_basis:'night'|'stay';hotel:EstimateRange;food:EstimateRange;transfers:EstimateRange};
export type BudgetEstimates={version:'budget-estimates-v1';currency:'PLN';selected:BudgetProfileId|null;profiles:Partial<Record<BudgetProfileId,BudgetProfile>>};
export const emptyProfile=(basis:'night'|'stay'='night'):BudgetProfile=>({hotel_basis:basis,hotel:{min:'',max:''},food:{min:'',max:''},transfers:{min:'',max:''}});
export const emptyEstimates=():BudgetEstimates=>({version:'budget-estimates-v1',currency:'PLN',selected:null,profiles:{}});
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);

// Local editing can contain incomplete/invalid numbers. Structure and share
// validation are separate so a typo survives reload and remains correctable.
export function readBudgetEstimates(value:unknown):BudgetEstimates|null{
 if(!object(value)||value.version!=='budget-estimates-v1'||value.currency!=='PLN'||
  !(value.selected===null||budgetProfileIds.includes(value.selected as BudgetProfileId))||!object(value.profiles))return null;
 const profiles:BudgetEstimates['profiles']={};
 for(const id of budgetProfileIds){
  if(!Object.hasOwn(value.profiles,id))continue;
  const profile=value.profiles[id];if(!object(profile)||(profile.hotel_basis!=='night'&&profile.hotel_basis!=='stay'))return null;
  const clean=emptyProfile(profile.hotel_basis);
  for(const key of estimateFields){
   const range=profile[key];if(!object(range)||typeof range.min!=='string'||typeof range.max!=='string'||range.min.length>32||range.max.length>32)return null;
   clean[key]={min:range.min,max:range.max};
  }
  profiles[id]=clean;
 }
 return {version:'budget-estimates-v1',currency:'PLN',selected:value.selected as BudgetProfileId|null,profiles};
}
export function profileErrors(profile:BudgetProfile):Partial<Record<EstimateKey,'amount'|'bounds'|'order'>>{
 const errors:ReturnType<typeof profileErrors>={};
 for(const key of estimateFields){
  const min=moneyInGrosz(profile[key].min),max=moneyInGrosz(profile[key].max);
  if(min===undefined||max===undefined)errors[key]='amount';
  else if((min===null)!==(max===null))errors[key]='bounds';
  else if(min!==null&&max!==null&&min>max)errors[key]='order';
 }
 return errors;
}
export function invalidProfiles(estimates?:BudgetEstimates):BudgetProfileId[]{
 return estimates?budgetProfileIds.filter(id=>estimates.profiles[id]&&Object.keys(profileErrors(estimates.profiles[id]!)).length>0):[];
}
export function seedProfile(profile:BudgetProfile,input:BudgetInput):BudgetProfile{
 const next={...profile};
 for(const key of estimateFields){
  // Never overwrite even a partially entered personal range.
  if(profile[key].min.trim()||profile[key].max.trim())continue;
  if(key==='hotel'&&profile.hotel_basis!==input.hotel_basis)continue;
  const value=key==='hotel'&&input.hotel_basis==='stay'?input.hotel_total:input[key];
  if(moneyInGrosz(value)!=null)next[key]={min:value,max:value};
 }
 return next;
}
export function projectBudget(input:BudgetInput,events:PlannedEvent[]|undefined,estimates?:BudgetEstimates){
 if(!estimates?.selected)return null;
 const profile=estimates.profiles[estimates.selected]??emptyProfile(input.hotel_basis),base=calculateBudget(input,events);
 const errors=profileErrors(profile);let modeled=0,overridden=0;
 const lines=base.lines.map(line=>{
  const key=line.key as EstimateKey,range=estimateFields.includes(key)?profile[key]:undefined;
  const low=range?moneyInGrosz(range.min):null,high=range?moneyInGrosz(range.max):null;
  const usable=low!=null&&high!=null&&!errors[key];
  if(line.total!==null){if(usable)overridden++;return {...line,min:line.total,max:line.total,modeled:false,unknown:!!line.incomplete};}
  if(usable&&base.valid){
   const multiplier=key==='hotel'?(profile.hotel_basis==='stay'?1:Number(input.nights)):key==='food'?Number(input.people)*Number(input.days):1;
   modeled++;return {...line,min:low*multiplier,max:high*multiplier,modeled:true,unknown:false};
  }
  return {...line,min:null,max:null,modeled:false,unknown:true};
 });
 const valid=base.valid&&Object.keys(errors).length===0;
 const min=lines.reduce((sum,line)=>sum+(line.min??0),0),max=lines.reduce((sum,line)=>sum+(line.max??0),0);
 return {profile:estimates.selected,valid,errors,lines,modeled,overridden,missing:lines.filter(line=>line.unknown).map(line=>line.label),
  min:valid?min:null,max:valid?max:null,personMin:valid?Math.floor(min/Number(input.people)):null,personMax:valid?Math.ceil(max/Number(input.people)):null};
}
