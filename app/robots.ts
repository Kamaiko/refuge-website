import type { MetadataRoute } from "next";

/** Open crawl policy — the site is intentionally indexable. Sitemap URL
 *  is included so crawlers find the (single-page) sitemap without needing
 *  to guess the conventional `/sitemap.xml` path. */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
