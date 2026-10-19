import "server-only";
import {headers} from "next/headers";
import {isLocale,defaultLocale} from "./config";
export async function requestLocale() {
 const value=(await headers()).get("x-hoptrip-locale");
 return isLocale(value) ? value : defaultLocale;
}
