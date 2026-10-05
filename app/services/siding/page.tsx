import type { Metadata } from "next";
import { ServiceLanding } from "@/components/ServiceLanding";

export const metadata: Metadata = {
  title: "Siding Replacement in Maryland",
  description: "Siding replacement in Maryland, including CertainTeed Mainstreet vinyl, insulated vinyl and fiber cement. See instant price ranges and request a free WeRoof estimate.",
  alternates: { canonical: "/services/siding" },
};

export default function Page() {
  return <ServiceLanding slug="siding" />;
}
