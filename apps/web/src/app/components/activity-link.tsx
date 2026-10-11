"use client";

import type {ComponentProps} from "react";
import {track} from "../../lib/session";

export function ActivityLink({city,activityId,affiliate,...props}:ComponentProps<"a"> & {
  city:string;activityId:string;affiliate:boolean;
}) {
  function record() {
    // Analytics failure must never prevent the native link from opening.
    try {
      if(affiliate)track("PARTNER_CLICK",location.pathname.startsWith("/deals/") ? location.pathname.split("/")[2] : undefined,undefined,{partner:{category:"activity",provider:"tiqets"}});
      track("ACTIVITY_CLICK",undefined,{
        city,activity_id:activityId,page:location.pathname,
        link_kind:affiliate ? "affiliate" : "official",
      });
    } catch {}
  }
  return <a {...props} onClick={record} onAuxClick={event=>{if(event.button===1) record();}}/>;
}
