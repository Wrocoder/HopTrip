import {articlePhoto} from '../../lib/article-imagery';
import type {Locale} from '../../lib/i18n/config';
import {ArticlePhoto} from './article-photo';

export function ArticleIllustration({slug,locale='pl',placement='cover'}:{
 slug:string;locale?:Locale;placement?:'cover'|'inline';
}){
 const selected=articlePhoto(slug,locale,placement);
 return selected?<ArticlePhoto image={selected.image} caption={selected.caption}
  locale={locale} placement={placement} cityContext={selected.cityContext}
  deferCover={['alicante-airport','malaga-airport','lisbon-airport'].includes(slug)}/>:null;
}
