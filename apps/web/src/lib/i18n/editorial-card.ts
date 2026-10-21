import type {Locale} from "./config";
import type {InfoContent} from "../info-types";
import {isServiceSlug,serviceContent} from "./service-content";
import {budgetText} from "./budget-copy";
import {shell} from "./shell";
export function editorialCard(slug:string,page:InfoContent,locale:Locale) {
 if(locale==="pl")return {title:page.title,description:page.description??page.paragraphs[0],translated:true};
 if(isServiceSlug(slug)){
  const translated=serviceContent(slug,locale);
  return {title:translated.title,description:translated.description??translated.paragraphs[0],translated:true};
 }
 if(slug==="trip-budget")return {title:budgetText(locale,"Kalkulator budżetu podróży"),description:shell[locale].budgetIntro,translated:true};
 return {title:page.title,description:page.description??page.paragraphs[0],translated:false};
}
