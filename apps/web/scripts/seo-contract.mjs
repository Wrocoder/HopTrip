import config from './seo-pages.json' with {type:'json'};

export const localizedPath=(path,locale)=>locale==='pl'?path:`/${locale}${path==='/'?'':path}`;
// Independent release inventory: removing a URL from sitemap must not also
// remove the auditor's expectation. Update this inventory with each translation batch.
export function publishedPages(inventory=config){
 const pages=new Map();
 if(new Set(inventory.polishPaths).size!==inventory.polishPaths.length)throw new Error('Duplicate published path in SEO inventory');
 for(const path of inventory.translatedPaths)if(!inventory.polishPaths.includes(path))throw new Error(`Translation without Polish source: ${path}`);
 for(const path of inventory.translatedArticlePaths??[])if(!path.startsWith('/info/')||!inventory.translatedPaths.includes(path))throw new Error(`Translated article without translated route: ${path}`);
 for(const path of inventory.polishPaths){
  const locales=inventory.translatedPaths.includes(path)?inventory.locales:['pl'];
  for(const locale of locales)pages.set(localizedPath(path,locale),{path,locale,locales,
   article:locale==='pl'&&path.startsWith('/info/'),preview:locale==='pl'&&inventory.catalogPreviews.includes(path)});
 }
 return pages;
}

export function auditSitemap(urls,canonical,pages=publishedPages()){
 const failures=[],paths=new Set();
 if(new Set(urls).size!==urls.length)failures.push('sitemap: duplicate URLs');
 for(const loc of urls){
  let url;try{url=new URL(loc);}catch{failures.push(`sitemap: invalid URL ${loc}`);continue;}
  if(url.origin!==canonical||url.search||url.hash||url.username||url.password)failures.push(`${loc}: incorrect sitemap URL`);
  if(!pages.has(url.pathname))failures.push(`${url.pathname}: unexpected sitemap path`);
  paths.add(url.pathname);
 }
 for(const path of pages.keys())if(!paths.has(path))failures.push(`${path}: missing required URL in sitemap`);
 return failures;
}

export function auditPage(path,data,canonical,{status=200,actualPath=path,headerRobots='',staging=false,pages=publishedPages()}={}){
 const failures=[],expected=pages.get(path);
 const check=(ok,message)=>{if(!ok)failures.push(`${path}: ${message}`);};
 if(!expected)return [`${path}: missing SEO inventory entry`];
 check(status===200&&actualPath===path,'expected HTTP 200 without redirect');
 check(data.lang===expected.locale,`expected lang ${expected.locale}`);
 check(data.headings===1,'expected one h1');
 check(Boolean(data.title?.trim()),'missing title');check(Boolean(data.description?.trim()),'missing description');
 check(data.canonical?.length===1&&data.canonical[0]===new URL(path,canonical).href,'incorrect canonical');
 if(staging)check(/\bnoindex\b/i.test(headerRobots),'staging requires X-Robots-Tag noindex');
 else check(!/\b(noindex|none)\b/i.test(`${data.robots},${headerRobots}`),'unexpected noindex');
 check(Boolean(data.ogTitle)&&Boolean(data.ogDescription),'missing Open Graph metadata');
 if(path!=='/')check(data.ogUrl===new URL(path,canonical).href,'incorrect Open Graph URL');
 const alternates=data.alternates??[];
 check(new Set(alternates.map(item=>item.lang)).size===alternates.length,'duplicate hreflang');
 if(expected.locales.length>1){
  const wanted=[...expected.locales,'x-default'];
  check(alternates.length===wanted.length,'incomplete hreflang set');
  for(const locale of wanted){
   const href=new URL(localizedPath(expected.path,locale==='x-default'?'pl':locale),canonical).href;
   check(alternates.some(item=>item.lang===locale&&item.href===href),`incorrect hreflang ${locale}`);
  }
 }else{
  for(const alternate of alternates)check(['pl','x-default'].includes(alternate.lang)&&alternate.href===new URL(path,canonical).href,'unpublished hreflang alternative');
 }
 return failures;
}

export function auditReciprocity(pagesData){
 const failures=[];
 for(const [path,data] of pagesData){
  for(const alternate of data.alternates??[]){
   if(alternate.lang==='x-default')continue;
   let target;try{target=new URL(alternate.href).pathname;}catch{failures.push(`${path}: invalid hreflang URL`);continue;}
   const peer=pagesData.get(target);
   if(!peer||(peer.alternates??[]).every(item=>item.lang!==data.lang||item.href!==data.canonical?.[0]))failures.push(`${path}: non-reciprocal hreflang ${alternate.lang}`);
  }
 }
 return failures;
}
