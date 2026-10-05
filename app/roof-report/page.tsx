import type { Metadata } from "next";
import { OnlineRoofReport } from "@/components/OnlineRoofReport";

export const metadata: Metadata = {
  title: "Your Property Roof View",
  description: "View your property from above alongside your WeRoof planning report.",
  robots: { index: false, follow: false, nosnippet: true },
  alternates: { canonical: "/roof-report" },
};

export default function RoofReportPage() {
  return <main id="main" className="wrap roof-online-report">
    <p className="eyebrow">YOUR WEROOF PLANNING REPORT</p>
    <h1>Your home, from above.</h1>
    <p className="intro">A satellite overview to help you explore your property and plan your next step.</p>
    <OnlineRoofReport />
    <noscript><p>Enable JavaScript to load your property-specific map.</p></noscript>
  </main>;
}
