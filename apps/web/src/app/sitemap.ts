import type {MetadataRoute} from "next";
import {publishedInfoPages} from "../lib/content";
export default function sitemap():MetadataRoute.Sitemap {
  const base=(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/,"");
  // Route/detail pages remain noindex until unique editorial content is reviewed.
  return [{url:base,changeFrequency:"daily",priority:1},{url:base+"/info"},
    ...publishedInfoPages().map(([slug,page])=>({url:`${base}/info/${slug}`,
      ...(page.reviewedAt ? {lastModified:page.reviewedAt} : {})}))];
}
