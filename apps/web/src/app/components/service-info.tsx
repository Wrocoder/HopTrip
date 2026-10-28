import Link from "next/link";
import type {Metadata} from "next";
import {readOperator} from "../../lib/operator";
import {isLegalPage} from "../../lib/legal-content";
import {LegalSources} from "./legal-sources";
import {locales,openGraphLocales,type Locale} from "../../lib/i18n/config";
import {localizedHref,languageAlternates} from "../../lib/i18n/routing";
import {serviceContent,serviceLabels,serviceSlugs,type ServiceSlug} from "../../lib/i18n/service-content";
import {editorialCopy} from "../../lib/i18n/editorial-copy";
import {editorialCard} from "../../lib/i18n/editorial-card";
import {getInfoContent} from "../../lib/content";

export function serviceMetadata(slug:ServiceSlug,locale:Locale):Metadata {
 const page=serviceContent(slug,locale),path=`/info/${slug}`;
 const canonical=localizedHref(path,locale),description=page.description??page.paragraphs[0];
 const images=locale==="pl" && !page.noindex ? [{url:`/share/${slug}`,width:1200,height:630,alt:page.title}] : [];
 return {title:page.title,description,robots:{index:!page.noindex,follow:true},
  ...(isLegalPage(slug) ? {referrer:"no-referrer" as const} : {}),
  alternates:{canonical,languages:languageAlternates(path,locales)},
  openGraph:{title:page.title,description,url:canonical,locale:openGraphLocales[locale],type:"website",images},
  twitter:{card:images.length ? "summary_large_image" : "summary",title:page.title,description,images}};
}

export async function ServiceInfo({slug,locale}:{slug:ServiceSlug;locale:Locale}) {
 const page=serviceContent(slug,locale),labels=serviceLabels[locale];
 const legal=isLegalPage(slug),operator=legal ? await readOperator() : null;
 return <main className="page-shell"><article className="deal-detail">
  <h1>{page.title}</h1>
  {page.reviewedAt && <p className="muted">HopTrip · {editorialCopy[locale].reviewed} <time dateTime={page.reviewedAt}>{page.reviewedAt}</time></p>}
  {page.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
  {legal && <section aria-label={labels.contact} data-nosnippet>
   <h2>{labels.contact}</h2>
   {operator ? <p><a href={`mailto:${operator.email}`}>{operator.email}</a></p> : <p role="alert">{labels.unavailable}</p>}
  </section>}
  {slug==="privacy" && <LegalSources locale={locale}/>}
  {page.sections?.map(section=><section key={section.title} className="legal-section"><h2>{section.title}</h2>
   {section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
  </section>)}
  {page.related && <nav aria-label={editorialCopy[locale].related}><h2>{editorialCopy[locale].related}</h2><ul>{page.related.map(item=>{
   const related=getInfoContent(item);if(!related)return null;
   const card=editorialCard(item,related,locale),RelatedLink="a";
   return <li key={item}><RelatedLink href={localizedHref(`/info/${item}`,card.translated ? locale : "pl")} hrefLang={card.translated ? locale : "pl"}><span lang={card.translated ? locale : "pl"}>{card.title}</span>{!card.translated && ` (${editorialCopy[locale].polish})`}</RelatedLink></li>;
  })}</ul></nav>}
  <nav aria-label={labels.links}><ul>
   {serviceSlugs.filter(item=>item!==slug).map(item=><li key={item}><a href={localizedHref(`/info/${item}`,locale)}>{serviceContent(item,locale).title}</a></li>)}
   <li><Link href={localizedHref("/deals",locale)}>{labels.catalog}</Link></li>
   {slug.startsWith("price-") && <li><a href={localizedHref("/info",locale)}>{editorialCopy[locale].title}</a></li>}
  </ul></nav>
 </article></main>;
}
