import { Metadata } from "next";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description: "View blog performance metrics, newsletter stats, and engagement data.",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
