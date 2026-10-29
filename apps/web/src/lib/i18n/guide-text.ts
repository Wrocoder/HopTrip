import type {InfoContent,InfoLink} from '../info-types.ts';

// Only reader-facing text is translated. URLs, dates, source indices and flags
// always come from the original article, including when it is updated.
export function mapGuideText(page:InfoContent,translate:(text:string)=>string):InfoContent {
 const links=(items:InfoLink[])=>items.map(item=>({...item,label:translate(item.label)}));
 return {...page,title:translate(page.title),...(page.description!==undefined?{description:translate(page.description)}:{}),
  paragraphs:page.paragraphs.map(translate),
  ...(page.sections?{sections:page.sections.map(section=>({...section,title:translate(section.title),paragraphs:section.paragraphs.map(translate),
   ...(section.links?{links:links(section.links)}:{})}))}:{}),
  ...(page.sources?{sources:links(page.sources)}:{}),...(page.routes?{routes:links(page.routes)}:{})};
}
export function guideTexts(page:InfoContent):string[]{
 const result:string[]=[];mapGuideText(page,text=>{result.push(text);return text;});return result;
}
