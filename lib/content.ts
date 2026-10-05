export const business = {
  name: "WeRoof",
  legalName: "WeRoof LLC",
  phone: "(240) 795-9365",
  tel: "+12407959365",
  email: "info@weroofhomes.com",
  address: "14837 Fireside Drive",
  city: "Silver Spring",
  state: "MD",
  zip: "20905",
  license: "MHIC #164924",
};
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.weroofhomes.com";
export const offer = {
  headline: "New roofs starting at $2,999",
  finance: "$0 down financing",
  terms:
    "Starting price applies to qualifying roof replacement projects. Roof size, pitch, materials, decking repairs and project scope affect the final price. A site inspection and written estimate are required. Financing is subject to credit approval and lender terms. Ask for current eligibility and offer details.",
};
export type Photo = { src: string; alt: string; caption?: string };
// Each photo appears in exactly one place on the site. Keys are homepage slots, core page keys or service slugs.
export const photos = {
  hero: "/assets/photos/roof-home.webp",
  homeServices: { src: "/assets/photos/shingle-install.webp", alt: "Roofer fastening architectural asphalt shingles on a brick colonial home" },
  homeProof: { src: "/assets/photos/estimate-checklist.webp", alt: "" },
};
export const pagePhotos: Record<string, Photo> = {
  services: { src: "/assets/photos/finished-exterior.webp", alt: "Two-story home with a new charcoal shingle roof, white lap siding and white gutters", caption: "Roof, siding and gutters." },
  financing: { src: "/assets/photos/homeowners-new-roof.webp", alt: "Homeowners on their front walk looking up at a newly roofed brick Cape Cod house", caption: "A plan that fits your budget." },
  about: { src: "/assets/photos/crew-unloading-weroof.webp", alt: "Illustrative roofing crew unloading shingles, with WeRoof branding added to the truck and a hoodie", caption: "WeRoof branding · Illustrative photo" },
  "roof-replacement": { src: "/assets/photos/roof-tear-off.webp", alt: "Roof tear-off in progress with exposed decking and a roll-off dumpster in the driveway", caption: "Down to the deck." },
  "roof-repair": { src: "/assets/photos/roof-repair-flashing.webp", alt: "Gloved hands sealing shingles around a pipe boot flashing", caption: "Targeted, lasting repairs." },
  "roof-inspection": { src: "/assets/photos/roof-inspection.webp", alt: "Inspector on a ladder checking shingles at the eave of a two-story home", caption: "What we look for." },
  "storm-damage": { src: "/assets/photos/storm-damage-detail.webp", alt: "Illustrative view of wind-lifted and missing asphalt shingles exposing roof underlayment", caption: "Storm damage, up close. Illustrative image." },
  "insurance-assistance": { src: "/assets/photos/hail-documentation.webp", alt: "Hail impacts marked in chalk on shingles being photographed with a tablet", caption: "Documented, photo by photo." },
  siding: { src: "/assets/photos/siding-install-weroof.webp", alt: "Illustrative siding installer fastening a vinyl panel, with a WeRoof logo added to the shirt sleeve", caption: "WeRoof branding · Illustrative photo" },
  gutters: { src: "/assets/photos/seamless-gutters.webp", alt: "White seamless gutter and downspout draining onto a splash block beside a brick home", caption: "Water, sent away." },
};
export type Section = { heading: string; text: string; bullets?: string[] };
export type ContentPage = {
  slug: string;
  title: string;
  /** Search-result title when it should differ from the on-page H1. */
  seoTitle?: string;
  description: string;
  eyebrow: string;
  intro: string;
  sections: Section[];
  kind?: "service" | "location" | "article";
  verified?: boolean;
  updated?: string;
  author?: string;
  sources?: { label: string; url: string }[];
};
export const services: ContentPage[] = [
  {
    slug: "roof-replacement",
    title: "Roof Replacement in Maryland",
    description:
      "Plan your Maryland roof replacement with WeRoof. Get a free inspection, a clear written estimate and financing options for qualified homeowners.",
    eyebrow: "A fresh start for your roof",
    intro:
      "A roof replacement should leave you with more than new shingles. We inspect the system underneath, explain the work your home needs, and give you a clear scope before installation.",
    kind: "service",
    sections: [
      {
        heading: "Start with the whole roof",
        text: "The condition of the decking, flashing, ventilation and drainage matters as much as the surface. Your inspection helps identify what can stay, what needs attention and which materials suit your home.",
        bullets: [
          "Roof measurement and condition assessment",
          "Written material and installation scope",
          "Decking, flashing and ventilation review",
          "Removal, installation and site cleanup",
        ],
      },
      {
        heading: "Know what is included",
        text: "Ask us to walk through your written estimate, including tear-off, disposal, replacement materials and the allowance or unit price for concealed decking damage. Any changes should be documented before extra work begins.",
      },
      {
        heading: "A roof that works with your budget",
        text: "New roofs start at $2,999 for qualifying projects. Actual pricing depends on size, complexity and condition. Ask about $0 down financing for qualified applicants and compare the full loan terms before choosing.",
      },
    ],
  },
  {
    slug: "roof-repair",
    title: "Roof Repair in Maryland",
    description:
      "Get help with roof leaks, missing shingles and flashing issues in Maryland. WeRoof offers free inspections and clear repair recommendations.",
    eyebrow: "Small problems deserve attention",
    intro:
      "A stain on the ceiling or a missing shingle is a reason to investigate. We help locate the problem and explain whether a targeted repair is appropriate.",
    kind: "service",
    sections: [
      {
        heading: "Find the source, not just the stain",
        text: "Water can travel before it becomes visible indoors. An inspection considers shingles, pipe boots, roof-to-wall transitions, flashing and nearby drainage instead of assuming the stain is directly below the leak.",
      },
      {
        heading: "Repair or replace?",
        text: "Localized damage on an otherwise sound roof may be repairable. Widespread deterioration, repeated leaks or compromised decking can make replacement the more practical option. We explain the tradeoff in writing.",
      },
      {
        heading: "What to do while you wait",
        text: "Protect belongings from interior water, photograph visible damage from a safe location and call us. Avoid climbing on a damaged or wet roof. If there is an immediate electrical or structural hazard, contact the appropriate emergency service.",
      },
    ],
  },
  {
    slug: "roof-inspection",
    title: "Free Roof Inspection in Maryland",
    description:
      "Request a free WeRoof inspection and estimate for your Maryland home. Understand roof condition, repair options, replacement scope and next steps.",
    eyebrow: "Clarity starts here",
    intro:
      "Know what is happening above your ceiling. A roof inspection gives you a clearer picture of visible conditions and a practical next step.",
    kind: "service",
    sections: [
      {
        heading: "What we look at",
        text: "We assess accessible roof surfaces and visible signs of wear, storm damage or drainage problems. Where access and conditions allow, the inspection also considers flashing, ventilation and attic indicators.",
        bullets: [
          "Missing, damaged or aging shingles",
          "Roof penetrations and transition flashing",
          "Gutter drainage and edge conditions",
          "Visible signs of moisture or ventilation issues",
        ],
      },
      {
        heading: "What you receive",
        text: "We explain the findings, discuss repair or replacement options and provide an estimate for proposed work. An inspection request is not a confirmed appointment; our team contacts you to arrange access and timing.",
      },
      {
        heading: "When an inspection is useful",
        text: "Request an inspection after a significant storm, when you notice water stains, before a planned replacement or when you are unsure about the condition of an aging roof.",
      },
    ],
  },
  {
    slug: "storm-damage",
    title: "Storm Damage Roofing in Maryland",
    description:
      "WeRoof helps Maryland homeowners assess wind and storm roof damage, document visible conditions and plan appropriate repairs or replacement.",
    eyebrow: "After the weather clears",
    intro:
      "Wind and storms can damage more than the shingles you can see from the ground. Start with a safe inspection and a documented plan.",
    kind: "service",
    sections: [
      {
        heading: "Document what you can safely see",
        text: "Take photographs from the ground, note when the storm occurred and preserve records of any temporary measures. Do not climb onto the roof or disturb damaged materials.",
      },
      {
        heading: "Understand the scope of damage",
        text: "We inspect visible conditions and explain proposed work. Damage at flashing, penetrations and roof edges can require attention even when much of the roof still appears intact.",
      },
      {
        heading: "Insurance decisions belong to your carrier",
        text: "We can provide inspection findings, photographs and an estimate for your claim. Coverage, deductibles and payment decisions are determined by your policy and insurer.",
      },
    ],
  },
  {
    slug: "insurance-assistance",
    title: "Roof Insurance Claim Assistance in Maryland",
    description:
      "Get roof inspection documentation and a clear repair estimate from WeRoof. Your insurer determines coverage and claim decisions.",
    eyebrow: "Documentation, clearly explained",
    intro:
      "We help you understand the roofing work and gather useful documentation. Your insurance company determines what your policy covers.",
    kind: "service",
    sections: [
      {
        heading: "Our role in the process",
        text: "We document visible roof conditions, prepare a work estimate and answer questions about the proposed repair or replacement. We do not guarantee claim approval or act as your insurance adjuster.",
      },
      {
        heading: "Your first steps",
        text: "Review your policy, contact your insurer about reporting requirements and retain photos, inspection notes and receipts. Ask your insurer about the deductible and the process for reviewing contractor estimates.",
      },
      {
        heading: "No promises of a free roof",
        text: "Insurance coverage varies by policy and loss. Financing is a separate payment option and is not a substitute for understanding your insurance obligations.",
      },
    ],
  },
  {
    slug: "siding",
    title: "Siding Replacement in Maryland",
    description:
      "Protect and refresh your Maryland home with siding replacement from WeRoof. Request an inspection and a clear exterior project estimate.",
    eyebrow: "Protection with curb appeal",
    intro:
      "Your siding helps manage weather at the walls of your home. We plan replacement around the surface you see and the details that keep moisture moving out.",
    kind: "service",
    sections: [
      {
        heading: "Look beyond the finish",
        text: "A siding assessment considers existing condition, transitions, trim and visible moisture concerns. Material selection should account for your priorities, maintenance expectations and the home’s existing details.",
      },
      {
        heading: "Coordinate the exterior",
        text: "Roof edges, gutters, windows and siding meet at important transitions. Planning those details together helps keep the scope clear and reduces surprises during installation.",
      },
      {
        heading: "Compare a complete scope",
        text: "Your estimate should identify material, trim, removal and disposal, moisture-management details and how concealed damage will be handled.",
      },
    ],
  },
  {
    slug: "gutters",
    title: "Gutter Replacement in Maryland",
    description:
      "Request a WeRoof gutter replacement estimate in Maryland. Plan drainage, downspouts and coordinated roof-edge details for your home.",
    eyebrow: "Give rain a better route",
    intro:
      "Gutters move water away from your roofline. The right layout considers the entire route, from the roof edge to the downspout discharge.",
    kind: "service",
    sections: [
      {
        heading: "A connected drainage system",
        text: "We review gutter condition, visible fascia concerns, downspout placement and drainage paths. Sagging, leaks at joints and repeated overflow are reasons to request an assessment.",
      },
      {
        heading: "Plan for your home",
        text: "Roof area and geometry influence the gutter system your home needs. An on-site assessment helps establish size, layout and scope instead of relying on a one-size-fits-all quote.",
      },
      {
        heading: "Pair it with roofing or siding",
        text: "Exterior work is easier to coordinate when connected components are considered together. Ask us whether gutter replacement should be included in your broader project.",
      },
    ],
  },
];
export const commercialServices: ContentPage[] = [
  {
    slug: "tpo-roofing",
    title: "TPO Roofing in Maryland",
    description: "Explore TPO roofing for Maryland commercial and low-slope buildings. Request a site assessment and a written roof scope from WeRoof.",
    eyebrow: "COMMERCIAL ROOFING · TPO",
    intro: "TPO is a single-ply membrane used on many low-slope roofs. We start with the building, drainage and existing assembly before recommending a system.",
    kind: "service",
    sections: [
      { heading: "A roof designed around its details", text: "TPO membranes rely on carefully planned seams, roof edges, penetrations and drainage. An assessment should document the existing roof, insulation, rooftop equipment and access before a replacement scope is written." },
      { heading: "Questions worth settling before installation", text: "We review how the roof will be attached, how water reaches drains or gutters, and how equipment curbs and transitions will be flashed. Your estimate should identify the proposed assembly and any work that depends on conditions uncovered during the project.", bullets: ["Existing roof and substrate condition", "Drainage, ponding and tapered-insulation needs", "Seams, penetrations and perimeter details", "Work sequencing around building operations"] },
      { heading: "Compare the complete proposal", text: "A membrane name alone does not define the whole roof. Ask about insulation, cover board, flashing, removal or recover, and the applicable manufacturer documentation for the specified system." },
    ],
    sources: [{ label: "GAF guide to TPO roofing", url: "https://www.gaf.com/en-us/roofing-materials/commercial-single-ply/tpo-roofing" }],
  },
  {
    slug: "commercial-metal-roofing",
    title: "Commercial Metal Roofing in Maryland",
    description: "Plan a commercial metal roof in Maryland with attention to panels, slope, seams, drainage and building use. Request a WeRoof assessment.",
    eyebrow: "COMMERCIAL ROOFING · METAL",
    intro: "Commercial metal roofing is not one panel or one detail. The right scope depends on roof geometry, substrate, exposure and the way the building is used.",
    kind: "service",
    sections: [
      { heading: "Choose the assembly, not just the color", text: "Panel profile, fastening method, finish and underlayment all belong in the conversation. We evaluate the existing deck and roof geometry before proposing a metal system." },
      { heading: "The transitions do the hard work", text: "Roof edges, parapets, penetrations, valleys and equipment connections deserve clear drawings and written scope. Movement and drainage should be considered alongside appearance.", bullets: ["Panel and finish specification", "Deck and substrate review", "Flashing and penetrations", "Access, staging and protection during work"] },
      { heading: "A practical installation plan", text: "We discuss how the project will be staged around the building and what the estimate includes for removal, preparation, installation and cleanup. Product and warranty terms belong in the final written proposal." },
    ],
  },
  {
    slug: "commercial-asphalt-roofing",
    title: "Commercial Asphalt Roofing in Maryland",
    description: "Understand asphalt roofing options for sloped commercial buildings in Maryland. Get a site-specific scope for replacement or repair.",
    eyebrow: "COMMERCIAL ROOFING · ASPHALT",
    intro: "Some commercial buildings have steep-slope asphalt roofs. We assess the full assembly, not only the visible shingles, before recommending repair or replacement.",
    kind: "service",
    sections: [
      { heading: "Start with slope and condition", text: "Asphalt roofing is suited to roof slopes and assemblies that support its intended use. We examine visible wear, decking concerns, ventilation and water-shedding details as part of the assessment." },
      { heading: "Where commercial roofs get complicated", text: "Larger roof areas, multiple elevations, entrances and rooftop equipment can change access and sequencing. Flashing at walls, valleys and penetrations needs explicit attention in the estimate.", bullets: ["Existing surface and underlayment", "Flashing and edge conditions", "Drainage and ventilation", "Business access during work"] },
      { heading: "A written scope you can compare", text: "The proposal should make materials, tear-off, disposal, repairs and cleanup easy to understand. If concealed conditions are possible, ask how they will be documented and priced." },
    ],
  },
  {
    slug: "epdm-roofing",
    title: "EPDM Roofing in Maryland",
    description: "Explore EPDM membrane roofing for Maryland commercial and low-slope properties. Request a roof assessment and written scope.",
    eyebrow: "COMMERCIAL ROOFING · EPDM",
    intro: "EPDM is a rubber roofing membrane commonly used on low-slope buildings. Performance depends on the complete assembly and careful treatment of seams and transitions.",
    kind: "service",
    sections: [
      { heading: "Look at the whole low-slope roof", text: "Before choosing a membrane, we review the roof deck, insulation, drainage and existing materials. The condition underneath influences whether repair, recover or replacement should be considered." },
      { heading: "Details that need a defined scope", text: "Seams, perimeter edges, drains, penetrations and rooftop equipment each need compatible details. An estimate should identify the proposed membrane assembly and how these transitions are addressed.", bullets: ["Drain and scupper conditions", "Seams and flashing", "Attachment method and substrate", "Protection around rooftop equipment"] },
      { heading: "Understand the proposal", text: "Ask for the specified membrane, insulation, accessory materials and manufacturer documentation. The written scope should also explain access, disposal and any contingent repairs." },
    ],
    sources: [{ label: "Elevate commercial EPDM overview", url: "https://www.elevatecommercialbp.com/us-en/roofing/epdm-roofing-systems" }],
  },
  {
    slug: "flat-roofing",
    title: "Flat Roofing in Maryland",
    description: "Get a clear plan for commercial flat and low-slope roof repair or replacement in Maryland. Compare drainage, membrane and scope options.",
    eyebrow: "COMMERCIAL ROOFING · LOW-SLOPE",
    intro: "A “flat” roof still needs a reliable path for water. We assess the roof assembly, drainage and building use before recommending a repair or replacement approach.",
    kind: "service",
    sections: [
      { heading: "Find the reason water is staying", text: "Leaks and ponding can involve drains, slope, flashing, seams or equipment penetrations. A site assessment helps separate a localized problem from a broader system concern." },
      { heading: "Compare roof-system choices", text: "TPO, EPDM and other low-slope systems have different details and compatibility considerations. We explain the proposed assembly in plain language and document what will be installed.", bullets: ["Drainage and tapered-slope options", "Existing membrane and insulation condition", "Penetrations, parapets and roof edges", "Repair, recover or replacement scope"] },
      { heading: "Keep the building in the plan", text: "Access, occupied spaces, rooftop equipment and weather windows can affect the work sequence. We include those practical constraints in the project conversation and written estimate." },
    ],
  },
];
export const locations = [
  [
    "silver-spring",
    "Silver Spring",
    "From established homes around Four Corners to the neighborhoods near Colesville, roof access, tree cover and additions can vary considerably. We begin with the actual home and its roof details.",
  ],
  [
    "bethesda",
    "Bethesda",
    "Older homes, renovations and complex rooflines can meet on a single Bethesda property. Pay particular attention to additions, wall intersections and flashing when comparing a replacement scope.",
  ],
  [
    "rockville",
    "Rockville",
    "Rockville homeowners may need to coordinate exterior materials with community requirements. Confirm any applicable design approval before selecting replacement shingles or siding.",
  ],
  [
    "gaithersburg",
    "Gaithersburg",
    "Townhomes and detached properties call for different access and staging plans. We discuss property access, neighboring homes and removal logistics during the estimate.",
  ],
  [
    "wheaton",
    "Wheaton",
    "On established Wheaton properties, roof penetrations, mature trees and prior repairs deserve a careful look. An assessment can help distinguish a localized issue from wider wear.",
  ],
  [
    "takoma-park",
    "Takoma Park",
    "Some Takoma Park homes have historic-district requirements. Confirm the property’s status and any applicable exterior approvals before committing to a roofing material or appearance change.",
  ],
  [
    "laurel",
    "Laurel",
    "Laurel-area addresses can fall within different jurisdictions. Confirm the property’s county and applicable local requirements as part of planning a roof or exterior project.",
  ],
  [
    "bowie",
    "Bowie",
    "A roof estimate for a Bowie home should account for its roof shape, attic ventilation and drainage. These details help determine a complete scope beyond the visible shingles.",
  ],
].map(([slug, name, local]): ContentPage => ({
  slug: `${slug}-md`,
  title: `Roofing & Exterior Services in ${name}, MD`,
  description: `Request a free roof inspection in ${name}, Maryland. WeRoof offers roof repair, replacement, siding, gutters and financing for qualified homeowners.`,
  eyebrow: "Maryland service areas",
  intro: `A clear roofing plan for your ${name} home. WeRoof serves Maryland homeowners with inspections, repairs, replacements and coordinated exterior work.`,
  kind: "location",
  verified: false,
  sections: [
    { heading: `Planning roofing work in ${name}`, text: local },
    {
      heading: "Start with an inspection",
      text: "Tell us your address and the concern you have noticed. We will contact you to arrange an inspection, discuss access and explain the next steps. Your written estimate will define the proposed work.",
    },
    {
      heading: "Roofing, siding and gutter services",
      text: "Ask about a targeted roof repair, a full replacement, siding or gutter work. For qualifying roof replacements, pricing starts at $2,999; the final scope and price follow inspection.",
    },
  ],
}));
export const articles: ContentPage[] = [
  {
    slug: "maryland-roof-replacement-cost",
    title: "What Determines Roof Replacement Cost in Maryland?",
    description:
      "Understand roof size, pitch, materials, decking, flashing and disposal costs before comparing Maryland roof replacement estimates.",
    eyebrow: "Homeowner guide",
    intro:
      "The useful price is the one attached to a complete scope. Roof size is only one of the variables behind a replacement estimate.",
    kind: "article",
    sections: [
      {
        heading: "Size and access",
        text: "Contractors measure the roof surface, not just the home’s floor area. Steep sections, multiple valleys, roof height and difficult access can affect labor, staging and material needs.",
      },
      {
        heading: "Materials and underlying condition",
        text: "Shingles are only part of the system. Underlayment, flashing, vents, edge details and damaged decking can change the final cost. Compare written scopes with the same assumptions.",
      },
      {
        heading: "What does “starting at $2,999” mean?",
        text: "It is the starting price for qualifying WeRoof roof replacement projects, not an estimate for every home. Your inspection determines eligibility, roof dimensions and the final written price.",
      },
      {
        heading: "Questions to ask before signing",
        text: "Ask whether removal, disposal, flashing, ventilation and cleanup are included. Ask how concealed damage is priced and request written terms for warranties and financing.",
      },
    ],
  },
  {
    slug: "repair-or-replace",
    title: "Should You Repair or Replace Your Roof?",
    description:
      "Compare localized repairs with full roof replacement by considering roof condition, repeat leaks and long-term scope.",
    eyebrow: "Make an informed choice",
    intro:
      "A repair is worth considering when the damage is limited and the rest of the roof is sound. Replacement becomes a stronger option when problems are widespread.",
    kind: "article",
    sections: [
      {
        heading: "When repair may make sense",
        text: "A localized flashing issue or small damaged area can sometimes be addressed without replacing the full roof. An inspection should establish the cause and the condition of surrounding materials.",
      },
      {
        heading: "When replacement deserves a closer look",
        text: "Multiple leaks, widespread deterioration or extensive underlying damage can make repeated patching less practical. Age provides context, but condition and the overall system should guide the recommendation.",
      },
      {
        heading: "Compare the outcome",
        text: "Ask what the repair will address, what it will not address and what remaining concerns exist. Compare that with a replacement scope and your plans for the home.",
      },
    ],
  },
  {
    slug: "storm-damage-checklist",
    title: "A Safe Roof Storm-Damage Checklist",
    description:
      "Document roof concerns safely after a Maryland storm and prepare for your contractor inspection and insurer conversation.",
    eyebrow: "After a storm",
    intro:
      "Start from a safe place. You do not need to climb onto a roof to begin documenting a concern.",
    kind: "article",
    sections: [
      {
        heading: "Look from the ground",
        text: "Note fallen branches, displaced shingles, damaged gutters and visible debris. Stay away from power lines and unstable trees. Photograph what is safely visible.",
      },
      {
        heading: "Check inside",
        text: "Look for new ceiling stains or water entry. Move belongings where safe. Avoid wet electrical fixtures and areas where ceilings appear unstable.",
      },
      {
        heading: "Keep a record",
        text: "Record the storm date and preserve photos and receipts. Contact your insurer about its reporting requirements and arrange a professional roof inspection.",
      },
      {
        heading: "Review contractor claims carefully",
        text: "A contractor can document roof conditions and provide an estimate. Your insurer determines coverage. Be cautious about promises of guaranteed approval or a free roof.",
      },
    ],
    sources: [
      {
        label:
          "Maryland Insurance Administration: consumer advisory on free-roof offers",
        url: "https://insurance.maryland.gov/Consumer/Documents/publicnew/Consumer-Advisory-Free-Roof-Offers.pdf",
      },
    ],
  },
  {
    slug: "roof-financing",
    title: "How to Compare Roof Financing Options",
    description:
      "Understand down payments, APR, loan terms, fees and total repayment when considering roof financing in Maryland.",
    eyebrow: "Understand your options",
    intro:
      "Financing can spread a project’s cost over time. Compare the total repayment and terms, as well as the monthly payment.",
    kind: "article",
    sections: [
      {
        heading: "$0 down is not 0% interest",
        text: "A zero-down offer refers to the initial down payment. It does not state an interest rate or guarantee approval. Ask the lender for APR, payment schedule, fees and total repayment.",
      },
      {
        heading: "Read promotional terms",
        text: "Confirm whether an offer involves deferred interest, when payments begin, whether early repayment has fees and what happens if a promotional period ends with a balance.",
      },
      {
        heading: "Make an informed decision",
        text: "Compare the cash project price with the financed cost and choose a payment arrangement you understand. WeRoof can explain the project scope; the lender supplies financing terms.",
      },
    ],
  },
  {
    slug: "roof-warning-signs",
    title: "Signs Your Roof Needs an Inspection",
    description:
      "Learn which roof and interior warning signs call for a professional assessment, from missing shingles to ceiling stains.",
    eyebrow: "Know what to look for",
    intro:
      "Visible changes are a reason to investigate, not a diagnosis. A professional inspection helps connect the signs to a repair plan.",
    kind: "article",
    sections: [
      {
        heading: "Changes on the roof",
        text: "Missing or damaged shingles, debris, displaced flashing and recurring gutter overflow merit attention. Inspect from the ground; avoid walking on the roof.",
      },
      {
        heading: "Changes indoors",
        text: "New water stains, recurring leaks or visible attic moisture can indicate a roofing or ventilation concern. Water sometimes travels, so the stain does not always identify the source.",
      },
      {
        heading: "Repeated repairs",
        text: "If the same problem returns, ask for an assessment of the surrounding roof system. A broader issue may need a different scope than another patch.",
      },
    ],
  },
];
export const faqs = [
  {
    question: "Is the roof inspection really free?",
    answer:
      "Yes. Request a free inspection and estimate for your roofing or exterior project. Our team will contact you to arrange a suitable time and explain what can be assessed.",
  },
  {
    question: "Can I get a new roof for $2,999?",
    answer:
      "Qualifying roof replacement projects start at $2,999. Roof size, pitch, materials and underlying condition affect eligibility and final pricing. An inspection and written estimate confirm your project price.",
  },
  {
    question: "Does $0 down mean 0% interest?",
    answer:
      "No. $0 down refers to the down payment, not the interest rate. Financing is subject to credit approval and lender terms. Review the APR, fees, repayment schedule and total cost before choosing.",
  },
  {
    question: "Do you repair roofs as well as replace them?",
    answer:
      "Yes. We inspect the issue and explain whether a targeted repair or a full replacement is appropriate for your roof’s condition.",
  },
  {
    question: "Where in Maryland do you work?",
    answer:
      "WeRoof is based in Silver Spring. Our Maryland service directory screens communities within an estimated one-hour road trip from downtown Bethesda. The estimates do not include traffic, so share your exact property address and we’ll confirm eligibility and scheduling. We do not offer statewide coverage beyond that limit.",
  },
  {
    question: "Can you help with storm-damage insurance paperwork?",
    answer:
      "We can provide inspection findings, photos and an estimate for proposed roofing work. Your insurer determines coverage and claim approval under your policy.",
  },
];
export const roofParts = [
  {
    name: "Framing & decking",
    stage: 0,
    summary: "The foundation of the system",
    text: "Rafters support the roof, while decking provides a continuous base for the layers above. Damaged decking must be assessed during the project.",
  },
  {
    name: "Attic insulation",
    stage: 0,
    summary: "Comfort starts beneath the roof",
    text: "Insulation helps manage heat transfer between living spaces and the attic. It must work alongside clear ventilation paths.",
  },
  {
    name: "Water barrier",
    stage: 1,
    summary: "Extra protection where water collects",
    text: "A self-adhering membrane helps protect vulnerable areas such as roof edges and valleys. Placement depends on the roof and applicable requirements.",
  },
  {
    name: "Underlayment",
    stage: 1,
    summary: "A second line of defense",
    text: "Underlayment sits between the decking and shingles, providing an additional moisture-shedding layer within the roof system.",
  },
  {
    name: "Starter shingles",
    stage: 2,
    summary: "A strong beginning at the edge",
    text: "Starter courses create the first shingle connection at the perimeter and help the system resist wind at vulnerable edges.",
  },
  {
    name: "Field shingles",
    stage: 2,
    summary: "The surface that takes the weather",
    text: "Overlapping shingles shed rain and protect the underlying system. Correct fastening and flashing details matter as much as the finish.",
  },
  {
    name: "Intake & ridge ventilation",
    stage: 3,
    summary: "A clear path for attic airflow",
    text: "Intake at the lower roof and exhaust near the ridge work together to move air through the attic. The correct balance depends on the home.",
  },
  {
    name: "Ridge caps",
    stage: 3,
    summary: "The finishing protection at the peak",
    text: "Ridge caps cover the meeting point of the roof slopes. They complete the weather-shedding surface and protect compatible ridge-vent details.",
  },
];
