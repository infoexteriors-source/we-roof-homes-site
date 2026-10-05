"use client";

import { useEffect, useRef, useState } from "react";

// Start times (seconds) for each layer in /assets/roof-install/roof-build-*.mp4.
const steps = [
  { at: 0, title: "Framing & trusses", note: "The structure every other layer depends on." },
  { at: 1.5, title: "Roof decking", note: "Solid sheathing the rest of the roof fastens to." },
  { at: 3, title: "Metal drip edge", note: "Steers water off the edges and away from the fascia." },
  { at: 4.5, title: "Ice & water barrier", note: "Self-sealing protection at the eaves, where leaks start." },
  { at: 5.5, title: "Synthetic underlayment", note: "A water-resistant layer across the whole deck." },
  { at: 6.5, title: "Architectural shingles", note: "Laid course by course, from eave to ridge." },
  { at: 9, title: "Vents & ridge cap", note: "Ventilation at the peak so the attic can breathe." },
  { at: 10.5, title: "Gutters & downspouts", note: "Carry water off the roof and away from the foundation." },
  { at: 12, title: "Finished roof system", note: "Every layer working together, deck to ridge." },
];
const DURATION = 15;
const variants = ["split", "full", "cinema"] as const;
type Variant = (typeof variants)[number];

export function HeroRoofBuild() {
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(steps.length - 1);
  // Layout preview: ?build=split | full | cinema
  const [variant, setVariant] = useState<Variant>("split");
  useEffect(() => {
    const requested = new URLSearchParams(location.search).get("build");
    if (variants.includes(requested as Variant)) setVariant(requested as Variant);
  }, []);

  useEffect(() => {
    const el = section.current;
    const v = video.current;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!el || !v || !c || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    el.dataset.scrub = "on";
    setActive(0);
    let raf = 0;
    let visible = false;
    let target = 0;
    let shown = 0;
    let ready = false;
    let loaded = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      v.src = matchMedia("(max-width: 900px)").matches
        ? "/assets/roof-install/roof-build-854.mp4"
        : "/assets/roof-install/roof-build-1280.mp4";
      v.load();
    };
    // Frames are painted to a canvas: seeked <video> frames don't reliably repaint in Safari.
    const paint = () => {
      if (c.width !== v.videoWidth) { c.width = v.videoWidth; c.height = v.videoHeight; }
      ctx.drawImage(v, 0, 0, c.width, c.height);
    };
    const onReady = () => {
      ready = true;
      paint();
      el.dataset.videoReady = "true";
      schedule();
    };
    const progress = () => {
      // Starts building as soon as the hero begins scrolling away (or when the section
      // enters the viewport, if it starts below the fold) and ends as the pin releases.
      const rect = el.getBoundingClientRect();
      const start = Math.min(innerHeight, rect.top + scrollY);
      const end = innerHeight - rect.height;
      return Math.max(0, Math.min(1, (start - rect.top) / Math.max(1, start - end)));
    };
    const tick = () => {
      raf = 0;
      const p = progress();
      target = p * (DURATION - 0.05);
      shown += (target - shown) * 0.25;
      if (Math.abs(target - shown) < 0.01) shown = target;
      if (ready && !v.seeking && Math.abs(v.currentTime - shown) > 1 / 48) v.currentTime = shown;
      let index = 0;
      for (let i = 0; i < steps.length; i++) if (shown >= steps[i].at) index = i;
      setActive(index);
      el.style.setProperty("--build-progress", p.toFixed(4));
      el.dataset.scVerifyState = `build:${p.toFixed(2)};t:${shown.toFixed(2)};step:${index}`;
      if (shown !== target || Math.abs(v.currentTime - shown) > 1 / 48) schedule();
    };
    function schedule() {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    }

    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) load(); }, { rootMargin: "100% 0px" });
    const onScreen = new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); });
    near.observe(el);
    onScreen.observe(el);
    v.addEventListener("loadeddata", onReady, { once: true });
    v.addEventListener("seeked", paint);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      near.disconnect();
      onScreen.disconnect();
      v.removeEventListener("loadeddata", onReady);
      v.removeEventListener("seeked", paint);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      delete el.dataset.scrub;
    };
  }, []);

  return (
    <section ref={section} className="hero-build" data-variant={variant} aria-labelledby="hero-build-title">
      <div className="hero-build-stage">
        <div className="hero-build-media" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/roof-install/roof-build-end.jpg" alt="" className="hero-build-poster" />
          <video ref={video} muted playsInline preload="none" poster="/assets/roof-install/roof-build-start.jpg" tabIndex={-1} disablePictureInPicture />
          <canvas ref={canvas} width={1280} height={720} />
        </div>
        <div className="wrap hero-build-copy">
          <p className="eyebrow">How we build your roof</p>
          <h2 id="hero-build-title">Every layer,{" "}<br />in the right order.</h2>
          <ol className="hero-build-steps">
            {steps.map((step, i) => (
              <li key={step.title} className={i === active ? "is-active" : i < active ? "is-done" : undefined}>
                <span className="hero-build-num">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{step.title}</strong>
                  <em>{step.note}</em>
                </span>
              </li>
            ))}
          </ol>
          <div className="hero-build-bar" aria-hidden="true"><span /></div>
          <p className="hero-build-count" aria-hidden="true">
            <span>{String(active + 1).padStart(2, "0")}</span> / {String(steps.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}
