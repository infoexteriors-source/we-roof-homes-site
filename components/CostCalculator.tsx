"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { track } from "./Analytics";
import {
  estimateGutters, estimateRoof, estimateSiding, formatUsd, gutterRates, homeSizes, pitches, ratesAreDraft,
  roofRates, roofShapes, sidingRates, type HomeSize, type Pitch, type RoofShape, type Stories,
} from "@/lib/estimator";
import type { CalculatorLead } from "@/lib/calculator-leads";
import { RoofPropertyView } from "./RoofPropertyView";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { validRoofProperty, type RoofProperty } from "@/lib/roof-view";
import { initialProject, projectChoices, projectSchema, materialNotes, type CalculatorProject } from "@/lib/calculator-project";

export type CalculatorService = "roof" | "siding" | "gutters";

type Choice = { value: string; label: string; note?: string; icon?: React.ReactNode };

function HouseIcon({ stories = 1, width = 48, garage = 0 }: { stories?: number; width?: number; garage?: number }) {
  const x = (120 - width - garage) / 2;
  const top = 76 - stories * 20;
  const center = x + width / 2;
  return <svg className="calc-house" viewBox="0 0 120 88" aria-hidden="true" focusable="false">
    <path className="calc-house-ground" d="M5 77h110" />
    {garage > 0 && <g>
      <path className="calc-house-body" d={`M${x + width} 54h${garage}v22h-${garage}z`} />
      <path className="calc-house-roof" d={`M${x + width} 42l${garage + 4} 12h-${garage + 4}`} />
      <path d={`M${x + width + 5} 76V60h${garage - 10}v16M${x + width + 5} 66h${garage - 10}M${x + width + 5} 71h${garage - 10}`} />
      {garage > 30 && <path d={`M${x + width + garage / 2} 60v16`} />}
    </g>}
    <path className="calc-house-body" d={`M${x} ${top}h${width}V76H${x}z`} />
    <path className="calc-house-roof" d={`M${x - 4} ${top} ${center} ${top - 13} ${x + width + 4} ${top}Z`} />
    <path className="calc-house-door" d={`M${center - 4} 76V63h8v13`} />
    {width > 34 && <path d={`M${x + 6} 62h6v7h-6zM${x + width - 12} 62h6v7h-6z`} />}
    {Array.from({ length: stories - 1 }, (_, floor) => {
      const y = 42 - floor * 20;
      return <g key={floor}>
        <path d={`M${x} ${y + 13}h${width}`} opacity=".35" />
        <path d={`M${x + 6} ${y}h7v8h-7zM${x + width - 13} ${y}h7v8h-7z`} />
      </g>;
    })}
  </svg>;
}

function HomeSizeIcon({ level }: { level: number }) {
  return <HouseIcon stories={level >= 2 ? 2 : 1} width={[30, 44, 52, 48, 58][level]} garage={level >= 3 ? (level === 4 ? 38 : 26) : 0} />;
}

const shapeIcon: Record<RoofShape, React.ReactNode> = {
  gable: <svg viewBox="0 0 64 40" aria-hidden="true"><path d="M6 34 32 8l26 26" /><path d="M12 34V28M52 34V28" /></svg>,
  hip: <svg viewBox="0 0 64 40" aria-hidden="true"><path d="M4 34 20 12h24l16 22Z" /><path d="M20 12l-4 22M44 12l4 22" /></svg>,
  complex: <svg viewBox="0 0 64 40" aria-hidden="true"><path d="M4 34 22 12l10 10 10-14 18 26" /><path d="M24 24h8v10h-8z" /></svg>,
};

