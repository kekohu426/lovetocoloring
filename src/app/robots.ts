import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Answer engines are explicitly welcome — being quoted is the point.
      { userAgent: "*", allow: "/", disallow: ["/api/", "/my-pages"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
