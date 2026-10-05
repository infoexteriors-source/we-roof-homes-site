import type { Metadata } from "next";
import { CalculatorPage } from "@/components/CalculatorPage";

export const metadata: Metadata = {
  title: "Roof Cost Calculator for Maryland Homes",
  description: "Answer five quick questions and get a personalized Maryland roof cost planning report by email. Confirm your final price with a free WeRoof inspection.",
  alternates: { canonical: "/roof-cost-calculator" },
};

export default function Page() {
  return <CalculatorPage service="roof" />;
}