const sizeChoices: Choice[] = Object.entries(homeSizes).map(([value, s], level) => ({ value, label: s.label, note: "Finished living space", icon: <HomeSizeIcon level={level} /> }));
const storyChoices: Choice[] = [
  { value: "1", label: "1 story", note: "Rancher or single level", icon: <HouseIcon stories={1} width={64} /> },
  { value: "2", label: "2 stories", note: "Most colonials and split-levels", icon: <HouseIcon stories={2} width={48} /> },
  { value: "3", label: "3 stories", note: "Includes tall townhomes", icon: <HouseIcon stories={3} width={40} /> },
];
const shapeChoices: Choice[] = Object.entries(roofShapes).map(([value, s]) => ({ value, label: s.label, note: s.note, icon: shapeIcon[value as RoofShape] }));
const pitchChoices: Choice[] = Object.entries(pitches).map(([value, p]) => ({ value, label: p.label, note: p.note }));

type Step = { key: string; title: string; choices: Choice[]; multi?: boolean };

const flows: Record<CalculatorService, Step[]> = {
  roof: [
    { key: "size", title: "How big is your home?", choices: sizeChoices },
    { key: "stories", title: "How many stories?", choices: storyChoices },
    { key: "shape", title: "Which roof shape is closest?", choices: shapeChoices },
    { key: "pitch", title: "How steep is the roof?", choices: pitchChoices },
    { key: "material", title: "Which roofing material?", choices: Object.entries(roofRates.materials).map(([value, m]) => ({ value, label: m.label })) },
  ],
  siding: [
    { key: "size", title: "How big is your home?", choices: sizeChoices },
    { key: "stories", title: "How many stories?", choices: storyChoices },
    { key: "material", title: "Which siding material?", choices: Object.entries(sidingRates.materials).map(([value, m]) => ({ value, label: m.label })) },
    { key: "extras", title: "Any upgrades?", multi: true, choices: [
      { value: "trim", label: sidingRates.upgrades.trim.label, note: "Low-maintenance aluminum or PVC" },
      { value: "shutters", label: sidingRates.upgrades.shutters.label },
    ] },
  ],
  gutters: [
    { key: "size", title: "How big is your home?", choices: sizeChoices },
    { key: "stories", title: "How many stories?", choices: storyChoices },
    { key: "shape", title: "Which roof shape is closest?", choices: shapeChoices },
    { key: "gutter", title: "Which gutter size?", choices: Object.entries(gutterRates.sizes).map(([value, g]) => ({ value, label: g.label, note: value === "6in" ? "More capacity for large or steep roofs" : "Standard for most homes" })) },
    { key: "extras", title: "Anything else?", multi: true, choices: [
      { value: "guards", label: gutterRates.guards.label, note: "Keeps leaves and debris out" },
      { value: "removeOld", label: "Remove and haul away old gutters" },
    ] },
  ],
};

const included: Record<CalculatorService, string[]> = {
  roof: ["Tear-off of one existing layer and disposal", "Underlayment, ice & water barrier and drip edge", "New shingles or panels, flashing and ridge ventilation", "Site cleanup and final walkthrough"],
  siding: ["Removal and disposal of existing siding", "House wrap and flashing at windows and doors", "New siding with corners, J-channel and starter", "Site cleanup and final walkthrough"],
  gutters: ["Seamless gutters formed on site", "Downspouts, elbows and hidden hangers", "Sealed end caps and outlets", "Downspout discharge away from the foundation"],
};

export const calculatorPaths: Record<CalculatorService, string> = { roof: "/roof-cost-calculator", siding: "/siding-cost-calculator", gutters: "/gutter-cost-calculator" };

const serviceName: Record<CalculatorService, string> = { roof: "roof replacement", siding: "siding replacement", gutters: "gutter installation" };

