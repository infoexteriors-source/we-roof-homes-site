"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { business, commercialServices } from "@/lib/content";

const primaryServices = [
  ["Roofing", "/services/roof-replacement"],
  ["Siding", "/services/siding"],
  ["Gutters", "/services/gutters"],
] as const;

const utilityLinks = [
  ["Reviews", "/reviews"],
  ["Projects", "/projects"],
  ["Service areas", "/service-areas"],
] as const;

const pricingLinks = [
  ["Roof financing", "/financing"],
  ["Roof cost calculator", "/roof-cost-calculator"],
  ["Siding cost calculator", "/siding-cost-calculator"],
  ["Gutter cost calculator", "/gutter-cost-calculator"],
] as const;

const aboutLinks = [
  ["About WeRoof", "/about"],
  ["Contact us", "/contact"],
  ["Homeowner guides", "/resources"],
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/services/roof-replacement") {
    return pathname === href || ["roof-repair", "roof-inspection", "storm-damage", "insurance-assistance"].some((slug) => pathname === `/services/${slug}`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavDropdown({ label, items, active }: { label: string; items: readonly (readonly [string, string])[]; active: boolean }) {
  return (
    <details className="nav-group" name="primary-navigation" data-active={active}>
      <summary>{label}<span className="nav-caret" aria-hidden="true" /></summary>
      <div className="nav-panel">
        {items.map(([name, href]) => <Link key={href} href={href}>{name}</Link>)}
      </div>
    </details>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggle = useRef<HTMLButtonElement>(null);
  const desktopNav = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = desktopNav.current;
    if (!nav) return;
    const dismissOutside = (event: Event) => {
      for (const dropdown of nav.querySelectorAll<HTMLDetailsElement>("details[open]")) {
        if (event.target instanceof Node && !dropdown.contains(event.target)) dropdown.open = false;
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const dropdown = nav.querySelector<HTMLDetailsElement>("details[open]");
      if (!dropdown) return;
      dropdown.open = false;
      dropdown.querySelector("summary")?.focus();
      event.preventDefault();
    };
    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  useEffect(() => {
    desktopNav.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((dropdown) => { dropdown.open = false; });
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);

  const commercialLinks = [
    ["All commercial roofing", "/commercial-roofing"],
    ...commercialServices.map((service) => [service.title.replace(" in Maryland", ""), `/commercial-roofing/${service.slug}`]),
  ] as [string, string][];

  return (
    <>
      <div className="utility">
        <div className="wrap utility-row">
          <span className="utility-note">MARYLAND HOMES. COVERED.</span>
          <nav className="utility-links" aria-label="Quick links">
            {utilityLinks.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
          </nav>
          <a className="utility-phone" href={`tel:${business.tel}`} aria-label={`Call WeRoof at ${business.phone}`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.31.56 3.58.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.19 2.46.56 3.58a1 1 0 0 1-.25 1.01l-2.19 2.2Z"/></svg>
            {business.phone}
          </a>
        </div>
      </div>
      <header className="header">
        <div className="wrap nav-row">
          <Link href="/" className="logo" aria-label="WeRoof home">
            <Image src="/assets/weroof-logo.png" alt="WeRoof" width={194} height={210} loading="eager" sizes="80px" />
          </Link>
          <nav ref={desktopNav} aria-label="Main navigation" className="nav" onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
              event.currentTarget.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((dropdown) => { dropdown.open = false; });
            }
          }}>
            {primaryServices.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} data-active={isActive(pathname, href)}>{label}</Link>)}
            <NavDropdown label="Commercial" items={commercialLinks} active={isActive(pathname, "/commercial-roofing")} />
            <NavDropdown label="Pricing" items={pricingLinks} active={pricingLinks.some(([, href]) => isActive(pathname, href))} />
            <NavDropdown label="About" items={aboutLinks} active={aboutLinks.some(([, href]) => isActive(pathname, href))} />
          </nav>
          <Link href="/contact#request-inspection" onClick={() => setOpen(false)} className="button nav-cta">Free inspection <span aria-hidden="true">↗</span></Link>
          <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
            {open ? "×" : "☰"}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation">
            {primaryServices.map(([name, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{name}</Link>)}
            <Link href="/commercial-roofing" onClick={() => setOpen(false)}>Commercial roofing</Link>
            <Link href="/financing" onClick={() => setOpen(false)}>Pricing & financing</Link>
            <Link href="/about" onClick={() => setOpen(false)}>About WeRoof</Link>
            <div className="mobile-nav-secondary">
              {[...utilityLinks, ["Contact us", "/contact"] as const].map(([name, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{name}</Link>)}
            </div>
          </nav>
        )}
        <noscript><style>{`.menu-toggle{display:none!important}@media(max-width:1240px){.nav{display:flex!important;flex-wrap:wrap;gap:8px 18px;width:100%;order:3;margin:0;padding-bottom:12px}.nav-row{height:auto!important;min-height:80px;flex-wrap:wrap}.nav a{padding:8px 0}}`}</style></noscript>
      </header>
    </>
  );
}
