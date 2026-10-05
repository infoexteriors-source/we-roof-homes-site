import { NextRequest, NextResponse } from "next/server";
import { calculatorLeadSchema, deliverCalculatorLead } from "@/lib/calculator-leads";
import { emailCalculatorReport } from "@/lib/calculator-email";
import { rateLimit } from "@/lib/leads";
import { isAllowedFormOrigin } from "@/lib/form-origin";

export const runtime = "nodejs";

function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedFormOrigin(request)) return fail(403, "Please submit from the WeRoof website.");
    if (!request.headers.get("content-type")?.includes("application/json")) return fail(415, "Please use the calculator form.");
    if (Number(request.headers.get("content-length") || 0) > 16000) return fail(413, "The request is too large.");
    const text = await request.text();
    if (text.length > 16000) return fail(413, "The request is too large.");
    let raw: unknown;
    try { raw = JSON.parse(text); } catch { return fail(400, "Please check your details."); }
    const parsed = calculatorLeadSchema.safeParse(raw);
    if (!parsed.success) return fail(400, parsed.error.issues[0]?.message || "Please check the required fields.");
    if (parsed.data.website) return fail(400, "Unable to accept this request.");
    const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0] || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    if (!(await rateLimit(ip))) return fail(429, "Too many attempts. Please wait a few minutes or call us.");
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!parsed.data.turnstileToken) return fail(400, "Please complete the spam-prevention check.");
      const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: parsed.data.turnstileToken, remoteip: ip }),
        signal: AbortSignal.timeout(6000),
      });
      const result = await verify.json();
      if (!result.success) return fail(400, "The spam-prevention check expired. Please try again.");
    } else if (process.env.NODE_ENV === "production") return fail(503, "Online requests are temporarily unavailable. Please call us about your project.");
    const result = await deliverCalculatorLead(parsed.data);
    try { await emailCalculatorReport(parsed.data, result.id); }
    catch { return NextResponse.json({ error: "WeRoof received your request, but your PDF email was not accepted. Retry below or call (240) 795-9365. Your inspection request, if selected, is not a booked appointment.", leadAccepted: true, emailAccepted: false }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
    return NextResponse.json({ ok: true, id: result.id, estimate: result.planningRange, emailAccepted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Calculator request could not be delivered; no personal data logged.");
    return fail(503, "Your report could not be emailed. Your details are still here; please try again or call (240) 795-9365.");
  }
}
