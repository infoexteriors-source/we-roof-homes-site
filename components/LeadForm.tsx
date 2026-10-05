"use client";
import { useEffect, useRef, useState, useId } from "react";
import Link from "next/link";
import { track } from "./Analytics";
const options = [
  "Roof replacement",
  "Roof repair",
  "Roof inspection",
  "Storm damage",
  "Siding",
  "Gutters",
  "Commercial roofing",
];
const serviceBySlug: Record<string, string> = {
  "roof-replacement": "Roof replacement", "roof-repair": "Roof repair",
  "roof-inspection": "Roof inspection", "storm-damage": "Storm damage",
  "insurance-assistance": "Storm damage", siding: "Siding", gutters: "Gutters",
  "tpo-roofing": "Commercial roofing", "commercial-metal-roofing": "Commercial roofing",
  "commercial-asphalt-roofing": "Commercial roofing", "epdm-roofing": "Commercial roofing",
  "flat-roofing": "Commercial roofing",
  "roof-cost-calculator": "Roof replacement", "siding-cost-calculator": "Siding", "gutter-cost-calculator": "Gutters",
};
export function LeadForm({
  compact = false,
  source = "homepage",
}: {
  compact?: boolean;
  source?: string;
}) {
  const [step, setStep] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [token, setToken] = useState("");
  const [project, setProject] = useState({ zip: "", service: "" });
  const form = useRef<HTMLFormElement>(null),
    widget = useRef<HTMLDivElement>(null),
    widgetId = useRef<string | null>(null);
  const id = useId();
  const started = useRef(false);
  useEffect(() => {
    const f = form.current;
    if (!f) return;
    (f.elements.namedItem("submissionId") as HTMLInputElement).value =
      crypto.randomUUID();
    const p = new URLSearchParams(location.search);
    const requestedService = p.get("service");
    const serviceInput = f.elements.namedItem("service") as HTMLSelectElement;
    if (requestedService && options.includes(requestedService) && !serviceInput.value) serviceInput.value = requestedService;
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "gclid",
      "msclkid",
    ]) {
      const input = f.elements.namedItem(key) as HTMLInputElement;
      if (input) input.value = (p.get(key) || "").slice(0, 300);
    }
    const input = f.elements.namedItem("sourcePage") as HTMLInputElement;
    input.value = location.pathname;
  }, []);
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!key) return;
    let stopped = false;
    const mount = () => {
      if (
        !stopped &&
        widget.current &&
        window.turnstile &&
        widgetId.current === null
      )
        widgetId.current = window.turnstile.render(widget.current, {
          sitekey: key,
          callback: (t: string) => setToken(t),
          "expired-callback": () => setToken(""),
          "error-callback": () => setToken(""),
        });
    };
    if (window.turnstile) mount();
    else {
      let script = document.querySelector<HTMLScriptElement>(
        "script[data-turnstile]",
      );
      if (!script) {
        script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.dataset.turnstile = "true";
        script.async = true;
        document.head.append(script);
      }
      script.addEventListener("load", mount);
    }
    return () => {
      stopped = true;
      if (widgetId.current && window.turnstile)
        window.turnstile.remove(widgetId.current);
    };
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    if (step === 1) {
      const zip = f.elements.namedItem("zip") as HTMLInputElement;
      const service = f.elements.namedItem("service") as HTMLSelectElement;
      if (!zip.reportValidity() || !service.reportValidity()) return;
      setProject({ zip: zip.value, service: service.value });
      setStep(2);
      track("form_step_complete", { step: 1, source });
      setTimeout(
        () => f.querySelector<HTMLInputElement>("[name=firstName]")?.focus(),
        0,
      );
      return;
    }
    if (!f.reportValidity()) return;
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(f));
    try {
      const result = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          smsConsent: data.smsConsent === "on",
          turnstileToken: token,
        }),
      });
      const body = await result.json();
      if (!result.ok)
        throw new Error(
          body.error ||
            "Your request could not be delivered. Please try again.",
        );
      track("generate_lead", { source });
      sessionStorage.setItem("weroof-submitted", "yes");
      location.assign("/thank-you");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Please try again or call us.",
      );
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      setToken("");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`lead-card ${compact ? "compact" : ""}`}>
      <div className="form-heading">
        <span className="form-kicker">LET’S START WITH YOUR HOME</span>
        <h2>
          Free inspection.{" "}
          <br />
          Real answers.
        </h2>
        <p>No pressure. No obligation.</p>
      </div>
      <form
        ref={form}
        method="post"
        action="/api/leads"
        onSubmit={submit}
        onFocus={() => {if(!started.current){track("form_start", { source });started.current=true;}}}
      >
        <div className="step-line">
          <span>YOUR {step === 1 ? "PROJECT" : "DETAILS"}</span>
          <span>STEP {step} OF 2</span>
        </div>
        <div className="form-progress" aria-hidden="true"><span /><span className={step === 2 ? "complete" : ""} /></div>
        <div className={step === 2 ? "step-one collapsed-step" : "step-one"}>
          <label htmlFor={`${id}-zip`}>
            Property ZIP code
            <input
              id={`${id}-zip`}
              name="zip"
              placeholder="e.g. 20905"
              pattern="[0-9]{5}"
              inputMode="numeric"
              autoComplete="postal-code"
              required
              maxLength={5}
            />
          </label>
          <label htmlFor={`${id}-service`}>
            What can we help with?
            <select
              id={`${id}-service`}
              name="service"
              required
              defaultValue={serviceBySlug[source.split("/").pop() || ""] || ""}
            >
              <option value="" disabled>
                Select a service
              </option>
              {options.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
        <div className={`step-two ${step === 1 ? "pending-step" : ""}`}>
          {step === 2 && <p className="project-summary">{project.service} <span aria-hidden="true">·</span> ZIP {project.zip}</p>}
          <div className="form-pair">
            <label htmlFor={`${id}-name`}>
              First name
              <input
                id={`${id}-name`}
                name="firstName"
                autoComplete="given-name"
                required={step === 2}
                maxLength={80}
              />
            </label>
            <label htmlFor={`${id}-last`}>
              Last name (optional)
              <input
                id={`${id}-last`}
                name="lastName"
                autoComplete="family-name"
                maxLength={80}
              />
            </label>
          </div>
          <label htmlFor={`${id}-phone`}>
            Phone
            <input
              id={`${id}-phone`}
              name="phone"
              type="tel"
              autoComplete="tel"
              required={step === 2}
            />
          </label>
          <label htmlFor={`${id}-email`}>
            Email
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              required={step === 2}
            />
          </label>
          <label htmlFor={`${id}-address`}>
            Property address
            <input
              id={`${id}-address`}
              name="address"
              autoComplete="street-address"
              required={step === 2}
              maxLength={240}
            />
          </label>
          <label className="check">
            <input type="checkbox" name="smsConsent" />{" "}
            <span>
              Text me about my request (optional). Message frequency varies. Message and
              data rates may apply. Reply STOP to opt out or HELP for help.
              Consent is not a condition of purchase.
            </span>
          </label>
          <p className="form-legal">
            By submitting, you request phone and email contact about your
            project. Read our <Link href="/privacy-policy">Privacy Policy</Link>{" "}
            and <Link href="/terms">Terms</Link>.
          </p>
          <div ref={widget} />
          <input type="hidden" name="turnstileToken" value={token} />
        </div>
        <div className="honeypot" aria-hidden="true">
          <label>
            Leave this blank
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {["utm_source", "utm_medium", "utm_campaign", "gclid", "msclkid"].map(
          (k) => (
            <input key={k} type="hidden" name={k} />
          ),
        )}
        <input type="hidden" name="sourcePage" defaultValue={source} />
        <input type="hidden" name="submissionId" defaultValue="" />
        <p role="alert" className="form-error">
          {error}
        </p>
        <button className="button form-submit" type="submit" disabled={busy}>
          {busy
            ? "Sending your request…"
            : step === 1
              ? "Continue to contact details"
              : "Request My Inspection & Estimate"}
        </button>
        {step === 2 && (
          <button
            type="button"
            className="form-back"
            onClick={() => { setStep(1); setTimeout(() => form.current?.querySelector<HTMLInputElement>("[name=zip]")?.focus(), 0); }}
          >
            Back to project
          </button>
        )}
        <p className="secure-note">
          <span aria-hidden="true">⌑</span> Your information stays private.
        </p>
        <noscript>
          <style>{`.pending-step{display:block!important}.step-line{display:none}`}</style>
          <p>
            Complete all fields above and submit to request your inspection.
          </p>
        </noscript>
      </form>
    </div>
  );
}
