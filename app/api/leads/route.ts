import { NextRequest, NextResponse } from "next/server";
import { leadSchema, rateLimit, deliverLead } from "@/lib/leads";
import { business } from "@/lib/content";
import { isAllowedFormOrigin } from "@/lib/form-origin";
export const runtime = "nodejs";
function respond(
  status: number,
  error: string,
  json: boolean,
  request: NextRequest,
) {
  if (json) return NextResponse.json({ error }, { status });
  const html = `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Inspection request | WeRoof</title><body style="font:18px/1.6 Arial;padding:40px;max-width:650px;margin:auto"><h1>We couldn’t send your request.</h1><p>${error}</p><p><a href="tel:${business.tel}">Call ${business.phone}</a> or use your browser’s Back button to return to the form.</p><a href="${new URL("/contact", request.url).pathname}">Contact WeRoof</a></body></html>`;
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
export async function POST(request: NextRequest) {
  const json =
    request.headers.get("content-type")?.includes("application/json") || false;
  try {
    if (!isAllowedFormOrigin(request))
      return respond(
        403,
        "Please submit from the WeRoof website.",
        json,
        request,
      );
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 16000)
      return respond(413, "The request is too large.", json, request);
    const text = await request.text();
    if (text.length > 16000)
      return respond(413, "The request is too large.", json, request);
    let raw: Record<string, unknown>;
    try {
      raw = json
        ? JSON.parse(text)
        : Object.fromEntries(new URLSearchParams(text));
    } catch {
      return respond(400, "Please check your form details.", json, request);
    }
    if (!json) raw.smsConsent = raw.smsConsent === "on";
    const parsed = leadSchema.safeParse(raw);
    if (!parsed.success)
      return respond(
        400,
        parsed.error.issues[0]?.message || "Please check the required fields.",
        json,
        request,
      );
    const lead = parsed.data;
    if (lead.website)
      return respond(400, "Unable to accept this request.", json, request);
    const ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "local";
    if (!(await rateLimit(ip)))
      return respond(
        429,
        "Too many attempts. Please wait a few minutes or call us.",
        json,
        request,
      );
    if (json && process.env.TURNSTILE_SECRET_KEY) {
      if (!lead.turnstileToken)
        return respond(
          400,
          "Please complete the spam-prevention check.",
          json,
          request,
        );
      const verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: lead.turnstileToken,
            remoteip: ip,
          }),
          signal: AbortSignal.timeout(6000),
        },
      );
      const result = await verify.json();
      if (!result.success)
        return respond(
          400,
          "The spam-prevention check expired. Please try again.",
          json,
          request,
        );
    } else if (json && process.env.NODE_ENV === "production")
      return respond(
        503,
        "Online requests are temporarily unavailable. Please call us to arrange your free inspection.",
        json,
        request,
      );
    const id = await deliverLead(lead);
    if (!json)
      return NextResponse.redirect(new URL("/thank-you", request.url), 303);
    return NextResponse.json(
      { ok: true, id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    console.error(
      "Lead request could not be delivered; no personal data logged.",
    );
    return respond(
      503,
      "Your request was not delivered. Please retry or call (240) 795-9365.",
      json,
      request,
    );
  }
}
