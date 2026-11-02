"use server";

import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {normalizedOrigin,originPreferenceCookie} from "../../lib/origin-preference";
import {isLocale} from '../../lib/i18n/config';
import {localizedHref} from '../../lib/i18n/routing';
import {catalogPage} from '../../lib/catalog-pages';

export async function rememberOrigin(value:string) {
 const origin=normalizedOrigin(value);
 const jar=await cookies();
 if(origin)jar.set(originPreferenceCookie,origin,{path:"/",maxAge:60*60*24*180,httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production"});
 else jar.delete(originPreferenceCookie);
}

export async function searchWithOrigin(value:string,href:string) {
 // A cookie write re-renders the current tree. Redirect in the same action so
 // that a subsequent client push cannot be overtaken by that server update.
 if(typeof href!=="string" || href.length>3000)throw new Error("Invalid search URL");
 const path=localizedHref(href,"pl").split(/[?#]/)[0];
 if(!catalogPage(path))throw new Error("Invalid search URL");
 // The search remains usable if this optional preference cannot be persisted.
 try {await rememberOrigin(value);}catch {}
 redirect(href);
}

export async function chooseHomeOrigin(data:FormData) {
 const origin=normalizedOrigin(data.get("origin"));
 await rememberOrigin(origin);
 const language=data.get('locale'),locale=isLocale(language)?language:'pl';
 redirect(localizedHref(`/?origin=${origin}`,locale));
}
