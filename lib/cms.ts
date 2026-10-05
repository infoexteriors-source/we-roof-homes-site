import { createClient } from "@sanity/client";
import { z } from "zod";
import {
  services,
  commercialServices,
  locations,
  articles,
  faqs,
  offer,
  roofParts,
  type ContentPage,
} from "./content";
export type Project = {
  title: string;
  city: string;
  description: string;
  image: string;
  alt: string;
  service: string;
};
export type Testimonial = {
  quote: string;
  name: string;
  source: string;
  sourceUrl: string;
};
export type SiteContent = {
  services: ContentPage[];
  commercialServices: ContentPage[];
  locations: ContentPage[];
  articles: ContentPage[];
  faqs: typeof faqs;
  offer: typeof offer;
  roofParts: typeof roofParts;
  projects: Project[];
  testimonials: Testimonial[];
  settings?: {
    experience?: string;
    licenseVerified?: boolean;
    insuranceVerified?: boolean;
  };
};
const nonempty = z.string().trim().min(1);
const pageSchema = z.object({
  slug: nonempty.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: nonempty,
  description: nonempty,
  eyebrow: nonempty,
  intro: nonempty,
  sections: z
    .array(
      z.object({
        heading: nonempty,
        text: nonempty,
        bullets: z
          .array(nonempty)
          .nullish()
          .transform((v) => v ?? undefined),
      }),
    )
    .min(1),
  kind: z.enum(["service", "location", "article"]),
  verified: z
    .boolean()
    .nullish()
    .transform((v) => v ?? false),
  updated: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  author: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  sources: z
    .array(z.object({ label: nonempty, url: z.url() }))
    .nullish()
    .transform((v) => v ?? undefined),
});
function validItems<T>(schema: z.ZodType<T>, input: unknown): T[] {
  return (Array.isArray(input) ? input : []).flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}
function mergePages(base: ContentPage[], input: unknown): ContentPage[] {
  const result = new Map(base.map((page) => [page.slug, page]));
  for (const page of validItems(pageSchema, input)) result.set(page.slug, page);
  return [...result.values()];
}
export async function getContent(): Promise<SiteContent> {
  const fallback: SiteContent = {
    services,
    commercialServices,
    locations,
    articles,
    faqs,
    offer,
    roofParts,
    projects: [],
    testimonials: [],
  };
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return fallback;
  try {
    const client = createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
      apiVersion: "2026-09-01",
      useCdn: false,
    });
    const data = await client.fetch(
      `{
   "services":*[_type=="service" && published==true]{"slug":slug.current,title,description,eyebrow,intro,sections,"kind":"service"},
   "commercialServices":*[_type=="commercialService" && published==true]{"slug":slug.current,title,description,eyebrow,intro,sections,sources,"kind":"service"},
   "locations":*[_type=="location" && published==true]{"slug":slug.current,title,description,eyebrow,intro,sections,verified,"kind":"location"},
   "articles":*[_type=="article" && published==true]{"slug":slug.current,title,description,eyebrow,intro,sections,author,updated,sources,"kind":"article"},
   "faqs":*[_type=="faq"]|order(order asc){question,answer},
   "offer":*[_type=="offer" && approved==true][0]{headline,finance,terms},
   "roofParts":*[_type=="diagramExplanation"]|order(order asc){order,name,stage,summary,text},
   "projects":*[_type=="project" && permissionConfirmed==true]{title,city,description,"image":image.asset->url,"alt":image.alt,service},
   "testimonials":*[_type=="testimonial" && verified==true]{quote,name,source,sourceUrl},
   "settings":*[_type=="siteSettings"][0]{experience,licenseVerified,insuranceVerified}
  }`,
      {},
      { next: { revalidate: 3600, tags: ["content"] } },
    );
    const parts = [...roofParts];
    for (const part of validItems(
      z.object({
        order: z.number().int().min(0).max(7),
        name: nonempty,
        stage: z.number().int().min(0).max(3),
        summary: nonempty,
        text: nonempty,
      }),
      data.roofParts,
    )) {
      parts[part.order] = {
        name: part.name,
        stage: part.stage,
        summary: part.summary,
        text: part.text,
      };
    }
    const cmsOffer = z
      .object({ headline: nonempty, finance: nonempty, terms: nonempty })
      .safeParse(data.offer);
    const cmsFaqs = validItems(
      z.object({ question: nonempty, answer: nonempty }),
      data.faqs,
    );
    return {
      ...fallback,
      services: mergePages(services, data.services),
      commercialServices: mergePages(commercialServices, data.commercialServices),
      locations: mergePages(locations, data.locations),
      articles: mergePages(articles, data.articles),
      roofParts: parts,
      offer: cmsOffer.success ? cmsOffer.data : offer,
      faqs: cmsFaqs.length ? cmsFaqs : faqs,
      projects: validItems(
        z.object({
          title: nonempty,
          city: nonempty,
          description: nonempty,
          image: z.url().refine((v) => new URL(v).hostname === "cdn.sanity.io"),
          alt: nonempty,
          service: nonempty,
        }),
        data.projects,
      ),
      testimonials: validItems(
        z.object({
          quote: nonempty,
          name: nonempty,
          source: nonempty,
          sourceUrl: z.url().refine((v) => /^https?:/.test(v)),
        }),
        data.testimonials,
      ),
      settings: z
        .object({
          experience: z.string().optional(),
          licenseVerified: z.boolean().optional(),
          insuranceVerified: z.boolean().optional(),
        })
        .safeParse(data.settings).data,
    };
  } catch (error) {
    console.error(
      "CMS content unavailable",
      error instanceof Error ? error.message : "unknown",
    );
    return fallback;
  }
}
