"use client";
import { useEffect, useState } from "react";
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
  }
}
export function track(
  event: string,
  fields: Record<string, string | number> = {},
) {
  if (localStorage.getItem("weroof-analytics") !== "yes") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...fields });
}
export function Analytics() {
  const [choice, setChoice] = useState<string | null>("pending");
  useEffect(() => setChoice(localStorage.getItem("weroof-analytics")), []);
  useEffect(() => {
    if (choice !== "yes") return;
    const id = process.env.NEXT_PUBLIC_GTM_ID;
    if (
      id &&
      /^GTM-[A-Z0-9]+$/.test(id) &&
      !document.getElementById("weroof-gtm")
    ) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const s = document.createElement("script");
      s.id = "weroof-gtm";
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
      document.head.append(s);
    }
    const call = process.env.NEXT_PUBLIC_CALLRAIL_SCRIPT_URL;
    if (
      call &&
      /^https:\/\/cdn\.callrail\.com\//.test(call) &&
      !document.getElementById("weroof-callrail")
    ) {
      const s = document.createElement("script");
      s.id = "weroof-callrail";
      s.src = call;
      s.async = true;
      document.head.append(s);
    }
  }, [choice]);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (a?.href.startsWith("tel:")) track("click_to_call");
      if (a?.pathname === "/financing") track("financing_cta");
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, []);
  if (choice !== null || !process.env.NEXT_PUBLIC_GTM_ID) return null;
  return (
    <div className="consent" role="region" aria-label="Analytics preferences">
      <p>
        May we use analytics to improve this website? Your choice won’t affect
        your inspection request.
      </p>
      <button
        onClick={() => {
          localStorage.setItem("weroof-analytics", "yes");
          setChoice("yes");
        }}
      >
        Allow analytics
      </button>
      <button
        onClick={() => {
          localStorage.setItem("weroof-analytics", "no");
          setChoice("no");
        }}
      >
        Essential only
      </button>
    </div>
  );
}
