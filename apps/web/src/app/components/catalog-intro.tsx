import type {CatalogPage} from "../../lib/catalog-pages";
import type {Locale} from "../../lib/i18n/config";
import {landingText} from "../../lib/i18n/landing-copy";
import {pathLocale} from "../../lib/i18n/routing";

export function CatalogIntro({page,linksFirst=false,showIntro=true,locale="pl"}:{page:CatalogPage;linksFirst?:boolean;showIntro?:boolean;locale?:Locale}) {
  const links=<nav className="route-link-grid" aria-label={landingText(locale,"Zaplanuj podróż")}>{page.links.map(link=><a key={link.href} href={link.href} hrefLang={pathLocale(link.href)}>{link.label}</a>)}</nav>;
  return <section className="rationale catalog-intro" aria-label={page.heading}>
    <h2>{page.heading}</h2>
    {linksFirst && links}
    {showIntro && <p>{page.intro}</p>}
    {page.sections.map(section=><div key={section.title}><h3>{section.title}</h3><p>{section.text}</p></div>)}
    {!linksFirst && links}
  </section>;
}
