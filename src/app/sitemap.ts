import type { MetadataRoute } from "next";

/** Single-page portfolio site — the sitemap is one entry. Anchor-link
 *  sections (`#manifeste`, `#refuges`, etc.) don't get their own URLs,
 *  so they don't show up here. If the site later splits into per-refuge
 *  detail pages, add an entry per slug. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
