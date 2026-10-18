import expansion from "./activity-expansion.json";

export type DestinationActivity = {
  id:string;
  title:string;
  category:string;
  description:string;
  beforeBooking:string;
  href:string;
  affiliateHref?:string;
  kind?:"ticket"|"visit";
  audience?:string;
  duration?:string;
  durationSource?:string;
  freeEntry?:boolean;
  checkedAt?:string;
};

// Editorial selections, not live inventory. Keep source URLs separate from verified affiliate links.
// Verify the specific product and its inclusions before editing; see docs/activities-pilot.md.
export const activitySelections:Readonly<Record<string,{
  city:string; checkedAt:string; heading?:string; items:readonly DestinationActivity[];
}>> = expansion as Record<string,{city:string;checkedAt:string;items:DestinationActivity[]}>;

export function activitiesForDestination(slug:string) {
  return Object.hasOwn(activitySelections,slug) ? activitySelections[slug] : undefined;
}
