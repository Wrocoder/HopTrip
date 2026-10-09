import {getInfoContent} from "./content";

const destinations:Record<string,{name:string;guides:string[]}>= {
 milan:{name:"Mediolan",guides:["milan-weekend","milan-airports"]},
 paris:{name:"Paryż",guides:["paris-weekend","paris-airports"]},
 stockholm:{name:"Sztokholm",guides:["stockholm-weekend","stockholm-airports"]},
 oslo:{name:"Oslo",guides:["oslo-weekend"]},
 barcelona:{name:"Barcelona",guides:["barcelona-airports"]},
 rome:{name:"Rzym",guides:["rome-airports"]},
 lisbon:{name:"Lizbona",guides:["lisbon-airport"]},
 athens:{name:"Ateny",guides:["athens-airport"]},
 london:{name:"Londyn",guides:["london-airports"]},
 budapest:{name:"Budapeszt",guides:["budapest-airport"]},
 madrid:{name:"Madryt",guides:["madrid-airport"]},
 valencia:{name:"Walencja",guides:["valencia-airport"]},
 alicante:{name:"Alicante",guides:["alicante-weekend","alicante-airport"]},
 malaga:{name:"Malaga",guides:["malaga-weekend","malaga-airport"]},
 porto:{name:"Porto",guides:["porto-airport"]},
 vienna:{name:"Wiedeń",guides:["vienna-airport"]},
 prague:{name:"Praga",guides:["prague-weekend","prague-airport"]},
 copenhagen:{name:"Kopenhaga",guides:["copenhagen-airport"]},
};

export function destinationForGuide(slug:string) {
 const entry=Object.entries(destinations).find(([,destination])=>destination.guides.includes(slug));
 return entry ? {slug:entry[0],name:entry[1].name} : undefined;
}

export function guidesForDestination(slug:string) {
 return (destinations[slug]?.guides ?? []).flatMap(key=>{
  const page=getInfoContent(key);
  return page && !page.draft && !page.noindex ? [{slug:key,title:page.title}] : [];
 });
}
