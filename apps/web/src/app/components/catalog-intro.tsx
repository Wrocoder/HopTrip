import Link from "next/link";
import type {CatalogPage} from "../../lib/catalog-pages";

export function CatalogIntro({page,linksFirst=false}:{page:CatalogPage;linksFirst?:boolean}) {
  const links=<nav className="route-link-grid" aria-label="Zaplanuj podróż">{page.links.map(link=><Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>;
  return <section className="rationale catalog-intro" aria-label={page.heading}>
    <h2>{page.heading}</h2>
    {linksFirst && links}
    <p>{page.intro}</p>
    {page.sections.map(section=><div key={section.title}><h3>{section.title}</h3><p>{section.text}</p></div>)}
    {!linksFirst && links}
  </section>;
}
