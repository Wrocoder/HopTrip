export type AccommodationLink = {provider:string;affiliateHref:string;verifiedAt:string};

// Only owner-confirmed, destination-specific links from an approved programme.
// Keep URLs unchanged: date parameters depend on the provider's documented format.
// See docs/accommodation-pilot.md before enabling a destination.
export const accommodationLinks:Readonly<Record<string,AccommodationLink>> = {};

export function accommodationForDestination(slug:string) {
 if(!Object.hasOwn(accommodationLinks,slug)) return undefined;
 const link=accommodationLinks[slug];
 if(!link.provider || !link.verifiedAt) return undefined;
 try {
  const url=new URL(link.affiliateHref);
  return url.protocol==="https:" && !url.username && !url.password ? link : undefined;
 } catch {return undefined;}
}
