// Loaded only near the diagram on motion-capable desktop viewports.
export function startRoofMotion(
  el: HTMLElement,
  frame: HTMLElement | null,
  isManual: () => boolean,
  setActive: (index: number) => void,
) {
  let raf = 0;
  let stage = -1;
  el.dataset.animated = "true";
  const update = () => {
    raf = 0;
    const rect = el.getBoundingClientRect();
    const p = Math.max(
      0,
      Math.min(1, (88 - rect.top) / (rect.height - window.innerHeight + 88)),
    );
    const amount = isManual()
      ? 1
      : Math.max(0, Math.min(1, p / 0.23, (1 - p) / 0.15));
    el.style.setProperty("--explode", String(amount));
    const next = Math.min(3, Math.floor(p * 4));
    if (next !== stage && !isManual()) {
      stage = next;
      setActive([0, 2, 5, 6][next]);
    }
    if (frame)
      frame.dataset.scVerifyState = `layers:${amount.toFixed(2)};stage:${next}`;
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    cancelAnimationFrame(raf);
    el.dataset.animated = "false";
    el.style.setProperty("--explode", "1");
  };
}
