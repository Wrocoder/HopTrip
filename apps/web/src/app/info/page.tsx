import type {Metadata} from "next";
import {publishedInfoPages} from "../../lib/content";
import {locales,openGraphLocales,type Locale} from "../../lib/i18n/config";
import {localizedHref,languageAlternates} from "../../lib/i18n/routing";
import {editorialCopy} from "../../lib/i18n/editorial-copy";
import {editorialCard} from "../../lib/i18n/editorial-card";

export function generateMetadata({locale="pl"}:{locale?:Locale}={}):Metadata {
 const {title,description}=editorialCopy[locale],canonical=localizedHref("/info",locale);
 return {title,description,alternates:{canonical,languages:languageAlternates("/info",locales)},robots:{index:true,follow:true},
  openGraph:{title,description,url:canonical,locale:openGraphLocales[locale],type:"website"}};
}
export default function InfoIndex({locale="pl"}:{locale?:Locale}) {
 const text=editorialCopy[locale];
 const groups=["method","planning","airports","destinations"] as const;
 const pages=publishedInfoPages();
 const hasUntranslated=pages.some(([slug,page])=>!editorialCard(slug,page,locale).translated);
 return <main className="page-shell"><div className="page-heading"><h1>{text.title}</h1><p>{text.description}</p>
  {hasUntranslated && <p>{text.notice}</p>}</div>
  <nav aria-label={text.topics}><ul>{groups.map(id=><li key={id}><a href={`#${id}`}>{text[id]}</a></li>)}</ul></nav>
  {groups.map(id=><section id={id} key={id}><h2>{text[id]}</h2><div className="deal-grid">
   {pages.filter(([,page])=>(page.category??"method")===id).map(([slug,page])=>{
    const card=editorialCard(slug,page,locale),CardLink="a";
    return <CardLink className="deal-card" href={localizedHref(`/info/${slug}`,card.translated ? locale : "pl")} hrefLang={card.translated ? locale : "pl"} key={slug}>
     {!card.translated && <p className="muted">{text.polish}</p>}
     <h2 lang={card.translated ? locale : "pl"}>{card.title}</h2><p lang={card.translated ? locale : "pl"}>{card.description}</p>
    </CardLink>;
   })}
  </div></section>)}
 </main>;
}
