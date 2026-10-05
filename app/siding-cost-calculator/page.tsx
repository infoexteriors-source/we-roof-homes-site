import type { Metadata } from "next";
import { CalculatorPage } from "@/components/CalculatorPage";

export const metadata: Metadata = {
  title: "Siding Cost Calculator for Maryland Homes",
  description: "Get a personalized Maryland siding cost planning report by email. Explore material choices, then confirm your final price with a free WeRoof inspection.",
  alternates: { canonical: "/siding-cost-calculator" },
};

export default function Page() {
  return <CalculatorPage service="siding" />;
}
