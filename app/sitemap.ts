import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";
import { getContent } from "@/lib/cms";
import { serviceAreas } from "@/lib/service-areas";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getContent();
  const updated = new Map(c.articles.filter((a) => a.updated).map((a) => [`/resources/${a.slug}`, new Date(a.updated!)]));
  return [
    ...[
      "",
      "/about",
      "/contact",
      "/services",
      "/commercial-roofing",
      "/financing",
      "/projects",
      "/reviews",
      "/resources",
      "/service-areas",
      "/privacy-policy",
      "/terms",
      "/roof-system",
      "/roof-cost-calculator",
      "/siding-cost-calculator",
      "/gutter-cost-calculator",
    ],
    ...c.services.map((p) => `/services/${p.slug}`),
    ...c.commercialServices.map((p) => `/commercial-roofing/${p.slug}`),
    ...serviceAreas.map((p) => `/service-areas/${p.slug}`),
    ...c.articles.map((p) => `/resources/${p.slug}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    ...(updated.has(path) ? { lastModified: updated.get(path) } : {}),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/services/") ? 0.8 : 0.6,
  }));
}
