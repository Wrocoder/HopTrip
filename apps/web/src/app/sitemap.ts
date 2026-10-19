import type {MetadataRoute} from "next";
import {publishedInfoPages} from "../lib/content";
import {catalogPages} from "../lib/catalog-pages";
import {locales} from "../lib/i18n/config";
import {translatedPaths,localizedHref} from "../lib/i18n/routing";
export default function sitemap():MetadataRoute.Sitemap {
  const base=(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/,"");
  return [{url:base,changeFrequency:"daily",priority:1},{url:base+"/info"},
    ...translatedPaths.flatMap(path=>locales.filter(locale=>locale!=="pl").map(locale=>({url:base+localizedHref(path,locale)}))),
    ...catalogPages.map(page=>({url:base+page.path})),
    ...publishedInfoPages().map(([slug,page])=>({url:`${base}/info/${slug}`,
      ...(page.reviewedAt ? {lastModified:page.reviewedAt} : {})}))];
}
