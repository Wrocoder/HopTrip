import "server-only";
import {headers} from "next/headers";
import {notFound} from "next/navigation";
import {isLocale,defaultLocale} from "./config";
export async function requestLocale() {
 const value=(await headers()).get("x-hoptrip-locale");
 return isLocale(value) ? value : defaultLocale;
}
export function translatedRouteLocale(value:string) {
 if(!isLocale(value) || value==="pl")notFound();
 return value;
}
