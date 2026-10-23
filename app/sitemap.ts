import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/config";
import { diamondsData } from "@/data/diamonds";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/diamonds"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/education"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/education/4cs"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/education/certification"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/education/natural-vs-lab-grown"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];
  if (siteConfig.features.showJewelry) pages.push({ url: absoluteUrl("/jewelry"), changeFrequency: "weekly", priority: 0.6 });

  const stones: MetadataRoute.Sitemap = diamondsData
    .filter((d) => d.availability !== "Sold")
    .map((d) => ({
      url: absoluteUrl(`/diamonds/${d.id}`),
      lastModified: d.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
      images: d.images.map((src) => absoluteUrl(src)),
    }));

  return [...pages, ...stones];
}