export function CostCalculator({ service }: { service: CalculatorService }) {
  const steps = flows[service];
  const firstIndex = service === "roof" ? -3 : -1;
  const [index, setIndex] = useState(firstIndex);
  const [project, setProject] = useState<CalculatorProject>(initialProject);
  const [livingSqft, setLivingSqft] = useState("");
  const [saveDraft, setSaveDraft] = useState(false);
  const [draftNotice, setDraftNotice] = useState("");
  const [restored, setRestored] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const initialFocus = useRef(true);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({ extras: [] });
  const [contact, setContact] = useState({ firstName: "", email: "", zip: "", phone: "", address: "" });
  const [previewProperty, setPreviewProperty] = useState<RoofProperty | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const id = useId();
  const done = index >= steps.length;
  const step = steps[Math.max(0, Math.min(index, steps.length - 1))];
  const propertyReady = !!previewProperty && previewProperty.address === contact.address && previewProperty.zip === contact.zip;
  const totalSteps = steps.length - firstIndex + 1;
  const stepNumber = index - firstIndex + 1;
  const draftKey = `weroof-calculator-v2-${service}`;

  const estimate = useMemo(() => {
    if (!done) return null;
    const size = answers.size as HomeSize;
    const stories = Number(answers.stories) as Stories;
    const extras = answers.extras as string[];
    if (service === "roof") return estimateRoof({ size, stories, shape: answers.shape === "unknown" ? "gable" : answers.shape as RoofShape, pitch: answers.pitch === "unknown" ? "moderate" : answers.pitch as Pitch, material: answers.material as keyof typeof roofRates.materials, livingSqft: livingSqft ? Number(livingSqft) : undefined });
    if (service === "siding") return estimateSiding({ size, stories, material: answers.material as keyof typeof sidingRates.materials, trim: extras.includes("trim"), shutters: extras.includes("shutters") });
    return estimateGutters({ size, stories, shape: answers.shape as RoofShape, gutter: answers.gutter as keyof typeof gutterRates.sizes, guards: extras.includes("guards"), removeOld: extras.includes("removeOld") });
  }, [done, answers, service, livingSqft]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        const p = projectSchema.safeParse(draft.project);
        const answersValid = draft.answers && steps.every((s) => draft.answers[s.key] === undefined || (Array.isArray(draft.answers[s.key]) ? draft.answers[s.key].every((v: string) => s.choices.some((c) => c.value === v)) : s.choices.some((c) => c.value === draft.answers[s.key]) || (["shape", "pitch"].includes(s.key) && draft.answers[s.key] === "unknown")));
        const c = draft.contact;
        if (draft.version === 2 && Date.now() - draft.savedAt < 86400000 && p.success && answersValid && c && ["firstName", "email", "phone", "address", "zip"].every((key) => typeof c[key] === "string" && c[key].length <= 254)) {
          setContact(c); setProject(p.data); setAnswers({ extras: [], ...draft.answers });
          setLivingSqft(typeof draft.livingSqft === "string" && /^\d{0,5}$/.test(draft.livingSqft) ? draft.livingSqft : "");
          // Resume at property confirmation, retaining answers without trusting a stored step index.
          setIndex(firstIndex); setSaveDraft(true); setDraftNotice("Your saved details are restored. Confirm your property to continue.");
        } else sessionStorage.removeItem(draftKey);
      }
    } catch { setDraftNotice("Private browsing may prevent saved progress. You can still complete the form."); }
    setRestored(true);
    track("calculator_start", { service });
  }, [draftKey, firstIndex, service, steps]);

  useEffect(() => {
    if (!restored || !saveDraft || sent) return;
    try { sessionStorage.setItem(draftKey, JSON.stringify({ version: 2, savedAt: Date.now(), contact, project, answers, livingSqft })); }
    catch { setDraftNotice("Progress could not be saved in this browser. Keep this tab open."); }
  }, [restored, saveDraft, sent, draftKey, contact, project, answers, livingSqft]);

  useEffect(() => {
    if (initialFocus.current) { initialFocus.current = false; return; }
    panel.current?.focus({ preventScroll: true });
    panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
    track("calculator_step_view", { service, step: index - firstIndex + 1 });
  }, [index, firstIndex, service]);

  useEffect(() => {
    setSubmissionId(crypto.randomUUID());
    setSubmittedAt(new Date().toISOString());
    const params = new URLSearchParams(location.search);
    setAttribution(Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "gclid", "msclkid"].map((key) => [key, (params.get(key) || "").slice(0, 300)])));
  }, []);
  useEffect(() => {
    if ((!done && !(service === "roof" && index === -2)) || sent || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return;
    let stopped = false;
    const mount = () => {
      if (!stopped && widget.current && window.turnstile && !widgetId.current) widgetId.current = window.turnstile.render(widget.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
        callback: (value: string) => setToken(value),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
      });
    };
    if (window.turnstile) mount();
    else {
      let script = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
      if (!script) { script = document.createElement("script"); script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; script.dataset.turnstile = "true"; script.async = true; document.head.append(script); }
      script.addEventListener("load", mount);
      return () => { stopped = true; script?.removeEventListener("load", mount); if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); widgetId.current = null; };
    }
    return () => { stopped = true; if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current); widgetId.current = null; };
  }, [done, sent, index, service]);

  async function sendEarlyDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const website = (event.currentTarget.elements.namedItem("website") as HTMLInputElement).value;
    try {
      const response = await fetch("/api/calculator-drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...contact, website, submissionId, consent: true, turnstileToken: token }) });
      const result = await response.json();
      if (!response.ok || !result.accepted) throw new Error(result.error || "Unable to save your request.");
      setDraftNotice("WeRoof received your contact details. Complete the questions to request your PDF.");
      track("calculator_contact_saved", { service }); advance();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to send your details. You can still continue below."); }
    finally { setBusy(false); if (widgetId.current) window.turnstile?.reset(widgetId.current); setToken(""); }
  }

  const choose = (value: string) => {
    if (step.multi) {
      const current = (answers[step.key] as string[]) || [];
      setAnswers({ ...answers, [step.key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
      return;
    }
    const next = { ...answers, [step.key]: value };
    setAnswers(next);
  };
  const advance = () => { track("calculator_step_complete", { service, step: stepNumber }); setIndex((current) => current + 1); if (index + 1 === steps.length) track("calculator_complete", { service }); };
  const restart = () => { try { sessionStorage.removeItem(draftKey); } catch {} setSaveDraft(false); setDraftNotice(""); setContact({ firstName: "", email: "", zip: "", phone: "", address: "" }); setProject(initialProject); setLivingSqft(""); setAnswers({ extras: [] }); setIndex(firstIndex); setPreviewProperty(null); setSent(false); setError(""); setSubmissionId(crypto.randomUUID()); setSubmittedAt(new Date().toISOString()); };
  const summary = steps.map((s) => {
    const value = answers[s.key];
    if (Array.isArray(value)) return value.length ? s.choices.filter((c) => value.includes(c.value)).map((c) => c.label).join(", ") : null;
    return value === "unknown" ? `${s.key}: not sure (assumption used)` : s.choices.find((c) => c.value === value)?.label;
  }).filter(Boolean);

  async function submitReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!estimate || busy) return;
    setBusy(true); setError("");
    const extras = (answers.extras as string[]) || [];
    const base = { service, size: answers.size as HomeSize, stories: Number(answers.stories) as Stories };
    const calculation: CalculatorLead["calculation"] = service === "roof"
      ? { ...base, service: "roof", shape: answers.shape === "unknown" ? "gable" : answers.shape as RoofShape, pitch: answers.pitch === "unknown" ? "moderate" : answers.pitch as Pitch, material: answers.material as keyof typeof roofRates.materials, livingSqft: livingSqft ? Number(livingSqft) : undefined }
      : service === "siding"
        ? { ...base, service: "siding", material: answers.material as keyof typeof sidingRates.materials, trim: extras.includes("trim"), shutters: extras.includes("shutters") }
        : { ...base, service: "gutters", shape: answers.shape as RoofShape, gutter: answers.gutter as keyof typeof gutterRates.sizes, guards: extras.includes("guards"), removeOld: extras.includes("removeOld") };
    try {
      const form = event.currentTarget;
      const honeypot = (form.elements.namedItem("website") as HTMLInputElement).value;
      const response = await fetch("/api/calculator-leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, calculation, ...(service === "roof" ? { project: { ...project, unknowns: ["shape", "pitch"].filter((key) => answers[key] === "unknown") } } : {}), website: honeypot, turnstileToken: token, submissionId, submittedAt, ...attribution }),
      });
      const result = await response.json();
      if (!response.ok || !result.emailAccepted) throw new Error(result.error || "Your report could not be emailed. Please try again.");
      setSent(true);
      try { sessionStorage.removeItem(draftKey); } catch {}
      track("generate_lead", { source: calculatorPaths[service], service });
      track("calculator_report_requested", { service });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your report could not be emailed. Please try again.");
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      setToken("");
    } finally { setBusy(false); }
  }

  return (
    <div className="calc" data-service={service} ref={panel} tabIndex={-1} aria-label={`${service} estimate builder, step ${stepNumber} of ${totalSteps}`}>
      <div className="calc-toolbar"><span>{service === "roof" ? "Roofing" : service === "siding" ? "Siding" : "Gutter"} estimate builder</span><span className="calc-report-tag">Free PDF report</span></div>
      <div className="calc-progress" aria-hidden="true"><span style={{ width: `${sent ? 100 : ((stepNumber - 1) / totalSteps) * 100}%` }} /></div>
      <p className="calc-count" aria-live="polite">{sent ? "Report requested" : `Step ${stepNumber} of ${totalSteps} · ${index === firstIndex ? "Your property" : index < 0 ? "Your project" : done ? "Review & send" : "Roof details"}`}</p>
      {draftNotice && <p className="calc-fine" role="status">{draftNotice}</p>}
      {saveDraft && <button type="button" className="calc-back" onClick={restart}>Clear saved details & start over</button>}
      <noscript><p>JavaScript is needed for this calculator. Call <a href="tel:+12407959365">(240) 795-9365</a> for a free estimate.</p></noscript>
      {index === firstIndex ? (
        <div className="calc-capture">
          <h2>Where’s your home?</h2>
          <p className="calc-capture-intro">Start with your Maryland address so you can find your home on Google Maps. We’ll include a link to your property view in your report.</p>
          <form className="calc-contact-form" onSubmit={(event) => { event.preventDefault(); if (validRoofProperty(contact)) setPreviewProperty({ address: contact.address, zip: contact.zip }); }}>
            <AddressAutocomplete onSelect={(property) => { setContact((previous) => ({ ...previous, ...property })); setPreviewProperty(null); setProject((previous) => ({ ...previous, propertyConfirmed: false })); }} />
            <label>Street address and city <input required minLength={5} maxLength={240} autoComplete="street-address" placeholder="123 Main St, Bethesda" value={contact.address} onChange={(event) => { setContact({ ...contact, address: event.target.value }); setProject({ ...project, propertyConfirmed: false }); }} /></label>
            <label>Property ZIP <input required inputMode="numeric" autoComplete="postal-code" maxLength={5} pattern="[0-9]{5}" placeholder="20814" value={contact.zip} onChange={(event) => { setContact({ ...contact, zip: event.target.value }); setProject({ ...project, propertyConfirmed: false }); }} /></label>
            <p className="calc-fine">Previewing the map shares this address with Google to locate your home. It does not measure your roof or verify its condition.</p>
            {!propertyReady && <button className="button" type="submit">Preview my property ↗</button>}
            {propertyReady && previewProperty && <>
              <RoofPropertyView property={previewProperty} />
              <label className="calc-check"><input type="checkbox" checked={project.propertyConfirmed} onChange={(event) => setProject({ ...project, propertyConfirmed: event.target.checked })} />This is my project address. I understand the image does not measure my roof.</label>
              <p className="calc-fine">Maryland only, approximately one hour from downtown Bethesda. We confirm exact service eligibility before scheduling.</p>
              <button className="button" type="button" disabled={!project.propertyConfirmed} onClick={advance}>Continue ↗</button>
            </>}
          </form>
        </div>
      ) : service === "roof" && index === -2 ? (
        <div className="calc-capture">
          <h2>Make this estimate yours.</h2>
          <p className="calc-capture-intro">Tell us where to send your report. Nothing is emailed until you review and submit.</p>
          <form className="calc-contact-form" onSubmit={sendEarlyDetails}>
            <div className="calc-field-row">
              <label>First name<input required autoComplete="given-name" maxLength={80} value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} /></label>
              <label>Phone (optional)<input type="tel" autoComplete="tel" maxLength={40} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></label>
            </div>
            <label>Email for your PDF<input required type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label>
            <label className="calc-check"><input type="checkbox" checked={saveDraft} onChange={(e) => { setSaveDraft(e.target.checked); if (!e.target.checked) { try { sessionStorage.removeItem(draftKey); } catch {} } }} />Save my progress in this browser tab for up to 24 hours. Avoid this on shared devices.</label>
            <p className="calc-fine">“Send details & continue” shares your details with WeRoof now for project follow-up, even if you don’t finish. It does not request an email report yet. No SMS or marketing signup. Browser saving is separate and ends when this tab closes. <Link href="/privacy-policy">Privacy policy</Link>.</p>
            <div className="calc-honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            <div ref={widget} className="calc-turnstile" />
            {error && <p className="calc-error" role="alert">{error}</p>}
            <div className="calc-nav"><button type="button" className="calc-back" onClick={() => { setError(""); setIndex(firstIndex); }}>Back</button><button className="button" type="submit" disabled={busy}>{busy ? "Sending…" : "Send details & continue ↗"}</button><button type="button" className="calc-back" disabled={busy} onClick={() => { setError(""); advance(); }}>Continue without sending yet</button></div>
          </form>
        </div>
      ) : service === "roof" && index === -1 ? (
        <div className="calc-capture">
          <h2>What brings you here?</h2>
          <p className="calc-capture-intro">A few details help us prepare useful recommendations. “Not sure” is a good answer.</p>
          <form className="calc-contact-form" onSubmit={(event) => { event.preventDefault(); advance(); }}>
            <div className="calc-field-row">
              {([['need', 'What do you need?'], ['timeline', 'When are you hoping to start?'], ['role', 'Your connection to the property'], ['age', 'About how old is the roof?']] as const).map(([key, label]) => <label key={key}>{label}<select value={project[key]} onChange={(e) => setProject({ ...project, [key]: e.target.value })}>{projectChoices[key].map((value) => <option key={value}>{value}</option>)}</select></label>)}
            </div>
            {(project.need === "Repair or active leak" || project.need === "Storm damage") && <p className="calc-notice">This tool estimates full replacement, not repair costs. For a leak or urgent damage, <a href="tel:+12407959365">call (240) 795-9365</a>. Do not climb onto your roof.</p>}
            <fieldset className="calc-check-group"><legend>Any additional roof areas to discuss? (optional)</legend>{["Attached garage", "Detached garage", "Porch / addition"].map((value) => <label className="calc-check" key={value}><input type="checkbox" checked={project.structures.includes(value as CalculatorProject['structures'][number])} onChange={(e) => setProject({ ...project, structures: e.target.checked ? [...project.structures, value as CalculatorProject['structures'][number]] : project.structures.filter((v) => v !== value) })} />{value}</label>)}</fieldset>
            <p className="calc-fine">Additional structures are recorded for inspection, not included in the main-home planning range.</p>
            <div className="calc-nav"><button type="button" className="calc-back" onClick={() => setIndex(-2)}>Back</button><button className="button" type="submit">Continue to roof details ↗</button></div>
          </form>
        </div>
      ) : !done ? (
        <fieldset className="calc-step" key={step.key}>
          <legend>
            {step.title}
          </legend>
          <p className="calc-step-hint">{step.key === "size" ? "Choose approximate above-ground living space, excluding basements and garages." : step.key === "pitch" ? "Judge from the ground only. Do not climb onto your roof." : step.multi ? "Choose any that apply, or continue without upgrades." : "Select the option that best matches your home."}</p>
          <div className={`calc-options ${step.choices.some((c) => c.icon) ? "calc-options-icons" : ""}`}>
            {step.choices.map((choice) => {
              const selected = step.multi ? ((answers[step.key] as string[]) || []).includes(choice.value) : answers[step.key] === choice.value;
              return (
                <label key={choice.value} className={`calc-option ${selected ? "is-selected" : ""}`}>
                  <input
                    type={step.multi ? "checkbox" : "radio"}
                    name={`${id}-${step.key}`}
                    value={choice.value}
                    checked={selected}
                    onChange={() => choose(choice.value)}
                  />
                  {choice.icon}
                  <span className="calc-selection-mark" aria-hidden="true">{selected ? "✓" : ""}</span>
                  <span className="calc-option-label">{choice.label}</span>
                  {(choice.note || (service === "roof" && step.key === "material")) && <span className="calc-option-note">{choice.note || materialNotes[choice.value as keyof typeof materialNotes]}</span>}
                </label>
              );
            })}
          </div>
          {service === "roof" && ["shape", "pitch"].includes(step.key) && <label className="calc-check"><input type="radio" name={`${id}-${step.key}`} checked={answers[step.key] === "unknown"} onChange={() => choose("unknown")} />Not sure. Use a clearly labeled planning assumption.</label>}
          {service === "roof" && step.key === "size" && <label className="calc-exact-size">Know your above-ground square footage? (optional)<input type="number" min={300} max={20000} inputMode="numeric" value={livingSqft} onChange={(e) => setLivingSqft(e.target.value)} placeholder="e.g. 4250" /><small>Otherwise we use a representative size within your selected band; 3,500+ uses 4,000 sq ft.</small></label>}
          <div className="calc-nav">
            <button type="button" className="calc-back" onClick={() => setIndex(index - 1)}>Back</button>
            <button type="button" className="button" disabled={(!step.multi && !answers[step.key]) || (step.key === "size" && !!livingSqft && (!Number.isFinite(Number(livingSqft)) || Number(livingSqft) < 300 || Number(livingSqft) > 20000))} onClick={advance}>{index + 1 === steps.length ? "Review my report" : "Continue"}</button>
          </div>
        </fieldset>
      ) : sent && estimate ? (
        <div className="calc-result" aria-live="polite">
          <p className="eyebrow">Your report is on its way</p>
          <h2>Check your inbox, {contact.firstName}.</h2>
          <p>We accepted your report for delivery to <strong>{contact.email}</strong>. Check spam if it does not arrive shortly.</p>
          <p className="eyebrow">Your {serviceName[service]} planning range</p>
          <p className="calc-range">{formatUsd(estimate.low)} <span>to</span> {formatUsd(estimate.high)}</p>
          <p className="calc-basis">Based on about {estimate.quantity.toLocaleString("en-US")} {estimate.unit}: {summary.join(" · ")}.</p>
          <div className="calc-included">
            <p className="eyebrow">Typically included</p>
            <ul>{included[service].map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <p className="calc-fine">
            This is a planning range, not a quote. Your price is confirmed after a free on-site inspection and written estimate.
            {ratesAreDraft && " Calculator rates are being finalized."}
          </p>
          <div className="calc-actions">
            {project.inspectionRequested ? <p>Your inspection request was received. WeRoof will contact you to arrange a time; no appointment is booked yet.</p> : <Link className="button" href="/contact">Request a free inspection</Link>}
            <button type="button" className="calc-back" onClick={restart}>Start over</button>
          </div>
          <p className="calc-bundle">
            Planning more than one project?{" "}
            {(["roof", "siding", "gutters"] as const).filter((s) => s !== service).map((s, i) => (
              <span key={s}>{i > 0 && " · "}<Link href={calculatorPaths[s]}>Estimate {s === "roof" ? "a roof" : s}</Link></span>
            ))}
          </p>
        </div>
      ) : estimate && (
        <div className="calc-capture">
          <p className="eyebrow">YOUR ESTIMATE DETAILS ARE COMPLETE</p>
          <h2>Where should we email your PDF?</h2>
          <p className="calc-capture-intro">Your tailored {serviceName[service]} planning range, project assumptions and next steps - all in one clear report.</p>
          <div className="calc-summary"><span>Your property</span><strong>{contact.address}, MD {contact.zip}</strong><button type="button" onClick={() => { setProject({ ...project, propertyConfirmed: false }); setIndex(firstIndex); }}>Edit property</button><span>Your project</span><strong>{summary.join(" · ")}</strong><button type="button" onClick={() => setIndex(0)}>Edit roof details</button>{service === "roof" && <><strong>{project.need} · {project.timeline} · Roof age: {project.age}</strong><button type="button" onClick={() => setIndex(-1)}>Edit project needs</button></>}</div>
          <form onSubmit={submitReport} className="calc-contact-form">
            <div className="calc-field-row">
              <label>First name <input required autoComplete="given-name" maxLength={80} value={contact.firstName} onChange={(event) => setContact({ ...contact, firstName: event.target.value })} /></label>
              <label>Phone <span>{project.inspectionRequested || project.contactMethod === "Phone call" ? "(required for your request)" : "(optional)"}</span><input required={project.inspectionRequested || project.contactMethod === "Phone call"} type="tel" autoComplete="tel" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} /></label>
            </div>
            <label>Email for your PDF <input required type="email" autoComplete="email" placeholder="you@example.com" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} /></label>
            {service === "roof" && <>
              <details className="calc-refine"><summary>Personalize your follow-up (optional)</summary><div className="calc-field-row">
                {([['financing', 'Interested in Pure Finance options?'], ['priority', 'What matters most?'], ['contactMethod', 'Preferred contact method'], ['contactTime', 'Best time to contact you']] as const).map(([key, label]) => <label key={key}>{label}<select value={project[key]} onChange={(e) => setProject({ ...project, [key]: e.target.value })}>{projectChoices[key].map((value) => <option key={value}>{value}</option>)}</select></label>)}
              </div><fieldset className="calc-check-group"><legend>Also interested in</legend>{["Siding", "Gutters"].map((value) => <label className="calc-check" key={value}><input type="checkbox" checked={project.interests.includes(value as 'Siding' | 'Gutters')} onChange={(e) => setProject({ ...project, interests: e.target.checked ? [...project.interests, value as 'Siding' | 'Gutters'] : project.interests.filter((v) => v !== value) })} />{value}</label>)}</fieldset><label>Anything else we should know?<textarea rows={3} maxLength={1000} value={project.notes} onChange={(e) => setProject({ ...project, notes: e.target.value })} placeholder="Access concerns, leaks, skylights or other project details. Do not include financial or insurance account information." /></label></details>
              <label className="calc-check"><input type="checkbox" checked={project.inspectionRequested} onChange={(e) => setProject({ ...project, inspectionRequested: e.target.checked })} />Also request a free inspection. We’ll call to confirm availability; this does not book an appointment.</label>
              <p className="calc-fine">Main-home replacement range only. No aerial measurements. Additional structures, repairs and hidden damage need an inspection. Financing is subject to lender approval and current terms.</p>
            </>}
            <div className="calc-honeypot" aria-hidden="true"><label>Leave this blank<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            <div ref={widget} className="calc-turnstile" />
            {error && <p className="calc-error" role="alert">{error}</p>}
            <button type="submit" className="button calc-submit" disabled={busy}>{busy ? "Preparing and emailing your PDF..." : "Email my planning report"} <span aria-hidden="true">↗</span></button>
            <p className="calc-fine">We’ll email the requested PDF and may contact you about this project. No SMS signup. This is an illustrative planning range based on draft assumptions, not a final quote. <Link href="/privacy-policy">Privacy policy</Link>.</p>
          </form>
        </div>
      )}
    </div>
  );
}
