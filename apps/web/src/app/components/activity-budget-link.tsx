"use client";
import {useLocale} from './locale-provider';
import {localizedHref} from '../../lib/i18n/routing';
import {activityUi} from '../../lib/i18n/activity-ui';

export function ActivityBudgetLink({inTrip}:{inTrip:boolean}) {
 const {locale}=useLocale();
 return <a href={inTrip ? "#calculator" : localizedHref('/info/trip-budget#calculator',locale)}
  onClick={event=>{
   if(!inTrip)return;
   const input=document.getElementById("budget-activities");
   if(!input)return;
   event.preventDefault();
   const details=input?.closest("details");
   if(details)details.open=true;
   input.focus();
   input.scrollIntoView({block:"center"});
  }}>{activityUi(locale,'budget')}</a>;
}
