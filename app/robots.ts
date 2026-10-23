import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

// Open to all crawlers, including AI search and assistant bots (OAI-SearchBot, ChatGPT-User,
// PerplexityBot, Claude-SearchBot, GPTBot, ClaudeBot, Google-Extended), so the catalog can be cited.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
