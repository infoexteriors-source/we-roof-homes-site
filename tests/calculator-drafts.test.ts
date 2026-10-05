import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/calculator-drafts/route";

test("early save needs consent, rejects spam and waits for CRM acceptance", async () => {
  const env = { ...process.env };
  const previousFetch = globalThis.fetch;
  process.env.CRM_WEBHOOK_URL = "https://crm.example.test/leads";
  process.env.CRM_WEBHOOK_SECRET = "test-secret";
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  process.env.UPSTASH_REDIS_REST_URL = "https://rate.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  let accepted = true;
  let calls = 0;
  globalThis.fetch = (async (url, init) => {
    if (String(url).includes("rate.example")) return Response.json([{ result: 1 }, { result: 1 }]);
    if (String(url).includes("turnstile")) return Response.json({ success: true });
    assert.equal(String(url), "https://crm.example.test/leads");
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.type, "calculator_saved_interest");
    assert.equal(payload.consent.sms, false);
    assert.equal(payload.journeyId, "test-journey-123456789");
    calls++;
    return new Response("{}", { status: accepted ? 202 : 503 });
  }) as typeof fetch;
  const body = { firstName: "Alex", email: "alex@example.com", phone: "", address: "123 Example Street, Bethesda", zip: "20814", submissionId: "test-journey-123456789", consent: true, turnstileToken: "test" };
  const req = (data: unknown) => new NextRequest("http://localhost:3000/api/calculator-drafts", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify(data) });
  try {
    assert.equal((await POST(req({ ...body, consent: false }))).status, 400);
    assert.equal((await POST(req({ ...body, website: "bot" }))).status, 400);
    assert.equal(calls, 0);
    assert.equal((await POST(req(body))).status, 200);
    accepted = false;
    assert.equal((await POST(req(body))).status, 503);
  } finally {
    globalThis.fetch = previousFetch;
    for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  }
});
