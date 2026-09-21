import {notFound} from "next/navigation";
import Link from "next/link";
import type {Metadata} from "next";
import {getInfoContent} from "../../../lib/content";
import {pl} from "../../../lib/pl";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const {slug}=await params; const page=getInfoContent(slug);
 if(!page) notFound();
 const description=page.description ?? page.paragraphs[0];
 return {title:page.title,description,alternates:{canonical:`/info/${slug}`},
  robots:{index:!page.draft,follow:true},
  openGraph:{title:page.title,description,url:`/info/${slug}`,locale:"pl_PL",type:"website"}};
}
export default async function InfoPage({params}:Props) {
 const page=getInfoContent((await params).slug); if(!page) notFound();
 return <main className="page-shell"><Link className="back-link" href="/info">Jak działa HopTrip</Link>
 <article className="deal-detail"><h1>{page.title}</h1>
 {page.reviewedAt && <p className="muted">HopTrip · Sprawdzono <time dateTime={page.reviewedAt}>{page.reviewedAt}</time></p>}
 {page.draft && <p role="note">{pl.draft}</p>}{page.paragraphs.map(p=><p key={p}>{p}</p>)}
 {page.sections?.map(section=><section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}</section>)}
 {page.related && <nav aria-label="Powiązane poradniki"><h2>Czytaj dalej</h2><ul>{page.related.map(slug=>{
  const related=getInfoContent(slug);
  return related && !related.draft ? <li key={slug}><Link href={`/info/${slug}`}>{related.title}</Link></li> : null;
 })}</ul><Link href="/deals">{pl.deals}</Link></nav>}
 </article></main>;
}
