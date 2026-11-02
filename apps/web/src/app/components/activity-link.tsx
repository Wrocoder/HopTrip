"use client";

import type {ComponentProps} from "react";
import {track} from "../../lib/session";
import {localizedHref} from "../../lib/i18n/routing";

export function ActivityLink({city,activityId,affiliate,...props}:ComponentProps<"a"> & {
  city:string;activityId:string;affiliate:boolean;
}) {
  function record() {
    // Analytics failure must never prevent the native link from opening.
    try {
      const page=localizedHref(location.pathname,"pl");
      if(affiliate)track("PARTNER_CLICK",page.startsWith("/deals/") ? page.split("/")[2] : undefined,undefined,{partner:{category:"activity",provider:"tiqets"}});
      track("ACTIVITY_CLICK",undefined,{
        city,activity_id:activityId,page,
        link_kind:affiliate ? "affiliate" : "official",
      });
    } catch {}
  }
  return <a {...props} onClick={record} onAuxClick={event=>{if(event.button===1) record();}}/>;
}
