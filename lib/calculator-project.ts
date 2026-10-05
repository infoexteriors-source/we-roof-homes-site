import { z } from "zod";

export const projectChoices = {
  role: ["Homeowner", "Property manager", "Buying this home", "Other / not sure"],
  need: ["Full replacement", "Repair or active leak", "Storm damage", "Not sure yet"],
  timeline: ["As soon as possible", "Within 1–3 months", "Within 3–6 months", "Just planning"],
  age: ["Under 10 years", "10–20 years", "Over 20 years", "Not sure"],
  financing: ["Not specified", "Interested", "Not interested", "Show me options"],
  priority: ["Best value", "Long-term durability", "Appearance", "Help me decide"],
  contactMethod: ["Email", "Phone call"],
  contactTime: ["Any time", "Morning", "Afternoon", "Evening"],
} as const;

export const projectSchema = z.object({
  role: z.enum(projectChoices.role), need: z.enum(projectChoices.need),
  timeline: z.enum(projectChoices.timeline), age: z.enum(projectChoices.age),
  financing: z.enum(projectChoices.financing), priority: z.enum(projectChoices.priority),
  contactMethod: z.enum(projectChoices.contactMethod), contactTime: z.enum(projectChoices.contactTime),
  structures: z.array(z.enum(["Attached garage", "Detached garage", "Porch / addition"])).max(3),
  interests: z.array(z.enum(["Siding", "Gutters"])).max(2),
  notes: z.string().trim().max(1000),
  unknowns: z.array(z.enum(["shape", "pitch"])).max(2),
  propertyConfirmed: z.boolean(),
  inspectionRequested: z.boolean(),
});
export type CalculatorProject = z.infer<typeof projectSchema>;
export const initialProject: CalculatorProject = {
  role: "Other / not sure", need: "Not sure yet", timeline: "Just planning", age: "Not sure",
  financing: "Not specified", priority: "Help me decide", contactMethod: "Email", contactTime: "Any time",
  structures: [], interests: [], notes: "", unknowns: [], propertyConfirmed: false, inspectionRequested: false,
};

export const materialNotes = {
  architectural: "A practical balance of upfront cost and style. Architectural asphalt shingles.",
  designer: "A more dimensional look with designer asphalt shingles. Higher upfront cost.",
  metal: "Standing-seam metal for a distinctive look. Higher upfront investment.",
  "synthetic-slate": "A slate-inspired appearance using synthetic materials. Premium investment.",
};
