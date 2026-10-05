import { defineType, defineField } from "sanity";
const text = (name: string, title?: string) =>
  defineField({ name, title: title || name, type: "string" });
const body = (name: string) => defineField({ name, type: "text", rows: 4 });
const checkbox = (name: string, title: string) =>
  defineField({ name, title, type: "boolean", initialValue: false });
const section = defineType({
  name: "section",
  type: "object",
  fields: [
    text("heading"),
    body("text"),
    { name: "bullets", type: "array", of: [{ type: "string" }] },
  ],
});
const page = (name: string) =>
  defineType({
    name,
    title: name[0].toUpperCase() + name.slice(1),
    type: "document",
    fields: [
      text("title"),
      {
        name: "slug",
        type: "slug",
        options: { source: "title" },
        validation: (r) => r.required(),
      },
      text("description", "SEO description"),
      text("eyebrow"),
      body("intro"),
      { name: "sections", type: "array", of: [{ type: "section" }] },
      checkbox("published", "Ready to publish"),
      ...(name === "location"
        ? [
            checkbox(
              "verified",
              "Unique local content and service evidence verified",
            ),
          ]
        : []),
      ...(name === "article"
        ? [
            text("author", "Author / reviewer"),
            defineField({ name: "updated", type: "date" }),
          ]
        : []),
      ...(["article", "commercialService"].includes(name)
        ? [defineField({ name: "sources", type: "array", of: [{ type: "object", fields: [text("label"), { name: "url", type: "url" }] }] })]
        : []),
    ],
  });
export const schemaTypes = [
  section,
  ...["service", "commercialService", "location", "article"].map(page),
  defineType({
    name: "siteSettings",
    title: "Business verification",
    type: "document",
    fields: [
      text("experience", "Verified experience statement"),
      checkbox("licenseVerified", "License verified"),
      checkbox("insuranceVerified", "Insurance verified"),
    ],
  }),
  defineType({
    name: "offer",
    title: "Approved offer",
    type: "document",
    fields: [
      text("headline"),
      text("finance"),
      body("terms"),
      checkbox("approved", "Price, eligibility and lender terms approved"),
    ],
  }),
  defineType({
    name: "project",
    title: "Project",
    type: "document",
    fields: [
      text("title"),
      text("city"),
      text("service"),
      body("description"),
      {
        name: "image",
        type: "image",
        options: { hotspot: true },
        fields: [text("alt", "Descriptive image alt text")],
      },
      checkbox(
        "permissionConfirmed",
        "Actual completed project and publication permission verified",
      ),
    ],
  }),
  defineType({
    name: "testimonial",
    title: "Customer review",
    type: "document",
    fields: [
      body("quote"),
      text("name"),
      text("source"),
      { name: "sourceUrl", type: "url" },
      checkbox("verified", "Review source and permission verified"),
    ],
  }),
  defineType({
    name: "faq",
    title: "Frequently asked question",
    type: "document",
    fields: [
      text("question"),
      body("answer"),
      { name: "order", type: "number" },
    ],
  }),
  defineType({
    name: "diagramExplanation",
    title: "Roof diagram explanation",
    type: "document",
    fields: [
      text("name"),
      text("summary"),
      body("text"),
      {
        name: "stage",
        type: "number",
        validation: (r) => r.min(0).max(3).integer(),
      },
      {
        name: "order",
        type: "number",
        validation: (r) => r.min(0).max(7).integer(),
      },
    ],
  }),
];
