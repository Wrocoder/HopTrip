import type {Locale} from "./config";
import type {InfoContent} from "../info-types";
import {isServiceSlug,serviceContent} from "./service-content";
import {hasGuideTranslation} from './guide-slugs';
import {translatedGuideContent} from './guide-content';
export function editorialCard(slug:string,page:InfoContent,locale:Locale) {
 if(locale==="pl")return {title:page.title,description:page.description??page.paragraphs[0],translated:true};
 if(isServiceSlug(slug)){
  const translated=serviceContent(slug,locale);
  return {title:translated.title,description:translated.description??translated.paragraphs[0],translated:true};
 }
 if(hasGuideTranslation(slug)){
  const translated=translatedGuideContent(slug,page,locale);
  return {title:translated.title,description:translated.description??translated.paragraphs[0],translated:true};
 }
 return {title:page.title,description:page.description??page.paragraphs[0],translated:false};
}
