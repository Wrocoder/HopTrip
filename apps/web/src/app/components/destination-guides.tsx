import Link from "next/link";
import {guidesForDestination} from "../../lib/guide-destinations";

export function DestinationGuides({slug}:{slug:string}) {
 const guides=guidesForDestination(slug);
 if(!guides.length) return null;
 return <nav aria-label="Zaplanuj pobyt"><h2>Zaplanuj pobyt</h2><ul>
  {guides.map(guide=><li key={guide.slug}><Link href={`/info/${guide.slug}`}>{guide.title}</Link></li>)}
 </ul></nav>;
}
