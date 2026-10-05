import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/calculator-leads/route";

test("calculator API returns success only after CRM and PDF email acceptance", async () => {
  const env = { ...process.env };
  const originalFetch = globalThis.fetch;
  let crmAccepted = true;
  let emailAccepted = true;
  let emailCalls = 0;
  process.env.CRM_WEBHOOK_URL = "https://crm.example.test/leads";
  process.env.CRM_WEBHOOK_SECRET = "test-only-secret";
  process.env.TURNSTILE_SECRET_KEY = "test-only-key";
  process.env.UPSTASH_REDIS_REST_URL = "https://rate.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-only-token";
  process.env.RESEND_API_KEY = "test-key";
  process.env.ESTIMATE_EMAIL_FROM = "WeRoof <estimates@example.com>";
  globalThis.fetch = (async (url, init) => {
    const target = String(url);
    if (target.includes("rate.example")) return Response.json([{ result: 1 }, { result: 1 }]);
    if (target.includes("turnstile")) return Response.json({ success: true });
    if (target.includes("crm.example")) {
      const payload = JSON.parse(String(init?.body));
      assert.equal(payload.planningRange.draft, true);
      assert.equal(payload.calculation.service, "siding");
      return new Response("{}", { status: crmAccepted ? 202 : 500 });
    }
    if (target.includes("resend.com")) {
      emailCalls++;
      const payload = JSON.parse(String(init?.body));
      assert.equal(payload.to[0], "alex@example.com");
      assert.equal(Buffer.from(payload.attachments[0].content, "base64").subarray(0, 5).toString(), "%PDF-");
      return new Response("{}", { status: emailAccepted ? 200 : 503 });
    }
    throw new Error("Unexpected destination");
  }) as typeof fetch;
  const valid = {
    firstName: "Alex", email: "alex@example.com", address: "123 Example Street, Bethesda", zip: "20814",
    calculation: { service: "siding", size: "1750-2500", stories: 2, material: "vinyl", trim: false, shutters: false },
    turnstileToken: "test-token", submissionId: "test-request-123456789", submittedAt: "2026-10-05T12:00:00.000Z",
  };
  const request = (body: unknown) => new NextRequest("http://localhost:3001/api/calculator-leads", {
    method: "POST", headers: { origin: "http://localhost:3001", "content-type": "application/json" }, body: JSON.stringify(body),
  });
  try {
    const success = await POST(request(valid));
    assert.equal(success.status, 200);
    assert.equal((await success.json()).emailAccepted, true);
    emailAccepted = false;
    const partial = await POST(request(valid));
    assert.equal(partial.status, 503);
    assert.equal((await partial.json()).leadAccepted, true);
    crmAccepted = false;
    const before = emailCalls;
    assert.equal((await POST(request(valid))).status, 503);
    assert.equal(emailCalls, before);
    assert.equal((await POST(request({ ...valid, website: "bot" }))).status, 400);
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  }
});
