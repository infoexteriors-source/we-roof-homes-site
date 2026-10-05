"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { business } from "@/lib/content";

export function MobileActions() {
  const pathname = usePathname();
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setFormVisible(visible.size > 0);
    }, { rootMargin: "-90px 0px -70px 0px" });
    document.querySelectorAll(".lead-card").forEach((form) => observer.observe(form));
    return () => observer.disconnect();
  }, [pathname]);
  return <div className="mobile-action" hidden={formVisible}><a href={`tel:${business.tel}`}>Call WeRoof</a><Link href="/contact#request-inspection">Free inspection</Link></div>;
}
