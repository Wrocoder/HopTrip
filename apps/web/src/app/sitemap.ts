import type {MetadataRoute} from "next";
import {publishedInfoPages} from "../lib/content";
import {catalogPages} from "../lib/catalog-pages";
export default function sitemap():MetadataRoute.Sitemap {
  const base=(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/,"");
  return [{url:base,changeFrequency:"daily",priority:1},{url:base+"/info"},
    ...catalogPages.map(page=>({url:base+page.path})),
    ...publishedInfoPages().map(([slug,page])=>({url:`${base}/info/${slug}`,
      ...(page.reviewedAt ? {lastModified:page.reviewedAt} : {})}))];
}
