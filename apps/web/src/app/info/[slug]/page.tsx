import {notFound} from "next/navigation";
import Link from "next/link";
import type {Metadata} from "next";
import {getInfoContent,relatedInfoPages} from "../../../lib/content";
import {pl} from "../../../lib/pl";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const {slug}=await params; const page=getInfoContent(slug);
 if(!page) notFound();
 const description=page.description ?? page.paragraphs[0];
 return {title:page.title,description,alternates:{canonical:`/info/${slug}`},
  robots:{index:!page.draft,follow:true},
  openGraph:{title:page.title,description,url:`/info/${slug}`,locale:"pl_PL",type:"website",
   ...(!page.draft ? {images:[{url:`/share/${slug}`,width:1200,height:630,alt:page.title}]} : {})},
  ...(!page.draft ? {twitter:{card:"summary_large_image",title:page.title,description,
   images:[{url:`/share/${slug}`,alt:page.title}]}} : {})};
}
export default async function InfoPage({params}:Props) {
 const {slug}=await params;
 const page=getInfoContent(slug); if(!page) notFound();
 const related=relatedInfoPages(slug);
 const base=process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
 const crumbs=[{name:"Strona główna",href:"/"},{name:"Jak działa HopTrip",href:"/info"},
  {name:page.title,href:`/info/${slug}`}];
 const breadcrumbs={"@context":"https://schema.org","@type":"BreadcrumbList",
  itemListElement:crumbs.map((crumb,index)=>({"@type":"ListItem",position:index+1,
   name:crumb.name,item:new URL(crumb.href,base).href}))};
 return <main className="page-shell">
 {!page.draft && <script type="application/ld+json" dangerouslySetInnerHTML={{
  __html:JSON.stringify(breadcrumbs).replace(/</g,"\\u003c"),
 }}/>}
 <nav className="breadcrumbs" aria-label="Ścieżka nawigacji"><ol>{crumbs.map((crumb,index)=>
  <li key={crumb.href}>{index===crumbs.length-1 ? <span aria-current="page">{crumb.name}</span> :
   <Link href={crumb.href}>{crumb.name}</Link>}</li>)}</ol></nav>
 <article className="deal-detail"><h1>{page.title}</h1>
 {page.reviewedAt && <p className="muted">HopTrip · Sprawdzono <time dateTime={page.reviewedAt}>{page.reviewedAt}</time></p>}
 {page.draft && <p role="note">{pl.draft}</p>}{page.paragraphs.map(p=><p key={p}>{p}</p>)}
 {page.sections?.map(section=><section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}
  {section.sourceIds && <ul aria-label={`Źródła: ${section.title}`}>{section.sourceIds.map(id=>{
   const source=page.sources?.[id];
   return source ? <li key={source.href}><a href={source.href}>{source.label}</a></li> : null;
  })}</ul>}
 </section>)}
 {page.sources && <section aria-label="Aktualność informacji"><h2>Przed podróżą sprawdź aktualizacje</h2>
  <p>Informacje sprawdzono {page.reviewedAt}. Rozkłady, taryfy i organizacja terminali mogą się zmienić.
  Linki do oficjalnych źródeł znajdują się przy odpowiednich częściach poradnika. Sprawdź je dla daty swojej podróży.</p>
 </section>}
 {page.routes && <nav aria-label="Powiązane trasy"><h2>Sprawdź loty w katalogu</h2>
  <p>Katalog pokazuje dostępne obserwacje cen. Może być pusty; poradnik nie potwierdza dostępności konkretnego połączenia.</p>
  <ul>{page.routes.map(route=><li key={route.href}><Link href={route.href}>{route.label}</Link></li>)}</ul>
 </nav>}
 {related.length>0 && <nav aria-label="Powiązane poradniki"><h2>Czytaj dalej</h2><ul>{related.map(({slug,page,reason})=>
  <li key={slug}><Link href={`/info/${slug}`}>{page.title}</Link>{reason && <p className="related-reason">{reason}</p>}</li>
 )}</ul><Link href="/deals">{pl.deals}</Link></nav>}
 </article></main>;
}
