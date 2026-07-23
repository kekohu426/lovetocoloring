import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

/** Public, indexable routes only — `/my-pages` is per-user and stays out. */
const ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/text-to-coloring-page", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/photo-to-coloring-page", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
