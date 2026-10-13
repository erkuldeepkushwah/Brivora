import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://erkuldeepkushwah.github.io/Brivora";

const PAGES: {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
}[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/services/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/course/", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/blog/", priority: 0.7, changeFrequency: "weekly" },
  { path: "/case-studies/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/logs/", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.map((p) => ({
    url: SITE_URL + p.path,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
