import type {Metadata} from "next";
import Link from "next/link";
import {publishedInfoPages} from "../../lib/content";

const title="Jak działa HopTrip";
const description="Porównywanie cen, bagaż i przesiadki, lotniska w Polsce oraz dojazd do 18 europejskich miast.";
export const metadata:Metadata={
 title,description,alternates:{canonical:"/info"},robots:{index:true,follow:true},
 openGraph:{title,description,url:"/info",locale:"pl_PL",type:"website"},
};

export default function InfoIndex() {
 const groups=[{id:"method",title:"Jak działa serwis"},{id:"planning",title:"Planowanie podróży"},
  {id:"airports",title:"Lotniska wylotu w Polsce"},{id:"destinations",title:"Dojazd i planowanie na miejscu"}];
 return <main className="page-shell"><div className="page-heading"><h1>{title}</h1><p>{description}</p></div>
  <nav aria-label="Tematy poradników"><ul>{groups.map(group=><li key={group.id}><a href={`#${group.id}`}>{group.title}</a></li>)}</ul></nav>
  {groups.map(group=><section id={group.id} key={group.id}><h2>{group.title}</h2>
  <div className="deal-grid">{publishedInfoPages().filter(([,page])=>(page.category ?? "method")===group.id).map(([slug,page])=>
   <Link className="deal-card" href={`/info/${slug}`} key={slug}>
    <h2>{page.title}</h2><p>{page.description ?? page.paragraphs[0]}</p>
   </Link>
  )}</div></section>)}
 </main>;
}
