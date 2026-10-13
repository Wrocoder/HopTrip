"use client";

export function ActivityBudgetLink({inTrip}:{inTrip:boolean}) {
 return <a href={inTrip ? "#calculator" : "/info/trip-budget#calculator"}
  onClick={event=>{
   if(!inTrip)return;
   const input=document.getElementById("budget-activities");
   if(!input)return;
   event.preventDefault();
   const details=input?.closest("details");
   if(details)details.open=true;
   input.focus();
   input.scrollIntoView({block:"center"});
  }}>Uwzględnij atrakcje w budżecie</a>;
}
