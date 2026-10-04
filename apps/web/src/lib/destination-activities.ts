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
};

// Editorial selections, not live inventory. Keep source URLs separate from verified affiliate links.
// Verify the specific product and its inclusions before editing; see docs/activities-pilot.md.
export const activitySelections:Readonly<Record<string,{
  city:string; checkedAt:string; items:readonly DestinationActivity[];
}>> = expansion as Record<string,{city:string;checkedAt:string;items:DestinationActivity[]}>;

export function activitiesForDestination(slug:string) {
  return Object.hasOwn(activitySelections,slug) ? activitySelections[slug] : undefined;
}
