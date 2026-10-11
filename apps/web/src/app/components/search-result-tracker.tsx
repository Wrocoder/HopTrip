"use client";
import {useEffect,useSyncExternalStore} from "react";
import {analyticsAllowed,subscribeConsent} from "../../lib/consent";
import {track} from "../../lib/session";
import type {SearchContext} from "../../lib/analytics-context";
export function SearchResultTracker({context}:{context:SearchContext}) {
 const allowed=useSyncExternalStore(subscribeConsent,analyticsAllowed,()=>false);
 const serialized=JSON.stringify(context);
 useEffect(()=>{if(allowed)track("SEARCH_RESULT",undefined,undefined,{search:JSON.parse(serialized)});},[allowed,serialized]);
 return null;
}
