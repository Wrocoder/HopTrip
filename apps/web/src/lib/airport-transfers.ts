export type AirportTransfer = {
 city:string;
 affiliateHref:string;
 verifiedAt:string;
};

// Add only owner-confirmed Welcome Pickups links; see docs/trip-planning-pilot.md.
// Supplied by the owner; redirects verified for each city on 2026-10-05.
export const airportTransfers:Readonly<Record<string,AirportTransfer>> = {
 "malaga-airport":{city:"Malaga",affiliateHref:"https://tpx.gr/mTuIViB0",verifiedAt:"2026-10-05"},
 "alicante-airport":{city:"Alicante",affiliateHref:"https://tpx.gr/gtneOoSO",verifiedAt:"2026-10-05"},
 "prague-airport":{city:"Praga",affiliateHref:"https://tpx.gr/YbMCDRFd",verifiedAt:"2026-10-05"},
};

export function transferForGuide(slug:string) {
 if(!["malaga-airport","alicante-airport","prague-airport"].includes(slug)) return undefined;
 const transfer=airportTransfers[slug];
 if(!transfer?.verifiedAt) return undefined;
 try {
  const url=new URL(transfer.affiliateHref);
  if(url.protocol!=="https:" || url.username || url.password) return undefined;
  return transfer;
 } catch {return undefined;}
}
