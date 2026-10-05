import type { Metadata } from "next";
import { CalculatorPage } from "@/components/CalculatorPage";

export const metadata: Metadata = {
  title: "Gutter Cost Calculator for Maryland Homes",
  description: "Get a personalized Maryland gutter cost planning report by email. Explore options, then confirm your final price with a free WeRoof inspection.",
  alternates: { canonical: "/gutter-cost-calculator" },
};

export default function Page() {
  return <CalculatorPage service="gutters" />;
}
