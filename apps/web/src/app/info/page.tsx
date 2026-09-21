import type {Metadata} from "next";
import Link from "next/link";
import {publishedInfoPages} from "../../lib/content";

const title="Jak działa HopTrip";
const description="Poznaj sposób porównywania cen, ograniczenia historii i zasady przejść do partnerów.";
export const metadata:Metadata={
 title,description,alternates:{canonical:"/info"},robots:{index:true,follow:true},
 openGraph:{title,description,url:"/info",locale:"pl_PL",type:"website"},
};

export default function InfoIndex() {
 return <main className="page-shell"><div className="page-heading"><h1>{title}</h1><p>{description}</p></div>
  <div className="deal-grid">{publishedInfoPages().map(([slug,page])=>
   <Link className="deal-card" href={`/info/${slug}`} key={slug}>
    <h2>{page.title}</h2><p>{page.description ?? page.paragraphs[0]}</p>
   </Link>
  )}</div>
 </main>;
}
