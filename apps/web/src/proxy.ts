import {NextResponse,type NextRequest} from "next/server";
import {pathLocale} from "./lib/i18n/routing";

export function proxy(request:NextRequest) {
 const headers=new Headers(request.headers);
 // Always overwrite incoming headers: the URL, not a visitor header, owns language.
 headers.set("x-hoptrip-locale",pathLocale(request.nextUrl.pathname));
 return NextResponse.next({request:{headers}});
}
export const config={matcher:["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"]};
