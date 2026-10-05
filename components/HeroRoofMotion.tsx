"use client";

import { useEffect, useRef } from "react";

export function HeroRoofMotion() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const hero = layer.current?.closest<HTMLElement>(".hero");
    if (!hero) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const easeOut = (value: number) => 1 - Math.pow(1 - value, 3);
    const update = () => {
      frame = 0;
      if (document.hidden || !visible) return;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(320, Math.min(rect.height * 0.78, innerHeight * 0.9));
      const progress = reduce.matches ? 0 : clamp((110 - rect.top) / travel);
      const camera = easeOut(progress);
      const lift = easeOut(clamp((progress - 0.08) / 0.74));
      const trace = easeOut(clamp((progress - 0.22) / 0.62));
      hero.style.setProperty("--roof-camera", camera.toFixed(4));
      hero.style.setProperty("--roof-lift", lift.toFixed(4));
      hero.style.setProperty("--roof-trace", trace.toFixed(4));
      hero.dataset.scVerifyState = reduce.matches
        ? "static-roof"
        : `roof-camera:${(camera * 82).toFixed(1)};edge:${(lift * 112).toFixed(1)};trace:${trace.toFixed(2)}`;
    };
    const schedule = () => { if (!frame && visible) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); });
    observer.observe(hero);
    window.addEventListener("scroll", schedule, {passive:true});
    window.addEventListener("resize", schedule, {passive:true});
    document.addEventListener("visibilitychange", schedule);
    reduce.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      reduce.removeEventListener("change", schedule);
      hero.style.removeProperty("--roof-camera");
      hero.style.removeProperty("--roof-lift");
      hero.style.removeProperty("--roof-trace");
    };
  }, []);

  return <div ref={layer} hidden aria-hidden="true" />;
}
