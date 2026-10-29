import type {InfoContent} from '../info-types.ts';
import type {Locale} from './config.ts';
import {mapGuideText,guideTexts} from './guide-text.ts';
import translations from './guide-translations.json' with {type:'json'};

export type GuideTranslation={sourceHash:string;en:string[];ru:string[];uk:string[]};
export const guideTranslations:Record<string,GuideTranslation>=translations;
export function translatedGuideContent(slug:string,page:InfoContent,locale:Locale):InfoContent {
 if(locale==='pl')return page;
 const translated=guideTranslations[slug]?.[locale];
 if(!translated||translated.length!==guideTexts(page).length)throw new Error(`Incomplete guide translation: ${locale}/${slug}`);
 let index=0;return mapGuideText(page,()=>translated[index++]);
}
