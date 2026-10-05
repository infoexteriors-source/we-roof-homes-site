import { createHash, createHmac, randomUUID } from "node:crypto";
import { z } from "zod";
import { projectSchema } from "./calculator-project";
import {
  estimateGutters, estimateRoof, estimateSiding, formatUsd, ratesAreDraft,
  type Estimate,
} from "./estimator";

const homeSize = z.enum(["under-1000", "1000-1750", "1750-2500", "2500-3500", "over-3500"]);
const stories = z.union([z.literal(1), z.literal(2), z.literal(3)]);
const roofShape = z.enum(["gable", "hip", "complex"]);

export const calculatorAnswersSchema = z.discriminatedUnion("service", [
  z.object({ service: z.literal("roof"), size: homeSize, stories, shape: roofShape, pitch: z.enum(["walkable", "moderate", "steep"]), material: z.enum(["architectural", "designer", "metal", "synthetic-slate"]), livingSqft: z.number().min(300).max(20000).optional() }),
  z.object({ service: z.literal("siding"), size: homeSize, stories, material: z.enum(["vinyl", "insulated-vinyl", "fiber-cement"]), trim: z.boolean(), shutters: z.boolean() }),
  z.object({ service: z.literal("gutters"), size: homeSize, stories, shape: roofShape, gutter: z.enum(["5in", "6in"]), guards: z.boolean(), removeOld: z.boolean() }),
]);

export const calculatorLeadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  phone: z.string().trim().max(40).refine((value) => !value || /^\+?[\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 10 && value.replace(/\D/g, "").length <= 15, "Enter a valid phone number").optional().default(""),
  address: z.string().trim().min(5, "Enter your street address and city").max(240),
  zip: z.string().regex(/^\d{5}$/, "Enter a five-digit ZIP code"),
  calculation: calculatorAnswersSchema,
  project: projectSchema.optional(),
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional().default(""),
  submissionId: z.string().regex(/^[\w-]{16,80}$/).optional(),
  submittedAt: z.iso.datetime().optional(),
  utm_source: z.string().max(300).optional(),
  utm_medium: z.string().max(300).optional(),
  utm_campaign: z.string().max(300).optional(),
  gclid: z.string().max(300).optional(),
  msclkid: z.string().max(300).optional(),
}).superRefine((input, ctx) => {
  if ((input.project?.inspectionRequested || input.project?.contactMethod === "Phone call") && !input.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a phone number for your inspection request or phone follow-up." });
});

export type CalculatorLead = z.infer<typeof calculatorLeadSchema>;

export function calculateEstimate(answers: z.infer<typeof calculatorAnswersSchema>): Estimate {
  if (answers.service === "roof") return estimateRoof(answers);
  if (answers.service === "siding") return estimateSiding(answers);
  return estimateGutters(answers);
}

export function calculatorLeadPayload(input: CalculatorLead) {
  const estimate = calculateEstimate(input.calculation);
  const digits = input.phone.replace(/\D/g, "");
  return {
    type: "calculator_estimate_request",
    id: input.submissionId || randomUUID(),
    journeyId: input.submissionId,
    submittedAt: input.submittedAt || new Date().toISOString(),
    contact: {
      firstName: input.firstName,
      email: input.email.toLowerCase(),
      phone: digits ? (digits.length === 10 ? `+1${digits}` : `+${digits}`) : "",
      address: input.address,
      zip: input.zip,
    },
    calculation: input.calculation,
    project: input.project,
    measurementSource: "Homeowner answers and planning assumptions; not aerial measurements",
    planningRange: { ...estimate, formatted: `${formatUsd(estimate.low)}–${formatUsd(estimate.high)}`, draft: ratesAreDraft },
    requestedFollowUp: input.project?.inspectionRequested ? "Inspection requested (not booked), plus planning PDF by email" : "Automatic planning-range PDF by email; written quote follows an inspection",
    consent: { emailAboutRequest: true, sms: false, version: "2026-10-05" },
    attribution: {
      sourcePage: input.calculation.service === "roof" ? "/roof-cost-calculator" : input.calculation.service === "siding" ? "/siding-cost-calculator" : "/gutter-cost-calculator",
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      gclid: input.gclid,
      msclkid: input.msclkid,
    },
  };
}

export async function deliverCalculatorLead(input: CalculatorLead, fetcher: typeof fetch = fetch) {
  const payload = calculatorLeadPayload(input);
  await sendCalculatorWebhook(payload, fetcher);
  return payload;
}

export async function sendCalculatorWebhook(payload: { id: string; [key: string]: unknown }, fetcher: typeof fetch = fetch) {
  const url = process.env.CRM_WEBHOOK_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!url || !secret) throw new Error("Delivery is not configured");
  const target = new URL(url);
  if (target.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && ["127.0.0.1", "localhost"].includes(target.hostname))) throw new Error("Webhook must use HTTPS");
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const response = await fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WeRoof-Timestamp": timestamp,
      "X-WeRoof-Signature": signature,
      "Idempotency-Key": `${payload.id}-${createHash("sha256").update(body).digest("hex").slice(0, 20)}`,
    },
    body,
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("CRM rejected request");
  return payload;
}
