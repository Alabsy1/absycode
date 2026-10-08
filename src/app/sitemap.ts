import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://absycode.com";
  const urls: MetadataRoute.Sitemap = [];
  for (const locale of ["en", "ar"]) {
    urls.push({ url: `${base}/${locale}`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 });
    urls.push({ url: `${base}/${locale}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 });
    urls.push({ url: `${base}/${locale}/insights`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 });
    for (const p of site.projects) urls.push({ url: `${base}/${locale}/work/${p.slug}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 });
  }
  return urls;
}
