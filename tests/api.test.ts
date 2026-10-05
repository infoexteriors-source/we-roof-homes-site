import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/leads/route";

test("lead API validates, blocks spam, verifies challenge, and confirms delivery", async () => {
  const env = { ...process.env };
  const originalFetch = globalThis.fetch;
  let accepted = true,
    challenge = true,
    count = 1,
    deliveries = 0;
  process.env.CRM_WEBHOOK_URL = "https://crm.example.test/leads";
  process.env.CRM_WEBHOOK_SECRET = "test-only-secret";
  process.env.TURNSTILE_SECRET_KEY = "test-only-key";
  process.env.UPSTASH_REDIS_REST_URL = "https://rate.example.test";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-only-token";
  globalThis.fetch = (async (url, init) => {
    if (String(url).includes("rate.example"))
      return Response.json([{ result: count }, { result: 1 }]);
    if (String(url).includes("turnstile"))
      return Response.json({ success: challenge });
    deliveries++;
    const body = JSON.parse(String(init?.body));
    assert.equal(body.consent.sms, false);
    assert.equal(body.utm_source, "test");
    assert.ok((init?.headers as Record<string, string>)["X-WeRoof-Signature"]);
    return new Response("{}", { status: accepted ? 202 : 500 });
  }) as typeof fetch;
  const valid = {
    firstName: "Preview",
    email: "preview@example.test",
    phone: "2405550100",
    address: "10 Example Street",
    zip: "20905",
    service: "Roof inspection",
    smsConsent: false,
    utm_source: "test",
    turnstileToken: "test-token",
  };
  const request = (
    body: unknown,
    origin = "http://localhost:3001",
    html = false,
  ) =>
    new NextRequest("http://localhost:3001/api/leads", {
      method: "POST",
      headers: {
        origin,
        "content-type": html
          ? "application/x-www-form-urlencoded"
          : "application/json",
      },
      body: html
        ? new URLSearchParams(body as Record<string, string>)
        : JSON.stringify(body),
    });
  try {
    assert.equal((await POST(request(valid))).status, 200);
    accepted = false;
    assert.equal((await POST(request(valid))).status, 503);
    const before = deliveries;
    assert.equal(
      (await POST(request({ ...valid, website: "bot" }))).status,
      400,
    );
    assert.equal((await POST(request({ ...valid, email: "bad" }))).status, 400);
    assert.equal(
      (await POST(request(valid, "https://other.example.test"))).status,
      403,
    );
    challenge = false;
    assert.equal((await POST(request(valid))).status, 400);
    count = 6;
    assert.equal((await POST(request(valid))).status, 429);
    assert.equal(deliveries, before);
    count = 1;
    accepted = true;
    const native = await POST(
      request({ ...valid, smsConsent: "" }, undefined, true),
    );
    assert.equal(native.status, 303);
    assert.equal(
      new URL(native.headers.get("location")!).pathname,
      "/thank-you",
    );
    accepted = false;
    const nativeFailure = await POST(
      request({ ...valid, smsConsent: "" }, undefined, true),
    );
    assert.equal(nativeFailure.status, 503);
    assert.match(nativeFailure.headers.get("content-type")!, /text\/html/);
    assert.ok(!(await nativeFailure.text()).includes(valid.email));
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env))
      if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  }
});
