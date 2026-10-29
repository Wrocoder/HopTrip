import {validCalendarDate} from './calendar-date.ts';
// Public affiliate ID confirmed by the owner on 2026-10-10 ().
export const stay22Aid = "hoptrip";

type Stay = {city:string;checkin:string;checkout:string;adults:string};
export function stay22Link({city,checkin,checkout,adults}:Stay):string|null {
 if(!city.trim() || !validCalendarDate(checkin) || !validCalendarDate(checkout) || checkout<=checkin ||
  !/^[1-9]\d*$/.test(adults) || !Number.isSafeInteger(Number(adults))) return null;
 const params=new URLSearchParams({aid:stay22Aid,address:city.trim(),checkin,checkout,
  adults,campaign:"hoptrip_accommodation",lang:"pl",currency:"PLN"});
 return `https://www.stay22.com/allez/roam?${params}`;
}
