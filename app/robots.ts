import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://brivora.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/user/",
          "/dashboard/",
          "/login/",
          "/checkout/",
          "/payment/",
        ],
      },
    ],
    sitemap: SITE_URL + "/sitemap.xml",
    host: SITE_URL,
  };
}
