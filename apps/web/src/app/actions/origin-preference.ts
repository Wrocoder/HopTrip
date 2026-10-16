"use server";

import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {normalizedOrigin,originPreferenceCookie} from "../../lib/origin-preference";

export async function rememberOrigin(value:string) {
 const origin=normalizedOrigin(value);
 const jar=await cookies();
 if(origin)jar.set(originPreferenceCookie,origin,{path:"/",maxAge:60*60*24*180,httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production"});
 else jar.delete(originPreferenceCookie);
}

export async function chooseHomeOrigin(data:FormData) {
 const origin=normalizedOrigin(data.get("origin"));
 await rememberOrigin(origin);
 redirect(`/?origin=${origin}`);
}
