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
}>> = {
  ...expansion as Record<string,{city:string;checkedAt:string;items:DestinationActivity[]}>,
  milan:{city:"Mediolan",checkedAt:"2026-10-03",items:[
    {
      id:"tiqets-1111408",title:"Duomo di Milano — katedra i tarasy",category:"Architektura",
      description:"Zobacz gotycką katedrę i panoramę Mediolanu z jej tarasów.",
      beforeBooking:"Sprawdź wybrany wariant: wejście schodami lub windą oraz zakres biletu do kompleksu.",
      href:"https://www.tiqets.com/en/milan-attractions-c71749/tickets-for-duomo-di-milano-entry-ticket-rooftop-p1111408/",
      affiliateHref:"https://tiqets.tpx.gr/f1Euc50C",
    },
    {
      id:"tiqets-974236",title:"Muzeum Nauki i Techniki im. Leonarda da Vinci",category:"Muzeum",
      description:"Modele inspirowane projektami Leonarda oraz zbiory poświęcone nauce, transportowi i technice.",
      beforeBooking:"To bilet do muzeum nauki, nie do obrazu „Ostatnia Wieczerza”. Sprawdź zakres wystaw w wybranym terminie.",
      href:"https://www.tiqets.com/en/milan-attractions-c71749/tickets-for-museum-science-and-technology-leonardo-da-vinci-fast-track-p974236/",
      affiliateHref:"https://tiqets.tpx.gr/nVT0Np5S",
    },
  ]},
  paris:{city:"Paryż",checkedAt:"2026-10-03",items:[
    {
      id:"tiqets-973980",title:"Musée d’Orsay — bilet wstępu",category:"Muzeum",
      description:"Malarstwo impresjonistów i postimpresjonistów w dawnym budynku dworca nad Sekwaną.",
      beforeBooking:"Wybierz termin wejścia. Bilet nie pozwala ominąć kontroli bezpieczeństwa; sprawdź też uprawnienia do ulg.",
      href:"https://www.tiqets.com/en/things-to-do-in-paris-c66746/tickets-for-musee-d-orsay-dedicated-entrance-p973980/",
      affiliateHref:"https://tiqets.tpx.gr/v9r77zGj",
    },
    {
      id:"tiqets-982823",title:"Rejs po Sekwanie — Bateaux Mouches",category:"Rejs",
      description:"Widok na paryskie zabytki z rzeki podczas rejsu z komentarzem audio.",
      beforeBooking:"Sprawdź rozkład, miejsce wejścia na pokład i język komentarza. Godziny rejsów mogą się zmieniać.",
      href:"https://www.tiqets.com/en/things-to-do-in-paris-c66746/tickets-for-seine-river-cruise-by-bateaux-mouches-p982823/",
      affiliateHref:"https://tiqets.tpx.gr/dJY2SJAY",
    },
  ]},
  barcelona:{city:"Barcelona",checkedAt:"2026-10-03",items:[
    {
      id:"tiqets-973672",title:"Casa Batlló — bilet Blue",category:"Architektura",
      description:"Wnętrza domu zaprojektowanego przez Gaudíego, audioprzewodnik i przestrzeń Gaudí Cube.",
      beforeBooking:"Wariant Blue nie obejmuje tarasu na dachu. Sprawdź godzinę wejścia i język audioprzewodnika.",
      href:"https://www.tiqets.com/en/barcelona-attractions-c66342/tickets-for-casa-batllo-blue-p973672/",
      affiliateHref:"https://tiqets.tpx.gr/JikjB3NX",
    },
    {
      id:"tiqets-703295",title:"Aquarium Barcelona — bilet wstępu",category:"Akwarium",
      description:"Morski świat w Port Vell: akwaria i wystawy poświęcone życiu pod wodą.",
      beforeBooking:"Sprawdź datę wizyty, godziny otwarcia i zasady biletów dla dzieci.",
      href:"https://www.tiqets.com/en/barcelona-attractions-c66342/tickets-for-barcelona-aquarium-entry-p703295/",
      affiliateHref:"https://tiqets.tpx.gr/ALlisode",
    },
  ]},
};

export function activitiesForDestination(slug:string) {
  return Object.hasOwn(activitySelections,slug) ? activitySelections[slug] : undefined;
}
