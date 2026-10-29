import type {MetadataRoute} from "next";
import {publishedInfoPages} from "../lib/content";
import {catalogPages} from "../lib/catalog-pages";
import {locales} from "../lib/i18n/config";
import {translatedPaths,localizedHref} from "../lib/i18n/routing";
import {translatedGuideSlugs} from '../lib/i18n/guide-slugs';
export default function sitemap():MetadataRoute.Sitemap {
  const base=(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/,"");
  const infoPages=publishedInfoPages(),reviewed=new Map(infoPages.map(([slug,page])=>[`/info/${slug}`,page.reviewedAt]));
  const translated=[...new Set([...translatedPaths,...translatedGuideSlugs.map(slug=>`/info/${slug}`)])];
  return [{url:base,changeFrequency:"daily",priority:1},{url:base+"/info"},
    ...translated.flatMap(path=>locales.filter(locale=>locale!=="pl").map(locale=>({url:base+localizedHref(path,locale),
      ...(reviewed.get(path)?{lastModified:reviewed.get(path)}:{})}))),
    ...catalogPages.map(page=>({url:base+page.path})),
    ...infoPages.map(([slug,page])=>({url:`${base}/info/${slug}`,
      ...(page.reviewedAt ? {lastModified:page.reviewedAt} : {})}))];
}
