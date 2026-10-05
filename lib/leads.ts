import {
  createHmac,
  createHash,
  timingSafeEqual,
  randomUUID,
} from "node:crypto";
import { z } from "zod";
export const leadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional().default(""),
  email: z.email().max(254),
  phone: z
    .string()
    .trim()
    .refine(
      (v) =>
        /^\+?[\d\s().-]+$/.test(v) &&
        v.replace(/\D/g, "").length >= 10 &&
        v.replace(/\D/g, "").length <= 15,
      "Enter a valid phone number",
    ),
  address: z.string().trim().min(5).max(240),
  zip: z.string().regex(/^\d{5}$/, "Enter a five-digit ZIP code"),
  service: z.enum([
    "Roof replacement",
    "Roof repair",
    "Roof inspection",
    "Storm damage",
    "Siding",
    "Gutters",
    "Commercial roofing",
  ]),
  smsConsent: z.boolean().default(false),
  sourcePage: z.string().max(300).default("/"),
  utm_source: z.string().max(300).optional(),
  utm_medium: z.string().max(300).optional(),
  utm_campaign: z.string().max(300).optional(),
  gclid: z.string().max(300).optional(),
  msclkid: z.string().max(300).optional(),
  website: z.string().max(200).optional().default(""),
  turnstileToken: z.string().max(2048).optional().default(""),
  submissionId: z.string().max(80).optional(),
});
export type Lead = z.infer<typeof leadSchema>;
export function signature(body: string, secret: string, timestamp: string) {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
}
export function secureEqual(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
export function normalizeLead(input: Lead) {
  const { website, turnstileToken, submissionId, ...lead } = input;
  void website;
  void turnstileToken;
  const digits = lead.phone.replace(/\D/g, "");
  return {
    ...lead,
    email: lead.email.toLowerCase(),
    phone: digits.length === 10 ? `+1${digits}` : `+${digits}`,
    sourcePage: lead.sourcePage.split("?")[0],
    consent: {
      sms: lead.smsConsent,
      phone: true,
      email: true,
      version: "2026-09-22",
    },
    submittedAt: new Date().toISOString(),
    id:
      submissionId && /^[\w-]{16,80}$/.test(submissionId)
        ? submissionId
        : randomUUID(),
  };
}
const memory = new Map<string, { count: number; until: number }>();
export async function rateLimit(ip: string): Promise<boolean> {
  const key = `weroof:rate:${createHash("sha256").update(ip).digest("hex").slice(0, 24)}`;
  const url = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    const r = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, 600, "NX"],
      ]),
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) throw new Error("Rate service unavailable");
    const data = await r.json();
    if (data[0]?.error || typeof data[0]?.result !== "number")
      throw new Error("Rate service unavailable");
    return data[0].result <= 5;
  }
  if (process.env.NODE_ENV === "production")
    throw new Error("Rate limiting is not configured");
  const now = Date.now();
  for (const [k, v] of memory) if (v.until < now) memory.delete(k);
  const state = memory.get(key) || { count: 0, until: now + 600000 };
  state.count++;
  memory.set(key, state);
  return state.count <= 10;
}
export async function deliverLead(input: Lead, fetcher: typeof fetch = fetch) {
  const url = process.env.CRM_WEBHOOK_URL,
    secret = process.env.CRM_WEBHOOK_SECRET;
  if (!url || !secret) throw new Error("Delivery is not configured");
  const target = new URL(url);
  if (
    target.protocol !== "https:" &&
    !(
      process.env.NODE_ENV !== "production" &&
      ["127.0.0.1", "localhost"].includes(target.hostname)
    )
  )
    throw new Error("Webhook must use HTTPS");
  const lead = normalizeLead(input);
  const body = JSON.stringify(lead),
    timestamp = String(Math.floor(Date.now() / 1000));
  const result = await fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WeRoof-Timestamp": timestamp,
      "X-WeRoof-Signature": signature(body, secret, timestamp),
      "Idempotency-Key": lead.id,
    },
    body,
    signal: AbortSignal.timeout(10000),
    redirect: "error",
  });
  if (!result.ok) throw new Error("CRM rejected request");
  return lead.id;
}
