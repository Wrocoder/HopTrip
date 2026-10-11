import {cityLabel,originLabel,departureHeading} from "../../../../lib/cities";
import {getAirports,getDeal,getDestinations} from "../../../../lib/api";
import {catalogPage} from "../../../../lib/catalog-pages";
import {travelPreview} from "../../../../lib/travel-preview";
import {date,pl} from "../../../../lib/pl";

export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{kind:string;key:string}>}) {
  const {kind,key}=await params;
  const missing=()=>new Response(null,{status:404,headers:{"Cache-Control":"no-store"}});
  try {
    if(kind==="site" && key==="home")return await travelPreview("Dokąd polecisz z Polski?","Wybierz lot, sprawdź daty i zaplanuj budżet.");
    if(kind==="catalog" && key==="deals")return await travelPreview("Okazje lotnicze z Polski","Wybierz lotnisko, daty i budżet na osobę.");
    if(kind==="deal") {
      const deal=await getDeal(key);if(!deal)return missing();
      return await travelPreview(`${originLabel(deal.origin_city,deal.origin_code)} → ${cityLabel(deal.destination_city,deal.destination_slug)}`,
        `${date(deal.trip_start)}${deal.trip_type==="ROUND_TRIP" ? ` – ${date(deal.trip_end)}` : ""} · ${deal.trip_type==="ROUND_TRIP" ? pl.roundTrip : pl.oneWay}`);
    }
    if(kind==="airport") {
      const airport=(await getAirports()).find(a=>a.iata_code===key);
      if(!airport)return missing();
      return await travelPreview(departureHeading(airport.city,key),"Aktualne oferty · zaplanuj podróż z HopTrip");
    }
    if(kind==="destination") {
      const destination=(await getDestinations()).find(d=>d.slug===key);
      if(!destination)return missing();
      return await travelPreview(cityLabel(destination.city,destination.slug),
        catalogPage(`/destinations/${key}`)?.description ?? "Loty z Polski · znajdź swój kierunek");
    }
    return missing();
  } catch {return new Response(null,{status:503,headers:{"Cache-Control":"no-store","Retry-After":"60"}});}
}
