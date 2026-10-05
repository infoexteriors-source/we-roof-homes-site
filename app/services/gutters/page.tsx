import type { Metadata } from "next";
import { ServiceLanding } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Seamless Gutters in Maryland",
  description: "Seamless gutters, downspouts and gutter guards for Maryland homes. See instant price ranges and request a free WeRoof gutter estimate.",
  alternates: { canonical: "/services/gutters" },
};

export default function Page() {
  return <ServiceLanding slug="gutters" />;
}
