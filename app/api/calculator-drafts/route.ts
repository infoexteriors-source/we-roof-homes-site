import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendCalculatorWebhook } from "@/lib/calculator-leads";
import { rateLimit } from "@/lib/leads";
import { isAllowedFormOrigin } from "@/lib/form-origin";

export const runtime = "nodejs";
const schema = z.object({
  firstName: z.string().trim().min(1).max(80), email: z.email().max(254),
  phone: z.string().max(40).refine((v) => !v || (/^\+?[\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 10 && v.replace(/\D/g, "").length <= 15), "Enter a valid phone number"),
  address: z.string().trim().min(5).max(240), zip: z.string().regex(/^\d{5}$/),
  submissionId: z.string().regex(/^[\w-]{16,80}$/), consent: z.literal(true),
  website: z.string().max(200).default(""), turnstileToken: z.string().max(2048).default(""),
});
const reply = (body: unknown, status: number) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: NextRequest) {
  try {
    if (!isAllowedFormOrigin(request)) return reply({ error: "Please save from the WeRoof website." }, 403);
    if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Use the calculator form." }, 415);
    const body = await request.text();
    if (body.length > 8000) return reply({ error: "Request too large." }, 413);
    let json; try { json = JSON.parse(body); } catch { return reply({ error: "Check your details." }, 400); }
    const parsed = schema.safeParse(json);
    if (!parsed.success || parsed.data.website) return reply({ error: "Check your contact and property details." }, 400);
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0] || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    if (!(await rateLimit(ip))) return reply({ error: "Please wait a few minutes before trying again." }, 429);
    const input = parsed.data;
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!input.turnstileToken) return reply({ error: "Complete the spam-prevention check." }, 400);
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: input.turnstileToken, remoteip: ip }), signal: AbortSignal.timeout(6000) });
      if (!(await verification.json()).success) return reply({ error: "The spam check expired. Please try again." }, 400);
    } else if (process.env.NODE_ENV === "production") return reply({ error: "Online saving is unavailable. You can continue without sending your details yet." }, 503);
    await sendCalculatorWebhook({ id: `${input.submissionId}-draft`, journeyId: input.submissionId, type: "calculator_saved_interest", contact: { firstName: input.firstName, email: input.email.toLowerCase(), phone: input.phone, address: input.address, zip: input.zip }, consent: { projectFollowUp: true, sms: false, version: "2026-10-05" }, sourcePage: "/roof-cost-calculator", status: "Incomplete calculator; no estimate or report requested yet" });
    return reply({ accepted: true }, 200);
  } catch { return reply({ error: "We couldn’t send your details to WeRoof. Continue below without sending, or try again." }, 503); }
}
